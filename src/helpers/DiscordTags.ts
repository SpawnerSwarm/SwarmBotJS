import Ranks from "../objects/Ranks.on";
import { Message, GuildMember } from "discord.js";
import { RankNum } from "../objects/Types";

export default class DiscordTags {
    static async assignRankTagsToMember(message: Message, rank: RankNum, discordMember: GuildMember): Promise<void> {
        let member: GuildMember = message.member;
        if(discordMember) {
            member = discordMember;
        }
        for (let i = 1; i <= rank; i++) {
            await DiscordTags.addRoleToMember(member, Ranks[i].name);
        }
        for (let i = 7; i > rank; i--) {
            await DiscordTags.removeRoleFromMember(member, Ranks[i].name);
        }
    }

    static async addRoleToMember(member: GuildMember, roleName: string): Promise<GuildMember> {
        let role = member.guild.roles.find(x => x.name === roleName);

        return member.addRole(role);
    }

    static async removeRoleFromMember(member: GuildMember, roleName: string): Promise<GuildMember> {
        let role = member.guild.roles.find(x => x.name === roleName);

        return member.removeRole(role);
    }
}