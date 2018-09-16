import Command from "../../objects/Command";
import DiscordTags from "../../helpers/DiscordTags";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";
import { GuildMember } from "discord.js";

export default class TagMe extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'core.tag.add', 'tagme', 'Applies a discord notification tag for a specific group');

        this.allowDM = false;

        this.regex = /^(un)?(?:tagme|tag) ?(.*?)?(?: <@!?(\d+)>)?$/i;
    }

    async run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return false;
        let untag = match[1] === 'un';
        let tag = match[2];
        let target = match[3];

        let argstr = ` Correct format is '!tagme (overwatch/warframe/sk/bot/${!untag ? 'rank/' : ''}leave)'`;
        if (tag === undefined) {
            message.channel.send(`Error: Argument blank.${argstr}`);
            return false;
        } else if (!tag.match(/^(?:overwatch|warframe|sk|bot|rank|(?:on)?leave)$/i)) {
            message.channel.send(`Error: Argument invalid.${argstr}`);
            return false;
        }
        tag = tag.toLowerCase();

        let member: GuildMember;
        if (target === undefined) {
            member = message.member;
        } else {
            member = await message.guild.fetchMember(target);
        }
        if (tag === 'rank') {
            if(untag) {
                message.channel.send(`Error: Cannot remove rank tags.`);
                return false;
            }
            const dbmember = await this.bot.db.getMember(member.id);
            await DiscordTags.assignRankTagsToMember(message, dbmember.Rank, member);
        }
        else {
            const fn = untag ? DiscordTags.removeRoleFromMember : DiscordTags.addRoleToMember;
            switch (tag) {
                case 'overwatch': await fn(member, 'Overwatch'); break;
                case 'warframe': await fn(member, 'Warframe'); break;
                case 'sk': await fn(member, 'Spiral Knights'); break;
                case 'bot': await fn(member, 'Bot Notifications'); break;
                case 'leave': await this.handleOnLeaveTag(member, fn); break;
                case 'onleave': await this.handleOnLeaveTag(member, fn); break;
            }
        }
        if(untag) {
            this.logger.info(`Removed ${tag} tag from member ${member.user.username}`);
            message.channel.send(`Successfully removed the ${tag} tag!`);
        }
        else {
            this.logger.info(`Added ${tag} tag to member ${member.user.username}`);
            message.channel.send(`Successfully gave ${member.id == message.author.id ? 'you' : member.user.username} the ${tag} tag!`);
        }
        return true;
    }

    async handleOnLeaveTag(member: GuildMember, fn: Function): Promise<GuildMember> {
        const dbmember = await this.bot.db.getMember(member.id);
        if (dbmember.Rank == 7) {
            return fn(member, 'On Leave (GM)');
        }
        else if (dbmember.Rank >= 5) {
            return fn(member, 'On Leave (General)');
        }
        else {
            return fn(member, 'On Leave (Member)');
        }
    }
}