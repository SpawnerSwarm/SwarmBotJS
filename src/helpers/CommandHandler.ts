import * as fs from "fs";
import * as path from "path";
import decache from "decache";
import Cephalon from "../Cephalon";
import Logger from "./Logger";
import Command from "../objects/Command";
import { Message } from "discord.js";
import { MessageWithStrippedContent } from "../objects/Types";

export default class CommandHandler {
    private bot: Cephalon;
    private get logger(): Logger {
        return this.bot.logger;
    }
    public commands: Command[] = [];

    constructor(bot: Cephalon) {
        this.bot = bot;
    }

    loadCommands(): void {
        const commandDir = path.join(__dirname, '..', 'commands');
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

        this.logger.debug(`Loading commands: ${files.join(', ')}`);

        this.commands = files.map((f) => {
            console.log(f);
            try {
                const Cmd = require(path.join(commandDir, f)).default;
                const command = new Cmd(this.bot);
                this.logger.debug(`Adding ${command.id}`);
                return command;
            } catch (err) {
                this.logger.error(err);
                return null;
            }
        })
            .filter(c => c !== null);
    }

    async handleCommand(message: Message) {
        let content = message.content;
        const botping = `@${this.bot.client.user.username}`;
        if (!content.startsWith(this.bot.prefix) && !content.startsWith(botping)) {
            return;
        }
        if (content.startsWith(this.bot.prefix)) {
            content = content.replace(this.bot.prefix, '');
        }
        if (content.startsWith(botping)) {
            content = content.replace(new RegExp(`${botping}\\s+`, 'i'), '');
        }
        const messageWithStrippedContent = message as MessageWithStrippedContent;
        messageWithStrippedContent.strippedContent = content;
        this.logger.debug(`Handling \`${content}\``);
        this.commands.forEach(async command => {
            if (command.regex.test(content) && (command.mandatoryWords === undefined || command.mandatoryWords.test(content))) {
                const canAct: boolean = await this.checkCanAct(command, messageWithStrippedContent);
                if (canAct) {
                    this.logger.debug(`Matched ${command.id}`);
                    const reaction = await message.react('🔄');
                    message.channel.startTyping();
                    let result: boolean;
                    try {
                        result = await command.run(messageWithStrippedContent);
                        message.channel.stopTyping();
                    } catch (e) {
                        result = false;
                    }
                    await reaction.remove();
                    message.react(result ? '✅' : '🆘');
                }
            }
        });
    }

    async checkCanAct(command: Command, message: Message): Promise<boolean> {
        if (message.channel.type === 'text' || (message.channel.type === 'dm' && command.allowDM)) {
            try {
                const member = await this.bot.db.getMember(message.author.id);
                if (!command.ownerOnly || message.author.id === this.bot.owner) {
                    if (member.Banned === true) {
                        message.channel.send('You are currently banned from using commands. Please contact Mardan to rectify this.');
                        this.logger.warning(`User ${member.Name} tried to use command ${command.id} but is banned`);
                        return false;
                    }
                    else {
                        if (command.requiredRank === 0) {
                            return true;
                        } else {
                            if (command.requiredRank <= member.Rank) {
                                return true;
                            } else {
                                message.channel.send('You lack the privileges to perform that action');
                                this.logger.warning(`User ${member.Name} tried to use command ${command.id} but is too low of rank.`);
                                return false;
                            }
                        }
                    }
                } else {
                    message.channel.send('This command is restricted to the bot owner.');
                    return false;
                }
            } catch(err) {
                this.logger.error(err);
                message.channel.send(`\`Error: ${err}\``);
                return false;
            };
        }
        else {
            message.channel.send('This command cannot be perofrmed in DMs');
            this.logger.warning(`User ${message.author.username} tried to use command ${command.id} but it is disallowed in DMs`);
            return false;
        }
    }
}