'use strict';

/**
 * @typedef {Object} CommandOptions
 * @property {string} prefix
 * @property {string} regexPrefix
 * @property {CommandHandler} commandHandler
 * @property {MarkdownSettings} markdownSettings
*/

class Command {
    /**
     * @param {Cephalon} bot
     * @param {string}   id
     * @param {string}   call
     * @param {string}   description
    */
    constructor(bot, id, call, description) {
        /**
         * @type {string}
        */
        this.id = id;
        this.call = call;
        /**
         * @type {RegExp}
        */
        this.regex = new RegExp(`^${call}s?$`, 'i');
        /**
         * @type {string}
        */
        this.usages = [
            { description, parameters: [] },
        ];

        /**
         * @type {Logger}
         * @private
        */
        this.logger = bot.logger;

        /**
         * @type {Cephalon}
        */
        this.bot = bot;

        /**
         * @type {string}
        */
        this.zSWC = '\u200B';

        /**
         * @type {CommandHandler}
        */
        this.commandHandler = bot.commandHandler;

        /**
         * @type {Boolean}
        */
        this.ownerOnly = false;

        /**
         * @type {short}
        */
        this.requiredRank = 1;

        /**
         * @type {Boolean}
        */
        this.allowDM = true;
    }

    /**
     * @param {Message} message
    */
    run(message) {
        message.reply('This is a basic Command')
            .then((msg) => {
                this.logger.debug(`Sent ${msg}`);
            })
            .catch((error) => {
                this.logger.error(`Error: ${error}`);
            });
    }
}

module.exports = Command;