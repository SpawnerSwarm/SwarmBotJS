'use strict';

const Module = require('../Module.js');
const fs = require('fs');

class Bazaar extends Module {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot, token, name, shortName, args) {
        super(bot, token, name, args);

        this.shortName = shortName;

        this.regex = /[[(](WTS|WTB)[\])] ?([[(]NN[\])] ?)?[[(]([$0-9]+)((?: ?[kmbtq])?(?: ?(?:CR|CE|Plat|Platinum|p|<:Crown:318234064941350912>|<:Platinum:230528518147145731>|<:Energy:318527974557089792>|<:CrownFlat:318536338934857728>) ?)?)[\])]([^[(\])]+)/i;
        
        this.bot.settings.getModule(this.shortName).then((settings) => {
            this.settings = settings;
        });
    }

    onMessage(message) {
        if (!message.author.bot) {
            if (message.channel.id == this.settings.Channel) {
                if (message.content.startsWith(this.prefix) || message.content.startsWith(this.bot.prefix)) {
                    message.delete();
                    return;
                }
                let match = message.content.match(this.regex);
                if (match) {
                    let nn = null;
                    if (match[2] == '[NN] ') nn = 1;
                    this.bot.settings.createListing(message.id, match[1], nn, match[3], match[4], match[5].substring(1), this.shortName);
                    message.react(message.guild.emojis.find('name', 'Shop')).then(() =>
                        message.react(message.guild.emojis.find('name', 'Disconnect')));
                } else {
                    message.author.send(`Thank you for your submission to the ${this.name}! Unfortunately, your submittion has been removed because it did not match the proper formatting. Please consult the channel information for proper formatting guides. If you beleive this was in error, please contact Mardan.`);
                    message.delete();
                }
            }
        }
    }

    onMessageReactionAdd(messageReaction, user) {
        if (!user.bot && messageReaction.message.channel.id == this.settings.Channel) {
            if (messageReaction.message.author.id == user.id) {
                if (messageReaction.emoji.name == 'Disconnect') {
                    this.bot.settings.closeListing(messageReaction.message.id);
                    messageReaction.message.delete();
                } else {
                    messageReaction.remove(user.id);
                }
            } else {
                if (messageReaction.emoji.name == 'Shop') {
                    this.bot.settings.createOffer(messageReaction.message.id, user.id);
                    this.bot.settings.getListing(messageReaction.message.id).then((listing) => {
                        let type;
                        /*eslint-disable indent*/
                        switch (listing.Type) {
                            case 'WTB': type = 'sell'; break;
                            case 'WTS': type = 'buy'; break;
                        }
                        /*eslint-enable indent*/
                        messageReaction.message.author.send(`User ${user.username} has made an offer on your [${listing.Type}] ${listing.Item} listed at ${listing.Price}${listing.Currency}`);
                        if (listing.NonNegotiable) {
                            user.send(`Your offer to ${type} a ${listing.Item} listed at ${listing.Price}${listing.Currency} has been created.
This message is being sent to inform you that the listing price has been marked as [NN] (Non-negotiable). Please remove your offer if you are not comfortable with the listed price.`);
                        }
                    });
                }
                else {
                    messageReaction.remove(user.id);
                }
            }
        }
    }

    onMessageReactionRemove(messageReaction, user) {
        if (!user.bot && messageReaction.message.channel.id == this.settings.Channel) {
            if (messageReaction.emoji.name == 'Shop') {
                this.bot.settings.getOffers(messageReaction.message.id).then((offers) => {
                    if (offers.find(x => x.ID == user.id)) {
                        this.bot.settings.closeOffer(messageReaction.message.id, user.id);
                        this.bot.settings.getListing(messageReaction.message.id).then((listing) => {
                            user.send(`Your offer on [${listing.Type}] ${listing.Item} for ${listing.Price}${listing.Currency} was canceled because you removed your reaction`);
                        });
                    }
                });
            }
        }
    }

    onMessageReactionRemoveAll(message) {
        if (message.channel.id == this.settings.Channel) {
            message.delete();
            this.bot.settings.getListing(message.id).then((listing) => {
                message.author.send(`Your listing of [${listing.Type}] ${listing.Item} for ${listing.Price}${listing.Currency} was terminated because offers were removed`);
            });
            this.bot.settings.closeListing(message.id);
        }
    }

    onMessageDelete(message) {
        if (!message.author.bot && message.channel.id == this.settings.Channel) {
            this.bot.settings.getListing(message.id).then((listing) => {
                message.author.send(`Your listing of [${listing.Type}] ${listing.Item} for ${listing.Price}${listing.Currency} was terminated either by yourself or a moderator.`);
            }).catch(() => { });
            this.bot.settings.closeListing(message.id);
        }
    }

    onMessageDeleteBulk(messages) {
        messages.forEach((message) => {
            if (message.channel.id == this.settings.Channel && !message.author.bot) {
                this.bot.settings.getListing(message.id).then((listing) => {
                    message.author.send(`Your listing of [${listing.Type}] ${listing.Item} for ${listing.Price}${listing.Currency} was terminated by a bulk message removal.`);
                });
            }
        }, this);
    }

    onMessageUpdate(oldMessage, newMessage) {
        if (oldMessage.channel.id == this.settings.Channel && !oldMessage.author.bot) {
            let match = newMessage.content.match(this.regex);
            if (!match) {
                this.bot.settings.getListing(newMessage.id).then((listing) => {
                    newMessage.author.send(`Your listing of [${listing.Type}] ${listing.Item} for ${listing.Price}${listing.Currency} was terminated by an invalid listing update.`);
                });
                this.bot.settings.closeListing(newMessage.id);
                newMessage.delete();
            }
            else {
                let nn = null;
                if (match[2] == '[NN] ') nn = 1;
                this.bot.settings.updateListing(newMessage.id, match[1], nn, match[3], match[4], match[5].substring(1), this.shortName);
                this.bot.settings.getOffers(newMessage.id).then((offers) => {
                    offers.forEach((offer) => {
                        newMessage.guild.fetchMember(offer.ID).then((member) => {
                            member.send(`${newMessage.author.username} has updated one of their listings you previously made an offer on. Please take a moment and review your offers`);
                        });
                    });
                });
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
                    const path = './docs/bazaar.md';
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
            .catch(this.bot.logger.error);
        this.client.user.setStatus('invisible');
    }
}

module.exports = Bazaar;