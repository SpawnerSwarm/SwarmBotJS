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
    private i: number;

    constructor(bot: Cephalon) {
        super(bot, 'moderation.aboutmessage', 'sendaboutmessage');

        this.requiredRank = 7;
        this.ownerOnly = true;
    }


    run(message: MessageWithStrippedContent) {
        this.queue = [];
        this.i = 0;
        let channel = message.guild.channels.find(x => x.name == 'about-this-server') as GuildTextChannel;
        channel.bulkDelete(20);
        if (!channel.permissionsFor(this.bot.client.user).has(Permissions.FLAGS.SEND_MESSAGES as number)) {
            return;
        }
        if (fs.existsSync('./docs/about-this-server.md')) {
            try {
                fs.readFile('./docs/about-this-server.md', function (err, data: Buffer) {
                    if (err) throw err;
                    this.msg.react('✅');
                    let str = data.toString();
                    let formattedStr = str.split('\\split');
                    if (formattedStr.length > 0) {
                        for (let i = 0; i < formattedStr.length; i++) {
                            formattedStr[i] = formattedStr[i].replace('\\split', '');
                            formattedStr[i] = formattedStr[i].replace(/\\t/g, '    ');
                            if (formattedStr[i].startsWith('\\')) {
                                let match = formattedStr[i].match(/^\\(.+)(?:\n|\r\n)/) as RegExpMatchArray;
                                this.q(formattedStr[i].replace(`\\${match[1]}`, ''), `./src/resources/about-this-server/${match[1]}`);
                            }
                            else this.q(formattedStr[i]);
                        }
                        this.s(this.channel);
                    }
                    else {
                        this.channel.send('Could not read file');
                    }
                }.bind({ msg: message, channel: channel, q: this.enqueueForSend, send: this.send, queue: this.queue, i: this.i }));
            } catch (err) {
                this.logger.error(err);
            }
        }
    }

    enqueueForSend(message: string, file: BufferResolvable | undefined) {
        this.queue.push({ message: message, file: file });
    }

    send(chan: TextChannel) {
        if (this.queue[this.i]) {
            const file = this.queue[this.i].file;
            chan.send(this.queue[this.i].message, file !== undefined ? new Attachment(file) : undefined ).then(() => {
                this.i++;
                this.send(chan);
            });
        }
    }
}