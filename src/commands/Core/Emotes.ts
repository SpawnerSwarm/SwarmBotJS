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

    async run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return false;
        if (match[1] === 'list') {
            return await this.list(message, match);
        }
        else if (match[1] === 'create' || match[1] === 'new') {
            return await this.create(message, match);
        }
        else if (match[1] === 'search' || match[1] === 'find') {
            return await this.search(message, match);
        }
        else if (match[2] != undefined) {
            return await this.get(message, match);
        }
        else {
            let initialCommandUsed = (message.strippedContent.match('^(emotes?|e)') as RegExpMatchArray)[1];
            await message.channel.send(`-** !${initialCommandUsed}** -- Display this text.\n-** !${initialCommandUsed} (ref)** -- Return the emote matching the ref.\n-** !${initialCommandUsed} list (page)** -- List all emotes.\n-** !${initialCommandUsed} create*/new*  "(name)" (reference) (requiredRank) (content) [creator]** -- Create a new Emote.`);
            return true;
        }
    }

    async list(message: Message, match: RegExpMatchArray): Promise<boolean> {
        let page = parseInt(match[2]);
        if (isNaN(page)) {
            page = 1;
        }
        try {
            const emotes = await this.bot.db.getEmoteList(page);
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
            await message.channel.send(text);
            const creators = await this.fetchEmoteCreators(emotes.results);
            for (var i = 0; i < emotes.results.length; i++) {
                if (overrideAuthor) {
                    creators[i] = this.bot.client.user;
                }
                await message.channel.send('', {embed: new EmoteEmbed(this.bot, emotes.results[i], creators[i])});
            }
            return true;
        } catch(err) {
            this.logger.error(err);
            message.channel.send('http://i.imgur.com/zdMAeE9.png');
            return false;
        }
    }

    async fetchEmoteCreators(emotes: Emote[]): Promise<User[]> {
        function fetchUser(bot: Cephalon, id: Snowflake, i: number): Promise<{ user: User, i: number }> {
            return new Promise((resolve) => {
                bot.client.fetchUser(id).then((user) => {
                    resolve({ user: user, i: i });
                });
            });
        }
        let creators: User[] = [];
        for (let i = 0; i < emotes.length; i++) {
            try {
                const user = await fetchUser(this.bot, emotes[i].Creator, i);
                //creators.push(user);
                creators[user.i] = user.user;
                if (creators.length == emotes.length) {
                    return creators;
                }
                return [];
            } catch {
                this.logger.error('Error: Could not find creator');
                creators.push(this.bot.client.user);
                if (creators.length == emotes.length) {
                    return creators;
                }
                return [];
            }
        }
        return [];
    }

    async get(message: Message, match: RegExpMatchArray): Promise<boolean> {
        let ref = match[2].replace(' ', '');
        try {
            const emote = await this.bot.db.getEmote(ref);
            const member = await this.bot.db.getMember(message.author.id);
            if (emote.Rank <= member.Rank) {
                message.channel.send(emote.Content);
                return true;
            }
            return false;
        } catch(err) {
            this.logger.error(err);
            message.channel.send(`\`Error: ${err}\``);
            return false;
        }
    }

    async create(message, match): Promise<boolean> {
        const member = await this.bot.db.getMember(message.author.id);
        if (member.Rank != 7) {
            message.channel.send('Sorry, you don\'t have permission to create emotes');
            return false;
        }
        let regex = /(".+"|[^ ]+)/ig;
        let m = match[2].match(regex);
        if (m.length < 4 || m.length > 5) {
            message.channel.send('Too many parameters');
            return false;
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
        return true;
    }

    async search(message: Message, match: RegExpMatchArray): Promise<boolean> {
        let rematch = match[2].match(/(".+"|[^ ]+)(?: (\d+))?/i);
        if(!this._tsoverrideregex(rematch)) return false;
        if (rematch[1] != undefined) {
            let page = parseInt(rematch[2]);
            if (isNaN(page)) {
                page = 1;
            }
            try {
                const results = await this.bot.db.findEmotes(rematch[1].replace(' ', ''), page);
                let count = results.count;
                let pageCount = page > 0 ? page - 1 : page,
                    min = pageCount * 5 - pageCount,
                    max = (pageCount + 1) * 5 - (5 - results.results.length) - pageCount;
                min = min === 0 ? min + 1 : min;
                
                let text = `Page ${page}. Showing ${min}-${max} emotes out of ${count} emotes.`;
                
                if (max != count) {
                    if(!this._tsoverrideregex(rematch)) return false;
                    text = `${text} To move to the next page, use **!e find ${rematch[1]} ${page + 1}**`;
                }

                let overrideAuthor = message.channel.type === 'dm';

                await message.channel.send(text);
                const creators: User[] = await this.fetchEmoteCreators(results.results);
                for (var i = 0; i < results.results.length; i++) {
                    if (overrideAuthor) {
                        creators[i] = this.bot.client.user;
                    }
                    await message.channel.send('', {embed: new EmoteEmbed(this.bot, results.results[i], creators[i])});
                }
                return true;
            } catch (err) {
                this.logger.error(err);
                message.channel.send('http://i.imgur.com/zdMAeE9.png');
                return false;
            }
        }
        else return false;
    }
}