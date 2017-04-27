'use strict';

const Command = require('../../Command.js');

const Ranks = require('../../resources/Ranks.js');

class GetMember extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'database.getMember', 'getMember', 'Get information about a specified member');

        this.usages = [
            { description: 'Gets information about a member from the database', parameters: ['user', 'verbose'] },
        ];

        //this.regex = new RegExp('^(?:getMember|member(?: get)?)? <@!?(\d+)> ?(.+)?$', 'i');
        this.regex = new RegExp('^(?:getMember|member(?: get)?) <@!?(\\d+)> ?(.+)?$', 'i');

        this.allowDM = false;

        this.requiredRank = 0;
    }

    run(message) {
        const messageMatch = message.strippedContent.match(this.regex, 'i');
        let verbose = messageMatch[2];
        if (!messageMatch[1]) {
            message.channel.sendMessage('Syntax incorrect');
        } else {
            /**
             * @type {Boolean}
             */
            let iVerbose = verbose === '-v' || verbose === '--verbose';
            this.bot.settings.getMember(messageMatch[1]).then((member) => {
                this.bot.client.fetchUser(messageMatch[1]).then((user) => {
                    var embed = {
                        type: 'rich',
                        description: 'foo',
                        author: {
                            icon_url: user.avatarURL,
                            name: member.Name,
                        },
                        color: Ranks[member.Rank].color,
                        fields: [
                            {
                                name: 'Rank',
                                value: Ranks[member.Rank].name,
                                inline: true,
                            },
                            {
                                name: 'Last Rankup',
                                value: '...',
                                inline: true,
                            },
                            {
                                name: 'Forma Donated',
                                value: member.FormaDonated,
                                inline: true,
                            },
                        ],
                    };
                    if(member.Banned) {
                        embed.fields.push({
                            name: 'BANNED',
                            value: 'BANNED',
                            inline: false,
                        });
                    }
                    if (iVerbose) {
                        if (member.WarframeName) {
                            embed.fields.push({
                                name: 'Warframe',
                                value: member.WarframeName,
                                inline: true,
                            });
                        }
                        if (member.SpiralKnightsName) {
                            embed.fields.push({
                                name: 'Spiral Knights',
                                value: member.SpiralKnightsName,
                                inline: true,
                            });
                        }
                        if (member.SteamName) {
                            embed.fields.push({
                                name: 'Steam',
                                value: member.SteamName,
                                inline: true,
                            });
                        }
                    }
                    this.bot.settings.getRankups(messageMatch[1]).then((rankups) => {
                        let rank = Ranks[member.Rank].name;
                        if (rankups[rank] === null) {
                            return;
                        }
                        embed.fields[1].value = new Date(rankups[rank]).toDateString();
                        return rankups[rank];
                    }).then((date) => this.checkReadyForRankup(date, member, embed))
                        .then(() => this.messageManager.embed(message, embed));
                });
            })
            .catch((err) => {
                this.bot.logger.error(err);
                this.bot.messageManager.sendMessage(message, `\`Error: ${err}\``);
            });
        }
    }

    /**
     * @param {string} date
     * @param {Object} member
     * @param {MessageEmbed} embed
     */
    checkReadyForRankup(date, member, embed) {
        if (date === null) {
            embed.description = `Rankup data not found for ${member.Name}`; return;
        }
        let one = 1000 * 60 * 60 * 24;
        let today = new Date();
        
        date = new Date(date);
        
        let dateDiff = Math.floor((today - date) / one);
        if (member.Rank === 7) {
            embed.description = 'He/She has reached the maximum possible rank.';
        }
        else if (dateDiff >= Ranks[member.Rank].last) {
            embed.description = `${member.Name} is eligible for a rankup.\nIt has been ${dateDiff} days since their last test`;
        } else {
            embed.description = `${member.Name} is not eligible for a rankup.\nIt has been ${dateDiff} days since their last test and they have ${Ranks[member.Rank].last - dateDiff} days to go.`;
        }
    }
}

module.exports = GetMember;