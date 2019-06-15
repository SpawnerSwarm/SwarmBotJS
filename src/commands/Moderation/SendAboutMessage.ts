import Command from "../../objects/Command";
import * as fs from "fs";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent, GuildTextChannel } from "../../objects/Types";
import { Permissions, TextChannel, BufferResolvable, Attachment } from "discord.js";

export default class SendAboutMessage extends Command {
    private queue: {
        message: string,
        file: BufferResolvable | undefined
    }[];

    constructor(bot: Cephalon) {
        super(bot, 'moderation.aboutmessage', 'sendaboutmessage');

        this.requiredRank = 7;
        this.ownerOnly = true;
    }


    async run(message: MessageWithStrippedContent) {
        this.queue = [];
        const channel = message.guild.channels.find(x => x.name == 'about-this-server') as GuildTextChannel;
        await channel.bulkDelete(20);
        const permissions = channel.permissionsFor(this.bot.client.user);
        if (!permissions || !permissions.has(Permissions.FLAGS.SEND_MESSAGES as number)) {
            message.channel.send('Unable to send about message. Insufficient permissions.');
            return false;
        }
        if (fs.existsSync('./docs/about-this-server.md')) {
            try {
                fs.readFile('./docs/about-this-server.md', async (err, data: Buffer) => {
                    if (err) throw err;
                    message.react('✅');
                    let str = data.toString();
                    let formattedStr = str.split('\\split');
                    if (formattedStr.length > 0) {
                        for (let i = 0; i < formattedStr.length; i++) {
                            formattedStr[i] = formattedStr[i].replace('\\split', '');
                            formattedStr[i] = formattedStr[i].replace(/\\t/g, '    ');
                            if (formattedStr[i].startsWith('\\')) {
                                let match = formattedStr[i].match(/^\\(.+)(?:\n|\r\n)/) as RegExpMatchArray;
                                this.enqueueForSend(formattedStr[i].replace(`\\${match[1]}`, ''), `./src/resources/about-this-server/${match[1]}`);
                            }
                            else this.enqueueForSend(formattedStr[i]);
                        }
                        await this.send(channel);
                    }
                    else {
                        channel.send('Could not read file');
                        return false;
                    }
                });
            } catch (err) {
                this.logger.error(err);
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    enqueueForSend(message: string, file: BufferResolvable | undefined = undefined) {
        this.queue.push({ message: message, file: file });
    }

    async send(chan: TextChannel): Promise<void> {
        for (let i = 0; i < this.queue.length; i++) {
            const obj = this.queue[i];
            if(!obj) break;

            const file = obj.file !== undefined ? new Attachment(obj.file) : undefined;
            await chan.send(obj.message, file);
            i++;
        }
    }
}