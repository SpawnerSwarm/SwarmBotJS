'use strict';

const Command = require('../../Command.js');

const EmoteEmbed = require('../../embeds/EmoteEmbed.js');

class Emotes extends Command {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, 'core.emotes', 'emotes');

        this.regex = new RegExp('^(?:emote(?:s)?|e)?( list| create| new)?( .+)?$', 'i');
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        let match = message.strippedContent.match(this.regex);
        if (match[1] === ' list') {
            this.list(message, match);
        }
        else if (match[1] === ' create' || match[1] === ' new') {
            this.create(message, match);
        }
        else if (match[2] != undefined) {
            this.get(message, match);
        }
        else {
            this.bot.messageManager.sendMessage(message, '-** !{initialCommandUsed}** -- Display this text.\n-** !{initialCommandUsed}** (ref) -- Return the emote matching the ref.\n-** !{initialCommandUsed} list (page)** -- List all emotes.\n-** !{initialCommandUsed} create*/new* (name) (reference) (requiredRank) (content) (creator)** -- Create a new Emote.');
        }
    }

    list(message, match) {
        let page = parseInt(match[2]);
        if (isNaN(page)) {
            page = 1;
        }
        this.bot.settings.getEmoteList(page).then((emotes) => {
            let text = `Page ${page}. To move to the next page, use **!e list ${page + 1}**`;
            let overrideAuthor = false;
            if (message.channel.type === 'dm') {
                overrideAuthor = true;
            }
            this.bot.messageManager.sendMessage(message, text);
            this.fetchEmoteCreators(emotes).then((creators) => {
                for (var i = 0; i < emotes.length; i++) {
                    if (overrideAuthor) {
                        creators[i] = this.bot.client.user;
                    }
                    else {
                        this.bot.messageManager.embed(message, new EmoteEmbed(this.bot, emotes[i], creators[i]));
                    }
                }
            });
        })
            .catch((err) => {
                this.bot.logger.error(err);
                this.bot.messageManager.sendMessage(message, 'http://i.imgur.com/zdMAeE9.png');
            });
    }

    fetchEmoteCreators(emotes) {
        return new Promise((resolve) => {
            let creators = [];
            for (var i = 0; i < emotes.length; i++) {
                this.bot.client.fetchUser(emotes[i].Creator).then((user) => {
                    creators.push(user);
                    if (creators.length == emotes.length) {
                        resolve(creators);
                    }
                }).catch(() => {
                    this.bot.logger.error('Error: Could not find creator');
                    creators.push(this.bot.client.user);
                    if(creators.length == emotes.length) {
                        resolve(creators);
                    }
                });
            }
        });
    }

    get(message, match) {
        let ref = match[2].replace(' ', '');
        this.bot.settings.getEmote(ref)
            .then((emote) => {
                this.bot.settings.getMember(message.author.id)
                    .then((member) => {
                        if (emote.Rank <= member.Rank) {
                            this.bot.messageManager.sendMessage(message, emote.Content);
                        }
                    })
                    .catch((err) => {
                        this.bot.logger.error(err);
                        this.bot.messageManager.sendMessage(message, `\`Error: ${err}\``);
                    });
            })
            .catch((err) => {
                this.bot.logger.error(err);
                this.bot.messageManager.sendMessage(message, `\`Error: ${err}\``);
            });
    }

    create(message, match) {
        this.bot.settings.getMember(message.author.id).then((member) => {
            if (member.Rank != 7) {
                this.bot.messageManager.sendMessage(message, 'Sorry, you don\'t have permission to create emotes');
                return;
            }
            let regex = / (".+"|[^ ]+)/ig;
            let m = match[2].match(regex);
            if (m.length < 4 || m.length > 5) {
                this.bot.messageManager.sendMessage(message, 'Too many parameters');
            }

            let name = m[0].replace(' ', ''),
                reference = m[1].replace(' ', ''),
                rank = m[2].replace(' ', ''),
                content = m[3].replace(' ', '').replace(/"/g, ''),
                creator = m[4];

            if (creator != undefined) {
                creator = creator.match(/<@(.+)>/i);
                if (creator == null || creator[1] == null) {
                    creator = '137976237292388353';
                } else {
                    creator = creator[1].replace(' ', '');
                }
            } else {
                creator = '137976237292388353';
            }
            this.bot.settings.createEmote(name, reference, rank, content, creator);
            this.bot.messageManager.sendMessage(message, `Created emote ${name}!`);
        });
    }
}

module.exports = Emotes;