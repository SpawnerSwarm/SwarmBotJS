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

        this.regex = /^ ?([^,]+), ?([^,]+), <@(.+)>/;

        this.bot.settings.getModule(this.shortName).then((settings) => {
            this.settings = settings;
        });
    }

    onMessage(message) {
        if (!message.author.bot) {
            if (message.channel.id == this.settings.Channel) {
                let match = message.content.match(this.regex);
                if (match) {
                    if (message.attachments.size != 1) {
                        message.author.send(`Message was deleted due to too few or too many attachments (found ${message.attachments.size})`);
                        message.delete();
                    }
                    else {
                        let imageURL = message.attachments.first().url;
                        this.bot.settings.createBuild(message.id, match[1], match[2], match[3], imageURL, new Date());
                        this.addReactionSuite(message);
                    }
                }
                else {
                    message.delete();
                }
            }
        }
    }

    addReactionSuite(message) {
        return new Promise((resolve) => {
            resolve(message.react('👑').then((r, resolve) =>
                resolve(message.react('🗄️').then((r, resolve) =>
                    resolve(message.react('🆔'))
                ))
            ));
        });
    }

    onMessageReactionAdd(messageReaction, user) {
        if (!user.bot && messageReaction.message.channel.id == this.settings.Channel) {
            if (user.id == '156962731084349442') {
                if (messageReaction.emoji.name == 'crown') {
                    this.bot.settings.designateBestBuild(messageReaction.message.id).then((results) => {
                        results.map((currentValue) => {
                            messageReaction.message.channel.fetchMessage(currentValue.MessageID).then((message) => {
                                let reaction = message.reactions.find(val => val.emoji.name == 'crown');
                                reaction.users.map((user) => {
                                    if (!user.bot) reaction.remove(user);
                                });
                            });
                        });
                    }).catch(e => this.logger.error(e));
                }
                else if (messageReaction.emoji.name == 'file_cabinet') {
                    this.bot.settings.setArchived(messageReaction.message.id, 1).then(() => {
                        messageReaction.message.clearReactions().then((message) => {
                            message.react('🗄️');
                        });
                    }).catch(e => this.logger.error(e));
                }
            }
            if (messageReaction.emoji.name == 'id') {
                this.bot.settings.fetchBuildByMessageID(messageReaction.message.id).then((build) => {
                    user.send(`Build "${build.Title}" submitted by <@${build.UserID}> has ID ${build.ID}`);
                }).catch(e => this.bot.logger.error(e));
            }
            else if (messageReaction.emoji.name == 'riven') {
                this.bot.settings.fetchBuildByMessageID(messageReaction.message.id).then((build, resolve, reject) => {
                    if (build.Riven == null) reject('noriven');
                    user.send(build.Riven);
                }).catch((e) => {
                    if (e === 'noriven') {
                        user.send('No Riven found for build');
                        messageReaction.remove();
                    }
                    else this.logger.error(e);
                })
            }
        }
    }

    onMessageReactionRemove(messageReaction, user) {
        if (!user.bot && messageReaction.message.channel.id == this.settings.Channel) {
            if (messageReaction.emoji.name == 'crown') {

            }
            if (messageReaction.emoji.name == 'file_cabinet') {

            }
        }
    }

    onMessageReactionRemoveAll(message) {
        if (message.channel.id == this.settings.Channel) {
            message.delete();

        }
    }

    onMessageDelete(message) {
        if (!message.author.bot && message.channel.id == this.settings.Channel) {

        }
    }

    onMessageDeleteBulk(messages) {
        messages.map(currentValue => {

        });
    }

    onMessageUpdate(oldMessage, newMessage) {
        if (oldMessage.channel.id == this.settings.Channel && !oldMessage.author.bot) {
            let match = newMessage.content.match(this.regex);
            if (!match) {

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
                            this.logger.error(err);
                        }
                    }
                }
            })
            .catch((error) => this.logger.error(error));
        this.client.user.setStatus('invisible');
    }
}

module.exports = DeadlyRunners;