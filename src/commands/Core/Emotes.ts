import Command from "../../objects/Command";
import EmoteEmbed from "../../embeds/EmoteEmbed";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";
import { Snowflake, User, Message } from "discord.js";
import Emote from "../../objects/Emote";

export default class Emotes extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'core.emotes', 'emotes');

        this.regex = /^(?:emote(?:s)?|e)(?: (list|create|new|search|find)? ?)?(.+)?$/i;
    }

    run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return;
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
            let initialCommandUsed = (message.strippedContent.match('^(emotes?|e)') as RegExpMatchArray)[1];
            message.channel.send(`-** !${initialCommandUsed}** -- Display this text.\n-** !${initialCommandUsed} (ref)** -- Return the emote matching the ref.\n-** !${initialCommandUsed} list (page)** -- List all emotes.\n-** !${initialCommandUsed} create*/new*  "(name)" (reference) (requiredRank) (content) [creator]** -- Create a new Emote.`);
        }
    }

    list(message: Message, match: RegExpMatchArray) {
        let page = parseInt(match[2]);
        if (isNaN(page)) {
            page = 1;
        }
        this.bot.db.getEmoteList(page).then((emotes) => {
            let count = emotes.count;
            let pageCount = page > 0 ? page - 1 : page,
                min = pageCount * 5 - pageCount,
                max = (pageCount + 1) * 5 - (5 - emotes.results.length) - pageCount;
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
            this.fetchEmoteCreators(emotes.results).then((creators) => {
                for (var i = 0; i < emotes.results.length; i++) {
                    if (overrideAuthor) {
                        creators[i] = this.bot.client.user;
                    }
                    message.channel.send('', {embed: new EmoteEmbed(this.bot, emotes.results[i], creators[i])});
                }
            });
        }).catch((err) => {
            this.logger.error(err);
            message.channel.send('http://i.imgur.com/zdMAeE9.png');
        });
    }

    fetchEmoteCreators(emotes: Emote[]): Promise<User[]> {
        function fetchUser(bot: Cephalon, id: Snowflake, i: number): Promise<{ user: User, i: number }> {
            return new Promise((resolve) => {
                bot.client.fetchUser(id).then((user) => {
                    resolve({ user: user, i: i });
                });
            });
        }
        return new Promise((resolve) => {
            let creators: User[] = [];
            for (var i = 0; i < emotes.length; i++) {
                fetchUser(this.bot, emotes[i].Creator, i).then((user) => {
                    let i = user.i;
                    //creators.push(user);
                    creators[i] = user.user;
                    if (creators.length == emotes.length) {
                        resolve(creators);
                    }
                }).catch(() => {
                    this.logger.error('Error: Could not find creator');
                    creators.push(this.bot.client.user);
                    if (creators.length == emotes.length) {
                        resolve(creators);
                    }
                });
            }
        });
    }

    get(message: Message, match: RegExpMatchArray): void {
        let ref = match[2].replace(' ', '');
        this.bot.db.getEmote(ref)
            .then((emote) => {
                this.bot.db.getMember(message.author.id)
                    .then((member) => {
                        if (emote.Rank <= member.Rank) {
                            message.channel.send(emote.Content);
                        }
                    })
                    .catch((err) => {
                        this.logger.error(err);
                        message.channel.send(`\`Error: ${err}\``);
                    });
            })
            .catch((err) => {
                this.logger.error(err);
                message.channel.send(`\`Error: ${err}\``);
            });
    }

    create(message, match): void {
        this.bot.db.getMember(message.author.id).then((member) => {
            if (member.Rank != 7) {
                message.channel.send('Sorry, you don\'t have permission to create emotes');
                return;
            }
            let regex = /(".+"|[^ ]+)/ig;
            let m = match[2].match(regex);
            if (m.length < 4 || m.length > 5) {
                message.channel.send('Too many parameters');
            }

            let name = m[0].includes('"') ? m[0].replace(/"/g, '') : m[0].replace(' ', ''),
                reference = m[1].replace(' ', ''),
                rank = m[2].replace(' ', ''),
                content = m[3].replace(' ', '').replace(/"/g, ''),
                creator = m[4];

            if (creator != undefined) {
                creator = creator.match(/<@!?(\d+)>/i);
                if (creator == null || creator[1] == null) {
                    creator = '137976237292388353';
                } else {
                    creator = creator[1].replace(' ', '');
                }
            } else {
                creator = '137976237292388353';
            }
            this.bot.db.createEmote(name, reference, rank, content, creator);
            message.channel.send(`Created emote ${name}!`);
        });
    }

    search(message: Message, match: RegExpMatchArray) {
        let rematch = match[2].match(/(".+"|[^ ]+)(?: (\d+))?/i);
        if(!this._tsoverrideregex(rematch)) return;
        if (rematch[1] != undefined) {
            let page = parseInt(rematch[2]);
            if (isNaN(page)) {
                page = 1;
            }
            this.bot.db.findEmotes(rematch[1].replace(' ', ''), page).then((results) => {
                let count = results.count;
                let pageCount = page > 0 ? page - 1 : page,
                    min = pageCount * 5 - pageCount,
                    max = (pageCount + 1) * 5 - (5 - results.results.length) - pageCount;
                min = min === 0 ? min + 1 : min;
                let text = `Page ${page}. Showing ${min}-${max} emotes out of ${count} emotes.`;
                if (max != count) {
                    if(!this._tsoverrideregex(rematch)) return;
                    text = `${text} To move to the next page, use **!e find ${rematch[1]} ${page + 1}**`;
                }
                let overrideAuthor = false;
                if (message.channel.type === 'dm') {
                    overrideAuthor = true;
                }
                message.channel.send(text);
                this.fetchEmoteCreators(results.results).then((creators) => {
                    for (var i = 0; i < results.results.length; i++) {
                        if (overrideAuthor) {
                            creators[i] = this.bot.client.user;
                        }
                        message.channel.send('', {embed: new EmoteEmbed(this.bot, results.results[i], creators[i])});
                    }
                });
            }).catch((err) => {
                this.logger.error(err);
                message.channel.send('http://i.imgur.com/zdMAeE9.png');
            });
        }
    }
}