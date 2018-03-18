'use strict';

const Command = require('../../Command.js');

const EmoteEmbed = require('../../embeds/EmoteEmbed.js');

class Emotes extends Command {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, 'core.emotes', 'emotes');

        this.regex = new RegExp('^(?:emote(?:s)?|e)(?: (list|create|new|search|find)? ?)?(.+)?$', 'i');
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        let match = message.strippedContent.match(this.regex);
        if (match[1] === 'list') {
            this.list(message, match);
        }
        else if (match[1] === 'create' || match[1] === 'new') {
            this.create(message, match);
        }
        else if (match[1] === 'search' || match[1] === 'find') {
            this.search(message, match);
        }
        else if (match[2] != undefined) {
            this.get(message, match);
        }
        else {
            let initialCommandUsed = message.strippedContent.match('^(emotes?|e)')[1];
            message.channel.send(`-** !${initialCommandUsed}** -- Display this text.\n-** !${initialCommandUsed} (ref)** -- Return the emote matching the ref.\n-** !${initialCommandUsed} list (page)** -- List all emotes.\n-** !${initialCommandUsed} create*/new*  "(name)" (reference) (requiredRank) (content) [creator]** -- Create a new Emote.`);
        }
    }

    list(message, match) {
        let page = parseInt(match[2]);
        if (isNaN(page)) {
            page = 1;
        }
        this.bot.settings.getEmoteList(page).then((emotes) => {
            let count = emotes.count;
            emotes = emotes.results;
            let pageCount = page > 0 ? page - 1 : page,
                min = pageCount * 5 - pageCount,
                max = (pageCount + 1) * 5 - (5 - emotes.length) - pageCount;
            min = min === 0 ? min + 1 : min;
            let text = `Page ${page}. Showing ${min}-${max} emotes out of ${count} emotes.`;
            if (max != count) {
                text = `${text} To move to the next page, use **!e list ${page + 1}**`;
            }
            let overrideAuthor = false;
            if (message.channel.type === 'dm') {
                overrideAuthor = true;
            }
            message.channel.send(text);
            this.fetchEmoteCreators(emotes).then((creators) => {
                for (var i = 0; i < emotes.length; i++) {
                    if (overrideAuthor) {
                        creators[i] = this.bot.client.user;
                    }
                    message.channel.send('', {embed: new EmoteEmbed(this.bot, emotes[i], creators[i])});
                }
            });
        })
            .catch((err) => {
                this.bot.logger.error(err);
                message.channel.send('http://i.imgur.com/zdMAeE9.png');
            });
    }

    fetchEmoteCreators(emotes) {
        function fetchUser(bot, id, i) {
            return new Promise((resolve) => {
                bot.client.fetchUser(id).then((user) => {
                    resolve({ user: user, i: i });
                });
            });
        }
        return new Promise((resolve) => {
            let creators = [];
            for (var i = 0; i < emotes.length; i++) {
                fetchUser(this.bot, emotes[i].Creator, i).then((user) => {
                    let i = user.i;
                    user = user.user;
                    //creators.push(user);
                    creators[i] = user;
                    if (creators.length == emotes.length) {
                        resolve(creators);
                    }
                }).catch(() => {
                    this.bot.logger.error('Error: Could not find creator');
                    creators.push(this.bot.client.user);
                    if (creators.length == emotes.length) {
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
                            message.channel.send(emote.Content);
                        }
                    })
                    .catch((err) => {
                        this.bot.logger.error(err);
                        message.channel.send(`\`Error: ${err}\``);
                    });
            })
            .catch((err) => {
                this.bot.logger.error(err);
                message.channel.send(`\`Error: ${err}\``);
            });
    }

    create(message, match) {
        this.bot.settings.getMember(message.author.id).then((member) => {
            if (member.Rank != 7) {
                message.channel.send('Sorry, you don\'t have permission to create emotes');
                return;
            }
            let regex = / (".+"|[^ ]+)/ig;
            let m = match[2].match(regex);
            if (m.length < 4 || m.length > 5) {
                message.channel.send('Too many parameters');
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
            message.channel.send(`Created emote ${name}!`);
        });
    }

    search(message, match) {
        let rematch = match[2].match(/(".+"|[^ ]+)(?: (\d+))?/i);
        if (rematch[1] != undefined) {
            let page = parseInt(rematch[2]);
            if (isNaN(page)) {
                page = 1;
            }
            this.bot.settings.findEmotes(rematch[1].replace(' ', ''), page).then((results) => {
                let count = results.count;
                results = results.results;
                let pageCount = page > 0 ? page - 1 : page,
                    min = pageCount * 5 - pageCount,
                    max = (pageCount + 1) * 5 - (5 - results.length) - pageCount;
                min = min === 0 ? min + 1 : min;
                let text = `Page ${page}. Showing ${min}-${max} emotes out of ${count} emotes.`;
                if (max != count) {
                    text = `${text} To move to the next page, use **!e find ${rematch[1]} ${page + 1}**`;
                }
                let overrideAuthor = false;
                if (message.channel.type === 'dm') {
                    overrideAuthor = true;
                }
                message.channel.send(text);
                this.fetchEmoteCreators(results).then((creators) => {
                    for (var i = 0; i < results.length; i++) {
                        if (overrideAuthor) {
                            creators[i] = this.bot.client.user;
                        }
                        message.channel.send('', {embed: new EmoteEmbed(this.bot, results[i], creators[i])});
                    }
                });
            }).catch((err) => {
                this.bot.logger.error(err);
                message.channel.send('http://i.imgur.com/zdMAeE9.png');
            });
        }
    }
}

module.exports = Emotes;