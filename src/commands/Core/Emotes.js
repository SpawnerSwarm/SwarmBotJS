'use strict';

const Command = require('../../Command.js');

const EmoteEmbed = require('../../embeds/EmoteEmbed.js');

class Emotes extends Command {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, 'core.emotes', 'emotes');

        this.regex = new RegExp('^(?:emote(?:s)?|e)?( list)?( .+)?$', 'i');
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        let match = message.strippedContent.match(this.regex);
        if (match[1] === ' list') {
            this.list(message, match);
        }
        else if (match[2] !== '') {
            this.get(message, match);
        }
        else {
            this.bot.messageManager.sendMessage('-** !{initialCommandUsed}** -- Display this text.\n-** !{initialCommandUsed}** (ref) -- Return the emote matching the ref.\n-** !{initialCommandUsed} list (page)** -- List all emotes.\n-** !{initialCommandUsed} create*/new/make* (name) (reference) (requiredRank) (content) (creator)** -- Create a new Emote.');
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
            if(message.channel.type === 'dm') {
                overrideAuthor = true;
            }
            this.bot.messageManager.sendMessage(message, text);
            for (var i = 0; i < emotes.length; i++) {
                var creator;
                if(overrideAuthor) {
                    creator = this.bot.client.user;
                }
                else {
                    try {
                        creator = message.guild.fetchMember(emotes[i].Creator);
                    } catch(err) {
                        this.bot.messageManager.sendMessage(message, `\`Error: ${err}\``);
                    }
                }
                this.bot.messageManager.embed(message, new EmoteEmbed(this.bot, emotes[i], creator));
            }
        })
            .catch((err) => {
                this.bot.logger.error(err);
                this.bot.messageManager.sendMessage(message, 'http://i.imgur.com/zdMAeE9.png');
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
}

module.exports = Emotes;