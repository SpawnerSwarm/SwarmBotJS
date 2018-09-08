import * as request from "request";

import Logger from "./helpers/Logger";
import { Snowflake, Client, Message, Role, TextChannel, GroupDMChannel, DMChannel, GuildMember, Channel } from "discord.js";
import Database from "./helpers/Database";
import CommandHandler from "./helpers/CommandHandler";
import WorldStateCache from "./helpers/WorldStateCache";
import Module from "./modules/Module";

import { UrlResolvable, GuildTextChannel } from "./objects/Types.d";
import Ranks from "./objects/Ranks.on";
import Modules from "/etc/swarmbot/modules.on";
import { SKEmote, default as SKEmotes } from "./objects/SpiralKnightsEmotes.on"
import { PathLike } from "fs";

export default class Cephalon {
    private token: string;
    public prefix: string;
    public owner: Snowflake;
    public shardId: number;
    public shardCount: number;
    public guildMailUrl: UrlResolvable;
    
    public logger: Logger;
    public client: Client;
    public ch: CommandHandler;
    public db: Database;
    public wfws: WorldStateCache;

    public escapedPrefix: string;
    public ready: boolean;
    public statusMessage: string;

    public modulePaths: PathLike[];
    public modules: Module[];

    constructor(
        token: string,
        logger: Logger,
        options: {
            shardId: number | string,
            shardCount: number | string,
            prefix: string,
            owner: Snowflake
        }
    ) {
        this.token = token;
        this.logger = logger;
        this.prefix = options.prefix;
        this.owner = options.owner as Snowflake;
        
        this.shardId = options.shardId as number;
        this.shardCount = options.shardCount as number;

        this.client = new Client({
            ws: {
                compress: true,
                large_threshold: 1000
            },
            shardId: this.shardId,
            shardCount: this.shardId
        });

        this.escapedPrefix = options.prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        this.statusMessage = `Type ${options.prefix}help for help.`;

        this.db = new Database({
            host: process.env.MYSQL_HOST as UrlResolvable,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER as string,
            password: process.env.MYSQL_PASSWORD as string,
            database: process.env.MYSQL_DB as string
        }, this);

        const worldStateTimeout = process.env.WORLDSTATE_TIMEOUT;

        this.wfws = new WorldStateCache(Number(worldStateTimeout as string), logger);
        
        this.ch = new CommandHandler(this);
        this.ch.loadCommands();

        this.setupHandlers();

        this.guildMailUrl = process.env.GM_URL as UrlResolvable;

        this.modulePaths = Modules.modules;
        this.modules = [];
    }

    public static _checkChannelIsText(channel: DMChannel | GroupDMChannel | TextChannel, id: Snowflake): channel is TextChannel {
        return channel.id === id;
    }

    private setupHandlers(): void {
        this.client.on('ready', this.onReady.bind(this));
        this.client.on('message', this.onMessage.bind(this));
        
        this.client.on('disconnect', (e) => {
            this.logger.fatal(`Disconnected with close event: ${e.code}`);
            process.exit(4);
        });
        
        this.client.on('guildMemberAdd', (member) => {
            if(member.guild.id as Snowflake === String(137991656547811328) || member.guild.id as Snowflake === String(157978818466807808)) {
                (member.guild.channels.get(`${member.guild.id}`) as GuildTextChannel).send(`Greetings <@${member.id}>! Welcome to the Swarm!\nPlease read the guild mail at ${this.guildMailUrl} and ask a Veteran or above if you have any questions!`);
            }
        });
        
        this.client.on('presenceUpdate', this.onPresenceUpdate.bind(this));
        
        this.client.on('error', this.logger.error.bind(this));
        this.client.on('warning', this.logger.warning.bind(this));
    }
    
    public start(): void {
        this.client.login(this.token)
            .then(() => {
                this.logger.info('Logged in!');
            }).catch((e) => {
                this.logger.error(e.message);
                this.logger.fatal(e);
                process.exit(1);
            })
    }
    
    private onReady(): void {
        this.logger.info(`${this.client.user.username} ready!`);
        this.logger.info(`Bot: ${this.client.user.username}#${this.client.user.discriminator}`);
        this.client.user.setPresence({
            status: 'online',
            afk: false,
            game: {
                name: this.statusMessage,
                url: process.env.SOURCE
            }
        });
        this.ready = true;
        for (let i = 0; i < this.modulePaths.length; i++) {
            const ModuleClass = require(`${Modules.root}${this.modulePaths[i]}`).default;
            let Module = new ModuleClass(this);
            Module.start();
            this.modules.push(Module);
        }
    }

    private onMessage(message: Message): void {
        if (this.ready && !message.author.bot) {
            if (Cephalon._checkChannelIsText(message.channel, '137991656547811328') || Cephalon._checkChannelIsText(message.channel, '165649798551175169') || Cephalon._checkChannelIsText(message.channel, '157978818466807808')) {
                if (message.attachments.array().length > 0 || message.embeds.length > 0) {
                    if (message.member.roles.find('name', 'Certified Weeb') != null) {
                        message.react(message.guild.emojis.find('name', 'Weeb'));
                    }
                }
            }
            if (message.content.match(/\[\[.+\]\]/)) {
                let match: RegExpExecArray;
                let regex = /([^ ]{1,3})?\[\[([^\]]+)\]\]/g;
                let i = 0;
                while ((match = regex.exec(message.content) as RegExpExecArray) !== null && i < 5) {
                    this.logger.debug(`Found wiki match in message, ${i}: ${match[2]}`);
                    let wiki: {
                        url: UrlResolvable,
                        name: string,
                        char: string
                    };
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
                if (i >= 5) {
                    message.channel.send('Messages cannot contain more than 5 wiki calls');
                }
            }
            if (message.content.match(/@everyone/)) {
                if (Cephalon._checkChannelIsText(message.channel, '137996862211751936') || Cephalon._checkChannelIsText(message.channel, '250077586695258122') || Cephalon._checkChannelIsText(message.channel, '137996873913860097')) {
                    let title = message.channel.name.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

                    message.channel.send(`You seem to be using an 'everyone' mention in a game-specific channel.\nIf your message was specifically related to this game, please use the '${title}' mention instead.\nIf your message was more general, please consider using the <#${message.guild.defaultChannel.id}> channel instead!`);
                    this.logger.info(`Warned ${message.author.username} against using the @everyone mention in #${message.channel.name}`);
                }
            }
            if (message.content.match(/@here/)) {
                if(Cephalon._checkChannelIsText(message.channel, '137996862211751936')) {
                    let title: string | undefined; //TODO: fix https://stackoverflow.com/questions/51007234/typescript-inline-static-type-guard
                    switch(message.channel.name) {
                        case 'warframe':
                            title = 'wfhere';
                    }

                    message.channel.send(`You seem to be using a 'here' mention in a game-specific channel.\nIf your message was specifically related to this game, please use the '${title as string}' mention instead.\nIf your message was more general, please consider using the <#${message.guild.defaultChannel.id}> channel instead!`);
                    this.logger.info(`Warned ${message.author.username} against using the @here mention in #${message.channel.name}`);
                }
            }
            if (message.content.match(/<@&438837282783363092>|@wfhere/i)) {
                if (message.guild && message.guild.roles.has('138054399950848000')) {
                    message.guild.fetchMembers().then((guild) => {
                        let members = (guild.roles.get('138054399950848000') as Role).members
                            .filter(member => member.presence.status == 'online' || member.presence.status == 'idle');
                        let memberMap = members.map(member => ` <@${member.id}>`);
                        let reducer = (accumulator: string, currentValue: string) => {
                            return accumulator.concat(currentValue);
                        };
                        let msg = `Mentioning currently-online Warframe members${memberMap.reduce(reducer, ':')}`;
                        message.channel.send(msg);
                    });
                }
            }
            else if (message.content.startsWith('/')) {
                let msg = message.cleanContent.substring(1);
                try {
                    SKEmotes.forEach(function (x: SKEmote) {
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
            this.ch.handleCommand(message);
        }
    }

    private onPresenceUpdate(oldMember: GuildMember, newMember: GuildMember): void {
        if (process.env.SHOULD_PESTER != '0' && oldMember.presence.status == 'offline' && newMember.presence.status == 'online' && newMember.guild.id == '137991656547811328') {
            let checkReadyForRankup = (dateStr: string | Date, compDate: number | undefined, breakOnNull: boolean, member) => {
                if (dateStr === null && breakOnNull) {
                    return false;
                }
                let one = 1000 * 60 * 60 * 24;
                let today = new Date();

                const date = new Date(dateStr);

                let dateDiff = Math.floor((today.valueOf() - date.valueOf()) / one);
                if (member.Rank === 7) {
                    return false;
                }
                else if (dateDiff >= (compDate as number)) {
                    return true;
                } else {
                    return false;
                }
            };
            this.db.getMember(newMember.id).then((member) => {
                if (member.Rank > 3 || member.Ally || member.Banned) { return; }
                if (checkReadyForRankup(member[Ranks[member.Rank].name], Ranks[member.Rank].last, true, member)) {
                    if (checkReadyForRankup(member.LastPestered, 7, false, member)) {
                        if (member.LastPesteredIndex < 3) {
                            newMember.send(`Hello, ${member.Name}! This is an automated message from the Spawner Swarm to remind you that you're ready to take your rankup test!\nPlease be sure to review the rankup procedure in the guildmail (${this.guildMailUrl}) and ask an Officer+ to administer your test!\nThis message will only be sent 3 times for each pending rank.`);
                            this.db.setLastPestered(member.ID);
                            (this.client.channels.get('165649798551175169')as TextChannel).send(`<@&137992918957817856> Sent <@${member.ID}> a rankup notification.\n Last pestered on ${member.LastPestered}.`);
                            this.logger.info(`Sent ${member.Name} a rankup notification.`);
                        }
                    }
                }
            }).catch(() => null);
        }
        /*let r = Math.floor(Math.random() * Math.floor(200));
        if(r == 0) {
            this.client.channels.get('137996862211751936').send('', {files: ['./src/resources/k.png']}).then((message) => {
                message.delete(3000);
            }).catch((err) => this.logger.error(err));
        }*/
    }
}