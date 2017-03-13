'use strict';

class MessageManager {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        this.client = bot.client;
        this.logger = bot.logger;
        this.settings = bot.settings;
        this.owner = bot.owner;
        this.zSWC = '\u200B';
    }

    /**
     * @param {Message} message
     * @param {string} content
    */
    sendMessage(message, content) {
        const promises = [];
        if (message.channel.type === 'text' || message.channel.type === 'dm') {
            promises.push(message.channel.sendMessage(`${this.zSWC}${content}`));
        }
        promises.forEach(promise => promise.catch(this.logger.error));
    }

    /**
     * @param {Message} message
     * @param {string} content
    */
    replyMessageRetPromise(message, content) {
        if (message.channel.type === 'text' || message.channel.type === 'dm') {
            return message.channel.sendMessage(`${this.zSWC}${content}`);
        }
        return null;
    }

    /**
     * @param {Message} message
     * @param {Object} embed
    */
    embed(message, embed) {
        const promises = [];
        if (message.channel.type === 'text' || message.channel.type === 'dm') {
            promises.push(message.channel.sendEmbed(embed));
        }
        promises.forEach(promise => promise.catch(this.logger.error));
    }
}

module.exports = MessageManager;