'use strict';

const fs = require('fs');
const path = require('path');
const decache = require('decache');

class CommandHandler {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        this.bot = bot;
        this.logger = bot.logger;

        /**
         * @type {Array<Command>}
         * @private
        */
        this.commands = [];
    }

    loadCommands() {
        const commandDir = path.join(__dirname, 'commands');
        let files = fs.readdirSync(commandDir);

        const categories = files.filter(f => f.indexOf('.js') === -1);
        files = files.filter(f => f.indexOf('.js') > -1);

        categories.forEach((category) => {
            files = files.concat(fs.readdirSync(path.join(commandDir, category))
                .map(f => path.join(category, f)));
        });

        if (this.commands.length !== 0) {
            this.logger.debug('Decaching commands');
            files.forEach((f) => {
                decache(path.join(commandDir, f));
            });
        }

        this.logger.debug(`Loading commands: ${files}`);

        this.commands = files.map((f) => {
            try {
                const Cmd = require(path.join(commandDir, f));
                if (Object.prototype.toString.call(Cmd) === '[object Function]') {
                    const command = new Cmd(this.bot);

                    this.logger.debug(`Adding ${command.id}`);
                    return command;
                }
                return null;
            } catch (err) {
                this.logger.error(err);
                return null;
            }
        })
            .filter(c => c !== null);
    }

    /**
     * @param {Message} message
    */
    handleCommand(message) {
        let content = message.content;
        const botping = `@${this.bot.client.user.username}`;
        this.bot.settings.getPrefix()
            .then((prefix) => {
                if (!content.startsWith(prefix) && !content.startsWith(botping)) {
                    return;
                }
                if (content.startsWith(prefix)) {
                    content = content.replace(prefix, '');
                }
                if (content.startsWith(botping)) {
                    content = content.replace(new RegExp(`${botping}\\s+`, 'i'), '');
                }
                const messageWithStrippedContent = message;
                messageWithStrippedContent.strippedContent = content;
                this.logger.debug(`Handling \`${content}\``);
                this.commands.forEach((command) => {
                    if (command.regex.test(content)) {
                        this.checkCanAct(command, messageWithStrippedContent)
                            .then((canAct) => {
                                if (canAct) {
                                    this.logger.debug(`Matched ${command.id}`);
                                    command.run(messageWithStrippedContent);
                                }
                            });
                        //.catch(this.logger.error);
                    }
                });
            });
            //.catch(this.logger.error);
    }

    /**
     * @param {Command} command
     * @param {Message} message
     * @returns {boolean}
    */
    checkCanAct(command, message) {
        return new Promise((resolve) => {
            this.bot.settings.getMember(message.author.id).then((member) => {
                if (command.requiredRank <= member.Rank) {
                    if (!command.ownerOnly || message.author.id === this.bot.owner) {
                        resolve(true);
                    } else {
                        message.channel.sendMessage('This command is restricted to the bot owner.');
                    }
                } else {
                    message.channel.sendMessage('You lack the privileges to perform that action.');
                }
            }).catch((err) => {
                this.logger.error(err);
                this.bot.messageManager.sendMessage(message, `\`Error: ${err}\``);
            });
        });
    }
}

module.exports = CommandHandler;