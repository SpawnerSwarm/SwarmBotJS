'use strict';

const Command = require('../../Command.js');
const Discord = require('discord.js');
const fs = require('fs');

class SendAboutMessage extends Command {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, 'moderation.aboutmessage', 'sendaboutmessage');

        this.requiredRank = 7;
        this.ownerOnly = true;
    }


    run(message) {
        this.queue = [];
        this.i = 0;
        let channel = message.guild.channels.find(x => x.name == 'about-this-server');
        channel.bulkDelete(20);
        if (!channel.permissionsFor(this.bot.client.user.id).has(Discord.Permissions.FLAGS.SEND_MESSAGES)) {
            return;
        }
        if (fs.existsSync('./docs/about-this-server.md')) {
            try {
                fs.readFile('./docs/about-this-server.md', function (err, data) {
                    if (err) throw err;
                    this.msg.react('✅');
                    let str = data.toString();
                    let formattedStr = str.split('\\split');
                    if (formattedStr.length > 0) {
                        for (let i = 0; i < formattedStr.length; i++) {
                            formattedStr[i] = formattedStr[i].replace('\\split', '');
                            formattedStr[i] = formattedStr[i].replace(/\\t/g, '    ');
                            if (formattedStr[i].startsWith('\\')) {
                                let match = formattedStr[i].match(/^\\(.+)(?:\n|\r\n)/);
                                this.q(formattedStr[i].replace(`\\${match[1]}`, ''), [`./src/resources/about-this-server/${match[1]}`]);
                            }
                            else this.q(formattedStr[i]);
                        }
                        this.s(this.channel);
                    }
                    else {
                        this.channel.send('Could not read file');
                    }
                }.bind({ msg: message, channel: channel, q: this.enqueueForSend, s: this.send, _q: this.queue, i: this.i }));
            } catch (err) {
                this.bot.logger.error(err);
            }
        }
    }

    enqueueForSend(message, files = null) {
        this._q.push({ message: message, files: files });
    }

    send(chan) {
        if (this._q[this.i]) {
            chan.send(this._q[this.i].message, { files: this._q[this.i].files }).then(() => {
                this.i++;
                this.s(chan);
            });
        }
    }
}

module.exports = SendAboutMessage;