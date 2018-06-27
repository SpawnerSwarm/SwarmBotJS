import Ranks from "../objects/Ranks.on";
import { Message, GuildMember } from "discord.js";
import { RankNum } from "../objects/Types";

export default class DiscordTags {
    static assignRankTagsToMember(message: Message, rank: RankNum, discordMember: GuildMember): void {
        let member: GuildMember = message.member;
        if(discordMember) {
            member = discordMember;
        }
        new Promise((resolve) => {
            for (let i = 1; i <= rank; i++) {
                DiscordTags.addRoleToMember(member, Ranks[i].name);
            }
            resolve();
        }).then(() => {
            for (let i = 7; i > rank; i--) {
                DiscordTags.removeRoleFromMember(member, Ranks[i].name);
            }
        });
    }

    static addRoleToMember(member: GuildMember, roleName: string): void {
        let role = member.guild.roles.find('name', roleName);

        member.addRole(role);
    }

    static removeRoleFromMember(member: GuildMember, roleName: string): void {
        let role = member.guild.roles.find('name', roleName);

        member.removeRole(role);
    }
}