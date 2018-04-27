'use strict';

const Module = require('./Module.js');
const fs = require('fs');

class DeadlyRunners extends Module {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, process.env['DEADLY_RUNNERS'], 'Deadly Runners', {
            prefix: '&dr',
            statusMessage: 'Deadly Runners Ready'
        });

        this.shortName = 'drunners';

        this.regex = /^ ?([^,]+), ?([^,]+), <@(.+)>/

        this.bot.settings.getModule(this.shortName).then((settings) => {
            this.settings = settings;
        });
    }

    onMessage(message) {
        if(!message.author.bot) {
            if(message.channel.id == this.settings.Channel) {
                let match = message.content.match(this.regex);
                if(match) {
                    if(message.attachments.size != 1) {
                        message.delete();
                    }
                    else {
                        let imageURL = message.attachments.first().url;
                        this.bot.settings.createBuild(message.id, match[1], match[2], match[3], imageURL, new Date())
                        message.react('👑').then(() =>
                            message.react('🗄️').then(() =>
                                message.react('🆔')));                     
                    }
                }
            }
        }
    }

    onMessageReactionAdd(messageReaction, user) {
        if(!user.bot && messageReaction.message.channel.id == this.settings.Channel) {
            if(user.id == '156962731084349442') {
                if(messageReaction.emoji.name == 'crown') {
                    
                }
                else if(messageReaction.emoji.name == 'file_cabinet') {

                }
            }
            if(messageReaction.emoji.name == 'id') {

            }
            else if(messageReaction.emoji.name == 'riven') {
                
            }
        }
    }

    onMessageReactionRemove(messageReaction, user) {
        if(!user.bot && messageReaction.message.channel.id == this.settings.Channel) {
            if(messageReaction.emoji.name == 'crown') {

            }
            if(messageReaction.emoji.name == 'file_cabinet') {

            }
        }
    }

    onMessageReactionRemoveAll(message) {
        if(message.channel.id == this.settings.Channel) {
            message.delete();
            
        }
    }

    onMessageDelete(message) {
        if(!message.author.bot && message.channel.id == this.settings.Channel) {
            
        }
    }

    onMessageDeleteBulk(messages) {
        messages.map(currentValue => {
            
        });
    }

    onMessageUpdate(oldMessage, newMessage) {
        if (oldMessage.channel.id == this.settings.Channel && !oldMessage.author.bot) {
            let match = newMessage.content.match(this.regex);
            if(!match) {

            }
            else {
                
            }
        }
    }

    onReadyExtra() {
        let guild = this.client.guilds.get(this.settings.Guild);
        let channel = guild.channels.get(this.settings.Channel);
        channel.fetchMessages({ limit: 100 })
            .then((messages) => {
                this.logger.debug(`Received ${messages.size} messages from ${this.name}`);
                if (messages.size < 2) {
                    this.logger.debug(`Under 2 messages found in ${this.name}. Deleting and re-sending info text.`);
                    messages.deleteAll();
                    const path = './docs/drunners_channel.md';
                    if (fs.existsSync(path)) {
                        try {
                            fs.readFile(path, function (err, data) {
                                if (err) throw err;
                                this.send(data.toString());
                            }.bind(channel));
                        } catch (err) {
                            this.bot.logger.error(err);
                        }
                    }
                }
            })
            .catch((error) => this.bot.logger.error(error));
        this.client.user.setStatus('invisible');
    }
}

module.exports = DeadlyRunners;