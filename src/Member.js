'use strict';

const Ranks = require('./resources/Ranks.json');

/**
 * @typedef RankupHistory
 * @property {Date} Recruit
 * @property {Date} Member
 * @property {Date} MemberII
 * @property {Date} Veteran
 * @property {Date} Officer
 * @property {Date} General
 * @property {Date} GuildMaster
 */

class Member {
    /*
     * {string} name
     * {long} id
     * {int} rank
     * {RankupHistory} rankupHistory
     * {string} Warframe
     * {string} SpiralKnights
     * {string} Steam
     * {int} formaDonated
    */
    /**
     * @param {string} id
     * @param {Cephalon} bot
     */
    constructor(id, bot) {
        /**
         * @type {Cephalon}
        */
        this.bot = bot;

        /**
         * @type {string}
        */
        this.id = id;

        this.name = bot.settings.getMember(id).done((results) => {
            //return results.Name;
            /*this.name = results.id;
            this.rank = results.rank;
            this.Warframe = results.WarframeName;
            this.SpiralKnights = results.SpiralKnightsName;
            this.Steam = results.SteamName;
            this.formaDonated = results.formaDonated;*/
        }, (error) => {
            throw new Error(`Error: ${error}`);
        })
    }
}

module.exports = Member;