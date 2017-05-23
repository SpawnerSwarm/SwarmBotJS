'use strict';

const Ranks = require('./resources/Ranks.js');

class DiscordTags {
    /**
     * @param {Message} message
     * @param {number} rank
     * @param {GuildMember} discordMember
     */
    static assignRankTagsToMember(message, rank, discordMember) {
        let member = message.member;
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

    /**
     * @param {GuildMember} member
     * @param {string} roleName
     */
    static addRoleToMember(member, roleName) {
        let role = member.guild.roles.find('name', roleName);

        member.addRole(role);
    }

    /**
     * @param {GuildMember} member
     * @param {string} roleName
    */
    static removeRoleFromMember(member, roleName) {
        let role = member.guild.roles.find('name', roleName);

        member.removeRole(role);
    }
}

module.exports = DiscordTags;