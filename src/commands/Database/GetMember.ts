import Command from "../../objects/Command";
import Ranks from "../../objects/Ranks.on";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";
import Member from "../../objects/Member";
import { User, RichEmbed, RichEmbedOptions } from "discord.js";

export default class GetMember extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.getMember', 'getMember', 'Get information about a specified member');

        this.usages = [
            { description: 'Gets information about a member from the database', parameters: ['user', 'verbose'] },
        ];

        //this.regex = new RegExp('^(?:getMember|member(?: get)?)? <@!?(\d+)> ?(.+)?$', 'i');
        this.regex = /^(?:getMember|member(?: get)?) <@!?(\\d+)> ?(.+)?$/i;

        this.allowDM = false;

        this.requiredRank = 0;
    }

    run(message: MessageWithStrippedContent) {
        const messageMatch = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(messageMatch)) return;
        let verbose = messageMatch[2];
        if (!messageMatch[1]) {
            message.channel.send('Syntax incorrect');
        } else {
            let iVerbose = verbose === '-v' || verbose === '--verbose';
            this.bot.db.getMember(messageMatch[1]).then((member: Member) => {
                this.bot.client.fetchUser(messageMatch[1]).then((user: User) => {
                    type Field = {
                        name: string,
                        value: string,
                        inline: boolean
                    };
                    var embedOpts: RichEmbedOptions = {
                        description: 'foo',
                        author: {
                            icon_url: user.avatarURL,
                            name: member.Name,
                        },
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
                            }
                        ],
                    };
                    if (iVerbose) {
                        if (member.WarframeName) {
                            (embedOpts.fields as Field[]).push({
                                name: 'Warframe',
                                value: member.WarframeName,
                                inline: true,
                            });
                        }
                        if (member.SpiralKnightsName) {
                            (embedOpts.fields as Field[]).push({
                                name: 'Spiral Knights',
                                value: member.SpiralKnightsName,
                                inline: true,
                            });
                        }
                    }
                    if(member.Banned) {
                        (embedOpts.fields as Field[]).push({
                            name: 'BANNED',
                            value: 'BANNED',
                            inline: member.Ally,
                        });
                    }
                    if(member.Ally) {
                        (embedOpts.fields as Field[]).push({
                            name: 'ALLY',
                            value: 'ALLY',
                            inline: member.Banned
                        });
                    }
                    let embed = new RichEmbed(embedOpts);
                    let color = Ranks[member.Rank].color;
                    if(color !== undefined) embed.setColor(color);

                    new Promise<null | string>((resolve) => {
                        let rank = Ranks[member.Rank].name;
                        if (member[rank] === null) {
                            resolve(null);
                        }
                        (embed.fields as Field[])[1].value = new Date(member[rank]).toDateString();
                        resolve(member[rank]);
                    }).then((date) => this.checkReadyForRankup(date, member, embed))
                        .then(() => message.channel.send('', { embed: embed }));
                });
            })
            .catch((err) => {
                this.logger.error(err);
                message.channel.send(`\`Error: ${err}\``);
            });
        }
    }

    checkReadyForRankup(dateStr: string | null, member: Member, embed: RichEmbed) {
        if (dateStr === null) {
            embed.description = `Rankup data not found for ${member.Name}`; return;
        }
        let one = 1000 * 60 * 60 * 24;
        let today = new Date();
        
        let date = new Date(dateStr);
        
        let dateDiff = Math.floor((today.valueOf() - date.valueOf()) / one);
        let last = Ranks[member.Rank].last;
        if (member.Rank === 7) {
            embed.description = 'He/She has reached the maximum possible rank.';
        }
        else if (last === undefined || dateDiff >= last) {
            embed.description = `${member.Name} is eligible for a rankup.\nIt has been ${dateDiff} days since their last test`;
        } else {
            embed.description = `${member.Name} is not eligible for a rankup.\nIt has been ${dateDiff} days since their last test and they have ${last - dateDiff} days to go.`;
        }
    }
}