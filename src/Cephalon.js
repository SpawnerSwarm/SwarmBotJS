'use strict';

const CommandHandler = require('./CommandHandler.js');
const Discord = require('discord.js');
const md = require('node-md-config');
const WorldStateCache = require('./WorldStateCache.js');
const Database = require('./settings/Database.js');
const request = require('request');
const Ranks = require('./resources/Ranks.js');
const SKEmotes = require('./resources/SpiralKnightsEmotes.js');
const Modules = require('./modules/modules.json');
const pkg = require('../package.json');

/**
 * @typedef {Object.<string>} MarkdownSettings
 * @property {string} lineEnd      - Line return character
 * @property {string} blockEnd     - Block end string
 * @property {string} doubleReturn - Double line return string
 * @property {string} linkBegin    - Link begin string
 * @property {string} linkMid      - Link middle string
 * @property {string} linkEnd      - Link end string
 * @property {string} bold         - String for denoting bold text
 * @property {string} italic       - String for denoting italicized text
 * @property {string} underline    - String for denoting underlined text
 * @property {string} strike       - String for denoting striked-through text
 * @property {string} codeLine     - String for denoting in-line code
 * @property {string} codeBlock    - String for denoting multi-line code blocks
 */

class Cephalon {
    /**
     * @param  {string}           discordToken         The token used to authenticate with Discord
     * @param  {Logger}           logger               The logger object
     * @param  {Object}           [options]            Bot options
     * @param  {number}           [options.shardId]    The shard ID of this instance
     * @param  {number}           [options.shardCount] The total number of shards
     * @param  {string}           [options.prefix]     Prefix for calling the bot
     * @param  {MarkdownSettings} [options.mdConfig]   The markdown settings
     */
    constructor(discordToken, logger, { shardId = 0, shardCount = 1, prefix = process.env.PREFIX,
        mdConfig = md, owner = null } = {}) {

        /**
         * @type {Discord.Client}
         * @private
        */
        this.client = new Discord.Client({
            fetchAllMembers: true,
            ws: {
                compress: true,
                large_threshold: 1000,
            },
            shardId,
            shardCount,
        });

        this.shardId = shardId;
        this.shardCount = shardCount;

        /**
         * @type {string}
         * @private
        */
        this.token = discordToken;

        /**
         * @type {Logger}
         * @private
        */
        this.logger = logger;

        /**
         * @type {string}
         * @private
        */
        this.escapedPrefix = prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        /**
         * @type {string}
         * @private
        */
        this.prefix = prefix;

        /**
         * @type {MarkdownSettings}
         * @private
        */
        this.md = mdConfig;

        /**
         * @type {boolean}
        */
        this.readyToExecute = false;

        /**
         * @type {CommandHandler}
         * @private
        */
        this.commandHandler = new CommandHandler(this);

        /**
         * @type {string}
        */
        this.owner = owner;

        /**
         * @type {string}
        */
        this.statusMessage = `Type ${prefix}help for help`;

        /**
         * @type {Database}
        */
        this.settings = new Database({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
        }, this);

        const worldStateTimeout = process.env.WORLDSTATE_TIMEOUT;

        /**
         * @type {Object.<WorldStateCache>}
        */
        this.worldState = new WorldStateCache(worldStateTimeout);

        this.commandHandler.loadCommands();

        this.setupHandlers();

        this.guildMailURL = process.env.GM_URL;

        this.modulePaths = Modules.modules;

        this.modules = [];
    }

    setupHandlers() {
        this.client.on('ready', () => this.onReady());
        this.client.on('message', message => this.onMessage(message));

        this.client.on('disconnect', (event) => {
            this.logger.fatal(`Disconnected with close event: ${event.code}`);
            process.exit(4);
        });

        this.client.on('guildMemberAdd', (member) => {
            if (member.guild.id == 137991656547811328 || member.guild.id == 157978818466807808) {
                member.guild.channels.get(`${member.guild.id}`).send(`Greetings <@${member.id}>! Welcome to the Swarm!\nPlease read the guild mail at ${this.guildMailURL} and ask a Veteran or above if you have any questions!`);
            }
        });

        this.client.on('presenceUpdate', (oldMember, newMember) => this.onPresenceUpdate(oldMember, newMember));

        this.client.on('error', error => this.logger.error(error));
        this.client.on('warn', warning => this.logger.warning(warning));
    }

    start() {
        this.client.login(this.token)
            .then(() => {
                this.logger.info('Logged in!');
            }).catch((e) => {
                this.logger.error(e.message);
                this.logger.fatal(e);
                process.exit(1);
            });
    }

    onReady() {
        this.logger.info(`${this.client.user.username} ready!`);
        this.logger.info(`Bot: ${this.client.user.username}#${this.client.user.discriminator}`);
        this.client.user.setActivity(this.statusMessage, {url: pkg.repository, type: Discord.ActivityType.LISTENING});
        this.readyToExecute = true;
        for (let i = 0; i < this.modulePaths.length; i++) {
            const ModuleClass = require(`${Modules.root}${this.modulePaths[i]}`);
            let Module = new ModuleClass(this);
            Module.start();
            this.modules.push(Module);
        }
    }

    /**
     * @param {Message} message
    */
    onMessage(message) {
        if (this.readyToExecute && !message.author.bot) {
            if (message.channel.id === '137991656547811328' || message.channel.id === '165649798551175169' || message.channel.id === '157978818466807808') {
                if (message.attachments.array().length > 0 || message.embeds.length > 0) {
                    if (message.member.roles.find('name', 'Certified Weeb') != null) {
                        message.react(message.guild.emojis.find('name', 'Weeb'));
                    }
                }
            }
            if (message.content.match(/\[\[.+\]\]/)) {
                //let match = message.content.match(/([^ ]{1,3})?\[\[(.+)\]\]/i);
                let match;
                let regex = /([^ ]{1,3})?\[\[([^\]]+)\]\]/g;
                let i = 0;
                while((match = regex.exec(message.content)) !== null && i < 5) {
                    this.logger.debug(`Found match in message, ${i}: ${match[2]}`);
                    let wiki;
                    /*eslint-disable indent*/
                    switch (match[1]) {
                        case 'wf': wiki = { url: 'http://warframe.wikia.com/wiki/', name: 'Warframe', char: '_' }; break;
                        case 'ds': wiki = { url: 'http://darksouls.wiki.fextralife.com/', name: 'Dark Souls 1', char: '+' }; break;
                        case 'ds1': wiki = { url: 'http://darksouls.wiki.fextralife.com/', name: 'Dark Souls 1', char: '+' }; break;
                        case 'ds2': wiki = { url: 'http://darksouls2.wiki.fextralife.com/', name: 'Dark Souls 2', char: '+' }; break;
                        case 'ds3': wiki = { url: 'http://darksouls3.wiki.fextralife.com/', name: 'Dark Souls 3', char: '+' }; break;
                        case 'sk': wiki = { url: 'http://wiki.spiralknights.com/', name: 'Spiral Knights', char: '_' }; break;
                        case 'poe': wiki = { url: 'http://pathofexile.gamepedia.com/', name: 'Path of Exile', char: '_' }; break;
                        case 'hs': wiki = { url: 'http://hearthstone.gamepedia.com/', name: 'Hearthstone', char: '_' }; break;
                        default: wiki = { url: 'http://warframe.wikia.com/wiki/', name: 'Warframe', char: '_' }; break;
                    }
                    /*eslint-enable-indent*/
                    request.head(`${wiki.url}${match[2]}`, function (error, response) {
                        if (response.statusCode != 404 && response.statusCode != 400) {
                            message.channel.send(`${wiki.url}${this.replace(/ /g, wiki.char)}`);
                        } else {
                            message.channel.send(`Could not find page requested on ${wiki.name} wiki`);
                        }
                    }.bind(match[2]));
                    i++;
                }
                if(i >= 5) {
                    message.channel.send('Messages cannot contain more than 5 wiki calls');
                }
            }
            if (message.content.match(/@everyone/)) {
                if (message.channel.id === '137996862211751936' || message.channel.id === '250077586695258122' || message.channel.id == '137996873913860097') {
                    let title = message.channel.name.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

                    message.channel.send(`You seem to be using an 'everyone' mention in a game-specific channel.\nIf your message was specifically related to this game, please use the '${title}' mention instead.\nIf your message was more general, please consider using the <#${message.guild.defaultChannel.id}> channel instead!`);
                    this.logger.info(`Warned ${message.author.username} against using the @everyone mention in #${message.channel.name}`);
                }
            }
            else if (message.content.startsWith('/')) {
                let msg = message.cleanContent.substring('1');
                try {
                    SKEmotes.forEach(function (x) {
                        let regex = new RegExp(`^(?:${x.command})(?: (.+)|$)`, 'i');
                        let match = msg.match(regex);
                        if (!match) {
                            return false;
                        } else {
                            if (match[1] && x.partner) {
                                message.channel.send(x.partner.replace('%1', message.author.username).replace('%2', match[1]).replace('@', '@ '));
                            } else {
                                message.channel.send(x.content.replace('%1', message.author.username).replace('@', '@ '));
                            }
                            message.delete();
                        }
                    }.bind(this));
                }
                catch (e) {
                    this.logger.error(e);
                }
            }
            this.commandHandler.handleCommand(message);
        }
    }

    onPresenceUpdate(oldMember, newMember) {
        if (oldMember.presence.status == 'offline' && newMember.presence.status == 'online' && newMember.guild.id == '137991656547811328') {
            let checkReadyForRankup = (date, compDate, breakOnNull, member) => {
                if (date === null && breakOnNull) {
                    return false;
                }
                let one = 1000 * 60 * 60 * 24;
                let today = new Date();

                date = new Date(date);

                let dateDiff = Math.floor((today - date) / one);
                if (member.Rank === 7) {
                    return false;
                }
                else if (dateDiff >= compDate) {
                    return true;
                } else {
                    return false;
                }
            };
            this.settings.getMember(newMember.id).then((member) => {
                if (member.Rank > 3 || member.Ally === 1 || member.Banned === 1) { return; }
                if (checkReadyForRankup(member[Ranks[member.Rank].name], Ranks[member.Rank].last, true, member)) {
                    if (checkReadyForRankup(member.LastPestered, 7, false, member)) {
                        if (member.LastPesteredIndex < 3) {
                            newMember.send(`Hello, ${member.Name}! This is an automated message from the Spawner Swarm to remind you that you're ready to take your rankup test!\nPlease be sure to review the rankup procedure in the guildmail (${this.guildMailURL}) and ask an Officer+ to administer your test!\nThis message will only be sent 3 times for each pending rank.`);
                            this.settings.setLastPestered(member.ID);
                            this.client.channels.get('165649798551175169').send(`<@&137992918957817856> Sent <@${member.ID}> a rankup notification.\n Last pestered on ${member.LastPestered}.`);
                            this.logger.debug(`Sent ${member.Name} a rankup notification.`);
                        }
                    }
                }
            }).catch(() => null);
        }
        let r = Math.floor(Math.random() * Math.floor(10));
        this.logger.debug(r);
        if(r == 0) {
            this.client.channels.get('137996862211751936').send('', {files: ['./src/resources/k.png']}).then((message) => {
                message.delete(1000);
            }).catch((err) => this.logger.error(err));
        }
    }
}

module.exports = Cephalon;