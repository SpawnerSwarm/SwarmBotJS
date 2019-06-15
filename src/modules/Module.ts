import Cephalon from "../Cephalon";
import { Client, Snowflake, Message, GuildMember, MessageReaction, User, Collection } from "discord.js";
import Logger from "../helpers/Logger";
import Database, { DBModule } from "../helpers/Database";

export default class Module {
    private token: string;
    public client: Client;
    public bot: Cephalon;
    public get logger(): Logger {
        return this.bot.logger;
    }
    public get owner(): Snowflake {
        return this.bot.owner;
    }
    public get db(): Database {
        return this.bot.db;
    }

    public name: string;
    public shardId: number;
    public shardCount: number;
    public prefix: string;
    public statusMessage: string;

    public escapedPrefix: string;
    public ready: boolean;

    public shortName: string;
    public regex: RegExp;
    public settings: DBModule;

    protected _tsoverrideregex(match: RegExpMatchArray | null): match is RegExpMatchArray {
        return true;
    }

    constructor(bot: Cephalon, discordToken: string, name: string, { shardId = 0, shardCount = 1, prefix = process.env.PREFIX as string, statusMessage = '' } = {}) {
        this.bot = bot;

        this.name = name;

        this.client = new Client({
            ws: {
                compress: true,
                large_threshold: 1000,
            },
            shardId,
            shardCount,
        });

        this.shardId = shardId;
        this.shardCount = shardCount;

        this.token = discordToken;

        this.prefix = prefix;
        
        this.escapedPrefix = prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        this.ready = false;

        this.statusMessage = statusMessage;

        this.setupHandlers();
    }

    private setupHandlers(): void {
        this.client.on('ready', () => this.onReady());
        this.client.on('message', message => this.onMessage(message));

        this.client.on('disconnect', (event) => {
            this.logger.fatal(`Disconnected with close event: ${event.code}`);
        });

        this.client.on('guildMemberAdd', (member) => this.onGuildMemberAdd(member));

        this.client.on('presenceUpdate', (oldMember, newMember) => this.onPresenceUpdate(oldMember, newMember));

        this.client.on('error', error => this.logger.error(error.message));
        this.client.on('warn', warning => this.logger.warning(warning));

        this.client.on('messageReactionAdd', (messageReaction, user) => this.onMessageReactionAdd(messageReaction, user));
        this.client.on('messageReactionRemove', (messageReaction, user) => this.onMessageReactionRemove(messageReaction, user));
        this.client.on('messageReactionRemoveAll', (message) => this.onMessageReactionRemoveAll(message));
        
        this.client.on('messageDelete', (message) => this.onMessageDelete(message));
        this.client.on('messageDeleteBulk', (messages) => this.onMessageDeleteBulk(messages));
        this.client.on('messageUpdate', (oldMessage, newMessage) => this.onMessageUpdate(oldMessage, newMessage));
    }

    private start(): void {
        this.client.login(this.token)
            .then(() => {
                this.logger.info(`${this.name} Logged in!`);
            }).catch((e) => {
                this.logger.error(e.message);
                this.logger.fatal(e);
            });
    }

    private onReady(): void {
        this.logger.info(`${this.client.user.username} ready!`);
        this.logger.info(`Bot: ${this.client.user.username}#${this.client.user.discriminator}`);
        if (this.statusMessage) {
            this.client.user.setPresence({
                status: 'online',
                afk: false,
                game: {
                    name: this.statusMessage
                }
            });
        }
        this.ready = true;
        this.onReadyExtra();
    }

    onMessage(message: Message) {

    }

    onGuildMemberAdd(member: GuildMember) {

    }

    onPresenceUpdate(oldMember: GuildMember, newMember: GuildMember) {

    }

    onMessageReactionAdd(messageReaction: MessageReaction, user: User) {

    }

    onMessageReactionRemove(messageReaction: MessageReaction, user: User) {

    }

    onMessageReactionRemoveAll(message: Message) {
        
    }

    onMessageDelete(message: Message) {

    }

    onMessageDeleteBulk(messages: Collection<string, Message>) {

    }

    onMessageUpdate(oldMessage: Message, newMessage: Message) {
        
    }

    onReadyExtra() {
        
    }
}