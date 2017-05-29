'use strict';

const Discord = require('discord.js');

class Module {
    /**
     * 
     * @param {string} discordToken 
     * @param {Cephalon} bot 
     * @param {string} name 
     * @param {Object} [options]
     * @param {number} [options.shardId]
     * @param {number} [options.shardCount]
     * @param {string} [options.prefix]
     */
    constructor(bot, discordToken, name, { shardId = 0, shardCount = 1, prefix = process.env.PREFIX, statusMessage = null } = {}) {
        /**
         * @type {Cephalon}
         */
        this.bot = bot;

        /**
         * @type {string}
         */
        this.name = name;

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
        this.logger = this.bot.logger;

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
         * @type {boolean}
         */
        this.readyToExecute = false;

        /**
         * @type {string}
         */
        this.owner = this.bot.owner;

        /**
         * @type {string}
         */
        this.statusMessage = statusMessage;

        /**
         * @type {Database}
         */
        this.settings = this.bot.settings;

        this.setupHandlers();
    }

    setupHandlers() {
        this.client.on('ready', () => this.onReady());
        this.client.on('message', message => this.onMessage(message));

        this.client.on('disconnect', (event) => {
            this.logger.fatal(`Disconnected with close event: ${event.code}`);
        });

        this.client.on('guildMemberAdd', (member) => this.onGuildMemberAdd(member));

        this.client.on('presenceUpdate', (oldMember, newMember) => this.onPresenceUpdate(oldMember, newMember));

        this.client.on('error', error => this.logger.error(error));
        this.client.on('warn', warning => this.logger.warning(warning));

        this.client.on('messageReactionAdd', (messageReaction, user) => this.onMessageReactionAdd(messageReaction, user));
        this.client.on('messageReactionRemove', (messageReaction, user) => this.onMessageReactionRemove(messageReaction, user));
        this.client.on('messageReactionRemoveAll', (message) => this.onMessageReactionRemoveAll(message));
        
        this.client.on('messageDelete', (message) => this.onMessageDelete(message));
        this.client.on('messageDeleteBulk', (messages) => this.onMessageDeleteBulk(messages));
        this.client.on('messageUpdate', (oldMessage, newMessage) => this.onMessageUpdate(oldMessage, newMessage));
    }

    start() {
        this.client.login(this.token)
            .then(() => {
                this.logger.info(`${this.name} Logged in!`);
            }).catch((e) => {
                this.logger.error(e.message);
                this.logger.fatal(e);
            });
    }

    onReady() {
        this.logger.info(`${this.client.user.username} ready!`);
        this.logger.info(`Bot: ${this.client.user.username}#${this.client.user.discriminator}`);
        if (this.statusMessage) {
            this.client.user.setGame(this.statusMessage);
        }
        this.readyToExecute = true;
        this.onReadyExtra();
    }

    onMessage() {

    }

    onGuildMemberAdd() {

    }

    onPresenceUpdate() {

    }

    onMessageReactionAdd() {

    }

    onMessageReactionRemove() {

    }

    onMessageReactionRemoveAll() {
        
    }

    onMessageDelete() {

    }

    onMessageDeleteBulk() {

    }

    onMessageUpdate() {
        
    }

    onReadyExtra() {
        
    }
}

module.exports = Module;