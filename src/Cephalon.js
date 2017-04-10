'use strict';

const CommandHandler = require('./CommandHandler.js');
const Discord = require('discord.js');
const md = require('node-md-config');
const WorldStateCache = require('./WorldStateCache.js');
const Database = require('./settings/Database.js');
const MessageManager = require('./settings/MessageManager');
const request = require('request');

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

        this.messageManager = new MessageManager(this);

        this.commandHandler.loadCommands();

        this.setupHandlers();

        this.guildMailURL = process.env.GM_URL;
    }

    setupHandlers() {
        this.client.on('ready', () => this.onReady());
        this.client.on('message', message => this.onMessage(message));

        this.client.on('channelCreate', channel => this.onChannelCreate(channel));
        this.client.on('channelDelete', channel => this.onChannelDelete(channel));

        this.client.on('disconnect', (event) => {
            this.logger.debug(`Disconnected with close event: ${event.code}`);
            process.exit(4);
        });

        this.client.on('guildMemberAdd', (member) => {
            if (member.guild.id == 137991656547811328 || member.guild.id == 157978818466807808) {
                member.guild.channels.get(`${member.guild.id}`).sendMessage(`Greetings <@${member.id}>! Welcome to the Swarm!\nPlease read the guild mail at https://1drv.ms/b/s!AnyOF5dOdoX0v0iXHyVMBfggyOqy and ask a Veteran or above if you have any questions!`);
            }
        });

        this.client.on('error', error => this.logger.error(error));
        this.client.on('warn', warning => this.logger.warning(warning));
    }

    start() {
        this.client.login(this.token)
            .then(() => {
                this.logger.debug('Logged in!');
            }).catch((e) => {
                this.logger.error(e.message);
                this.logger.fatal(e);
                process.exit(1);
            });
    }

    onReady() {
        this.logger.debug(`${this.client.user.username} ready!`);
        this.logger.debug(`Bot: ${this.client.user.username}#${this.client.user.discriminator}`);
        this.client.user.setGame(this.statusMessage);
        this.readyToExecute = true;
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
                let match = message.content.match(/([^ ]{1,3})?\[\[(.+)\]\]/i);
                let wiki;
                /*eslint-disable indent*/
                switch (match[1]) {
                    case 'wf': wiki = {url: 'http://warframe.wikia.com/wiki/', name: 'Warframe'}; break;
                    case 'ds': wiki = {url: 'http://darksouls.wiki.fextralife.com/', name: 'Dark Souls 1'}; break;
                    case 'ds1': wiki = {url: 'http://darksouls.wiki.fextralife.com/', name: 'Dark Souls 1'}; break;
                    case 'ds2': wiki = {url: 'http://darksouls2.wiki.fextralife.com/', name: 'Dark Souls 2'}; break;
                    case 'ds3': wiki = {url: 'http://darksouls3.wiki.fextralife.com/', name: 'Dark Souls 3'}; break;
                    case 'sk': wiki = {url: 'http://wiki.spiralknights.com/', name: 'Spiral Knights'}; break;
                    case 'poe': wiki = {url: 'http://pathofexile.gamepedia.com/', name: 'Path of Exile'}; break;
                    case 'hs': wiki = {url: 'http://hearthstone.gamepedia.com/', name: 'Hearthstone'}; break;
                    default: wiki = {url: 'http://warframe.wikia.com/wiki/', name: 'Warframe'}; break;
                }
                /*eslint-enable-indent*/
                request.head(`${wiki.url}${match[2]}`, (error, response) => {
                    if (response.statusCode != 404 && response.statusCode != 400) {
                        message.channel.sendMessage(`${wiki.url}${match[2].replace(' ', '_')}`);
                    } else {
                        message.channel.sendMessage(`Could not find page requested on ${wiki.name} wiki`);
                    }
                });
            }
            this.commandHandler.handleCommand(message);
        }
    }

    /**
     * @param {Channel} channel
    */
    onChannelCreate(channel) {
        if (channel.type === 'voice') {
            return;
        }
        if (channel.type === 'text') {
            return;
        } else {
            return;
        }
    }

    onChannelDelete(channel) {
        if (channel.type === 'voice') {
            return;
        }
        this.settings.deleteChannel(channel).then(() => {
            return;
        }).catch(this.logger.error);
    }
}

module.exports = Cephalon;