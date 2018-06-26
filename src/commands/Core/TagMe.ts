import Command from "../../objects/Command";
import DiscordTags from "../../helpers/DiscordTags";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";
import { GuildMember } from "discord.js";
import Member from "../../objects/Member";

export default class TagMe extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'core.tag.add', 'tagme', 'Applies a discord notification tag for a specific group');

        this.allowDM = false;

        this.regex = /'^(?:tagme|tag) ?(.*?)?(?: <@!?(\d+)>)?$'/i;
    }

    run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return;
        let tag = match[1];
        let target = match[2];

        let argstr = ' Correct format is \'!tagme (overwatch/warframe/sk/bot/rank/leave)\'';
        if (tag === undefined) {
            message.channel.send(`Error: Argument blank.${argstr}`); return;
        } else if (!tag.match(/^(?:overwatch|warframe|sk|bot|rank|(?:on)?leave)$/i)) {
            message.channel.send(`Error: Argument invalid.${argstr}`); return;
        }
        tag = tag.toLowerCase();

        function callback(member: GuildMember) {
            if (tag === 'rank') {
                this.bot.settings.getMember(member.id).then((member) => {
                    DiscordTags.assignRankTagsToMember(message, member.Rank, member);
                });
            }
            else {
                switch (tag) {
                    case 'overwatch': DiscordTags.addRoleToMember(member, 'Overwatch'); break;
                    case 'warframe': DiscordTags.addRoleToMember(member, 'Warframe'); break;
                    case 'sk': DiscordTags.addRoleToMember(member, 'Spiral Knights'); break;
                    case 'bot': DiscordTags.addRoleToMember(member, 'Bot Notifications'); break;
                    case 'leave': this.addOnLeaveTag(member); break;
                    case 'onleave': this.addOnLeaveTag(member); break;
                }
            }
            message.channel.send(`Successfully gave ${member.id == message.author.id ? 'you' : member.user.username} the ${tag} tag!`);
            this.logger.info(`Added ${tag} tag to member ${member.user.username}`);
        }
        if (target === undefined) {
            callback.bind(this)(message.member);
        } else {
            message.guild.fetchMember(target).then((member: GuildMember) => {
                callback.bind(this)(member);
            });
        }
    }

    addOnLeaveTag(member: GuildMember): void {
        this.bot.db.getMember(member.id).then((dbmember: Member) => {
            if (dbmember.Rank == 7) {
                return DiscordTags.addRoleToMember(member, 'On Leave (GM)');
            }
            else if (dbmember.Rank >= 5) {
                return DiscordTags.addRoleToMember(member, 'On Leave (General)');
            }
            else {
                return DiscordTags.addRoleToMember(member, 'On Leave (Member)');
            }
        });
    }
}