import Command from "../../objects/Command";
import DiscordTags from "../../helpers/DiscordTags";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent, RankNum } from "../../objects/Types";
import { Snowflake } from "discord.js";

export default class Promote extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.promote', 'promote');

        this.bot = bot;

        this.mandatoryWords = /promote/;

        this.regex = /(?:(?:promote|member promote) <@!?(\d+)>)|(?: -?-([^ ]+) ?([^ ]+)?)/gi;

        this.requiredRank = 5;

        this.allowDM = false;
    }

    run(message: MessageWithStrippedContent) {
        let fixedContent = message.strippedContent.replace('Member II', 'MemberII').replace('Guild Master', 'GuildMaster');
        let messageMatch = fixedContent.match(this.regex);
        if(!this._tsoverrideregex(messageMatch)) return;
        let rank: RankNum | 0 = 0,
            date: Date = new Date();
        
        if (!messageMatch[0]) {
            message.channel.send('Syntax incorrect');
            return;
        }

        let memberID: Snowflake = '';

        let validRanks = ['Recruit', 'Member', 'MemberII', 'Veteran', 'Officer', 'General', 'GuildMaster'];
        for (var i = 0; i < messageMatch.length; i++) {
            if (i == 0) {
                memberID = (messageMatch[i].match(/(?:promote|member promote) <@!?(\d+)>/i) as RegExpMatchArray)[1];
            }
            else {
                let argMatch = messageMatch[i].match(/(?: -?-([^ ]+) ?([^ ]+)?)/i);
                if(!this._tsoverrideregex(argMatch)) return;
                if (argMatch[1] == 'f' || argMatch[1] == 'force' || argMatch[1] == 'r' || argMatch[1] == 'rank') {
                    if (validRanks.includes(argMatch[2])) {
                        rank = (validRanks.indexOf(argMatch[2]) + 1) as RankNum;
                    } else {
                        message.channel.send('Error: Invalid Rank');
                        this.logger.error(`Unable to parse rank ${argMatch[2]} in !promote`);
                        return;
                    }
                }
                else if (argMatch[1] == 'd' || argMatch[1] == 'date') {
                    if (argMatch[2].match(/\d?\d\/\d?\d\/\d\d\d\d/)) {
                        date = new Date(argMatch[2]);
                    } else {
                        message.channel.send('Error: Invalid Date');
                        this.logger.error(`Unable to parse date ${argMatch[2]} in !promote`);
                        return;
                    }
                }
            }
        }

        this.bot.db.getMember(memberID).then((member) => {
            this.bot.db.getMember(message.author.id).then((author) => {
                if (author.ID == member.ID && author.Rank != 7) { message.channel.send('```xl\nSorry, you can\'t promote yourself!\n```'); return; }
                if (member.Rank == 7 && rank === 0) { message.channel.send('```xl\nCan\'t promote ' + member.Name + ' because they are already at maximum rank.\n```'); return; }
                if (rank === 0) { rank = (member.Rank + 1) as RankNum; }
                if (author.Rank != 7 && rank >= author.Rank) { message.channel.send('```xl\nSorry, you don\'t have permission to perform that action'); return; }

                this.bot.db.promote(member, rank, date);
                message.guild.fetchMember(member.ID).then((discordMember) => {
                    DiscordTags.assignRankTagsToMember(message, rank as RankNum, discordMember);
                });
                message.channel.send('Member promoted');
            });
        });
    }
}