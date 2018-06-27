import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";
import DiscordTags from "../../helpers/DiscordTags";
import { GuildMember } from "discord.js";
import Member from "../../objects/Member";

export default class UnTagMe extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'core.tag.remove', 'untagme', 'Removes a discord notification tag for a specific group');

        this.allowDM = false;

        this.regex = /^(?:untagme|untag) ?(.*?)?(?: <@!?(\d+)>)?$/i;
    }

    run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return;
        let tag = match[1];
        let target = match[2];

        let argstr = ' Correct format is \'!tagme (overwatch/warframe/sk/bot/leave)\'';
        if (tag === undefined) {
            message.channel.send(`Error: Argument blank.${argstr}`); return;
        } else if (!tag.match(/^(?:overwatch|warframe|sk|bot|(?:on)?leave)$/i)) {
            message.channel.send(`Error: Argument invalid.${argstr}`); return;
        }
        tag = tag.toLowerCase();
        function callback(member: GuildMember) {
            /*eslint-disable indent*/
            switch (tag) {
                case 'overwatch': DiscordTags.removeRoleFromMember(member, 'Overwatch'); break;
                case 'warframe': DiscordTags.removeRoleFromMember(member, 'Warframe'); break;
                case 'sk': DiscordTags.removeRoleFromMember(member, 'Spiral Knights'); break;
                case 'bot': DiscordTags.removeRoleFromMember(member, 'Bot Notifications'); break;
                case 'leave': this.removeOnLeaveTag(member); break;
                case 'onleave': this.removeOnLeaveTag(member); break;
            }
            /*eslint-enable indent*/
            message.channel.send(`Successfully removed the ${tag} tag!`);
            this.logger.info(`Removed ${tag} tag from member ${member.user.username}`);
        }
        if (target === undefined) {
            callback.bind(this)(message.member);
        } else {
            message.guild.fetchMember(target).then((member: GuildMember) => {
                callback.bind(this)(member);
            });
        }
    }

    removeOnLeaveTag(member: GuildMember) {
        this.bot.db.getMember(member.id).then((dbmember: Member) => {
            if (dbmember.Rank == 7) {
                return DiscordTags.removeRoleFromMember(member, 'On Leave (GM)');
            }
            else if (dbmember.Rank >= 5) {
                return DiscordTags.removeRoleFromMember(member, 'On Leave (General)');
            }
            else {
                return DiscordTags.removeRoleFromMember(member, 'On Leave (Member)');
            }
        });
    }
}