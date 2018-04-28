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

        this.regex = /^ ?([^,]+), ?([^,]+), <@!(\d+)>/;

        this.userid = '156962731084349442';

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
            if (message.channel.id == this.settings.channel || message.channel.type == 'dm' && (message.startsWith(this.prefix) && message.author.id == this.userid)) {
                let messageWStrippedContent = message;
                messageWStrippedContent.strippedContent = message.content.replace(this.prefix, '');
                if (/^ ?(?:set)?riven/i.test(messageWStrippedContent)) {
                    this.setRiven(messageWStrippedContent);
                }
            }
        }
    }

    addReactionSuite(message) {
        return new Promise((resolve) => {
            message.react('👑').then(() =>
                message.react('🆔').then(() =>
                    resolve(message.react('📁'))
                )
            );
        });
    }

    onMessageReactionAdd(messageReaction, user) {
        if (!user.bot && messageReaction.message.channel.id == this.settings.Channel) {
            if (messageReaction.emoji.name == '👑') {
                if (user.id == this.userid) {
                    this.bot.settings.designateBestBuild(messageReaction.message.id).then((results) => {
                        results.map((currentValue) => {
                            if (currentValue.MessageID != messageReaction.message.id) {
                                messageReaction.message.channel.fetchMessage(currentValue.MessageID).then((message) => {
                                    let reaction = message.reactions.find(val => val.emoji.name == 'crown');
                                    reaction.users.map((x) => {
                                        if (!x.bot) reaction.remove(x);
                                    });
                                });
                            }
                        });
                    }).catch(e => this.logger.error(e));
                }
                else {
                    messageReaction.remove(user);
                }
            }
            else if (messageReaction.emoji.name == '📁') {
                if (user.id == this.userid) {
                    this.bot.settings.setArchived(messageReaction.message.id, 1).then(() => {
                        messageReaction.message.reactions.map((reaction) => {
                            if (reaction.emoji.name != '📁') {
                                reaction.fetchUsers().then((users) => {
                                    users.map((x) => {
                                        reaction.remove(x);
                                    });
                                });
                            }
                        });
                    }).catch(e => this.logger.error(e));
                }
                else {
                    messageReaction.remove(user);
                }
            }
            else if (messageReaction.emoji.name == '🆔') {
                this.bot.settings.fetchBuildByMessageID(messageReaction.message.id).then((build) => {
                    user.send(`Build "${build.Title}" submitted by <@${build.UserID}> has ID ${build.ID}`);
                    messageReaction.remove(user);
                }).catch(e => this.bot.logger.error(e));
            }
            else if (messageReaction.emoji.name == 'riven') {
                this.bot.settings.fetchBuildByMessageID(messageReaction.message.id).then((build) => {
                    if (build.Riven == null) throw 'noriven';
                    user.send(build.Riven);
                    messageReaction.remove(user);
                }).catch((e) => {
                    if (e == 'noriven') {
                        user.send('No Riven found for build');
                        messageReaction.remove(user);
                    }
                    else this.logger.error(e);
                });
            }
            else {
                messageReaction.remove(user);
            }
        }
    }

    onMessageReactionRemove(messageReaction, user) {
        if (!user.bot && messageReaction.message.channel.id == this.settings.Channel && user.id == this.userid) {
            if (messageReaction.emoji.name == '👑') {
                this.bot.settings.setNotBestByMessageID(messageReaction.message.id)
                    .catch(e => this.bot.logger.error(e));
            }
            if (messageReaction.emoji.name == '📁') {
                this.bot.settings.setArchived(messageReaction.message.id, 0).then(() => {
                    messageReaction.message.clearReactions().then((message) => {
                        this.addReactionSuite(message);
                    });
                }).catch(e => this.bot.logger.error(e));
            }
        }
    }

    onMessageDelete(message) {
        if (!message.author.bot && message.channel.id == this.settings.Channel) {
            this.bot.settings.fetchBuildByMessageID(message.id).then((build) => {
                this.bot.settings.setArchived(message.id, 1).then(() => {
                    message.author.send(`Build ${build.ID} was archived because the message was deleted. If this is in error, contact Mardan`);
                    this.logger.info(`Build ${build.ID} was archived due to deletion of message.`);
                });
            }).catch(e => this.bot.logger.error(e));
        }
    }

    onMessageDeleteBulk(messages) {
        this.logger.info(`Cataclysmic bulk deletion of messages in #deadlyrunners, ${messages.size} builds archived`);
        messages.map(currentValue => {
            this.onMessageDelete(currentValue);
        });
    }

    onMessageUpdate(oldMessage, newMessage) {
        if (oldMessage.channel.id == this.settings.Channel && !oldMessage.author.bot) {
            let match = newMessage.content.match(this.regex);
            if (!match) {
                this.bot.settings.fetchBuildByMessageID(oldMessage.id).then((build) => {
                    this.bot.settings.setArchived(oldMessage.id, 1).then(() => {
                        oldMessage.author.send(`Updated message for ${build.ID} does not fit pattern. Archiving build until message is amended.`);
                        this.logger.info(`Build ${build.ID} was archived due to lack of pattern matching.`);
                        newMessage.clearReactions().then((message) => {
                            message.react('📁');
                        });
                    });
                }).catch(e => this.bot.logger.error(e));
            }
            else {
                this.bot.settings.updateBuild(newMessage.id, match[1], match[2], match[3]).then((build) => {
                    newMessage.author.send(`Updated build ${build.ID} for updated message successfully!`);
                }).catch(e => this.bot.logger.error(e));
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
                else {
                    messages.map((message) => {
                        message.createReactionCollector(() => true, { time: 15000 });
                    });
                }
            })
            .catch((error) => this.logger.error(error));
        this.client.user.setStatus('invisible');
    }

    //Commands

    setRiven(message) {
        let regex = /^ ?(?:set)?riven (\d+)/i;
        let match = regex.match(message);
        if (message.attachments.size == 1) {
            this.bot.settings.fetchBuildByID(match[1]).then((build) => {
                this.bot.settings.setRiven(build.ID, message.attachments.first().url).then(() => {
                    message.author.send('Riven set!');
                    let guild = this.client.guilds.get(this.settings.Guild);
                    let channel = guild.channels.get(this.settings.Channel);
                    channel.fetchMessage(build.MessageID).then((x) => {
                        x.react(message.guild.emojis.find('name', 'riven'));
                    });
                });
            });
        }
        else {
            message.channel.send(`Too many or too few attachments, found ${message.attachments.size}`);
        }
    }
}

module.exports = DeadlyRunners;