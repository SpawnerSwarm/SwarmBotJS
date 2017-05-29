'use strict';

const Command = require('../../Command.js');

const DiscordTags = require('../../DiscordTags.js');

class Promote extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'database.promote', 'promote');

        this.bot = bot;

        this.mandatoryWords = /promote/;

        this.regex = /(?:(?:promote|member promote) <@!?(\d+)>)|(?: -?-([^ ]+) ?([^ ]+)?)/gi;

        this.requiredRank = 5;

        this.allowDM = false;
    }

    run(message) {

        let fixedContent = message.strippedContent.replace('Member II', 'MemberII').replace('Guild Master', 'GuildMaster');
        let messageMatch = fixedContent.match(this.regex);
        let rank = null;

        let date = null;
        if (!messageMatch[0]) {
            message.channel.send('Syntax incorrect');
            return;
        }

        let memberID = null;

        let validRanks = ['Recruit', 'Member', 'MemberII', 'Veteran', 'Officer', 'General', 'GuildMaster'];
        for (var i = 0; i < messageMatch.length; i++) {
            if (i == 0) {
                memberID = messageMatch[i].match(/(?:promote|member promote) <@!?(\d+)>/i)[1];
            }
            else {
                let argMatch = messageMatch[i].match(/(?: -?-([^ ]+) ?([^ ]+)?)/i);
                if (argMatch[1] == 'f' || argMatch[1] == 'force' || argMatch[1] == 'r' || argMatch[1] == 'rank') {
                    if (validRanks.includes(argMatch[2])) {
                        rank = validRanks.indexOf(argMatch[2]) + 1;
                    } else {
                        message.channel.send('Error: Invalid Rank');
                        this.bot.logger.error(`Unable to parse rank ${argMatch[2]} in !promote`);
                        return;
                    }
                }
                else if (argMatch[1] == 'd' || argMatch[1] == 'date') {
                    if (argMatch[2].match(/\d?\d\/\d?\d\/\d\d\d\d/)) {
                        date = new Date(argMatch[2]);
                    } else {
                        message.channel.send('Error: Invalid Date');
                        this.bot.logger.error(`Unable to parse date ${argMatch[2]} in !promote`);
                        return;
                    }
                }
            }
        }

        if (date == null) {
            date = new Date();
        }
        this.bot.settings.getMember(memberID).then((member) => {
            this.bot.settings.getMember(message.author.id).then((author) => {
                if (author.ID == member.ID && author.Rank != 7) { message.channel.send('```xl\nSorry, you can\'t promote yourself!\n```'); return; }
                if (member.Rank == 7 && rank == null) { message.channel.send('```xl\nCan\'t promote ' + member.name + ' because they are already at maximum rank.\n```'); return; }
                if (rank == null) { rank = member.Rank + 1; }
                if (author.Rank != 7 && rank >= author.Rank) { message.channel.send('```xl\nSorry, you don\'t have permission to perform that action'); return; }

                this.bot.settings.promote(member, rank, date);
                message.guild.fetchMember(member.ID).then((discordMember) => {
                    DiscordTags.assignRankTagsToMember(message, rank, discordMember);
                });
                message.channel.send('Member promoted');
            });
        });
    }
}

module.exports = Promote;