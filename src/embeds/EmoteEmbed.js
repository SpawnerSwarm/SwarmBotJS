'use strict';

const Ranks = require('../resources/Ranks.js');

/**
 * @typedef {Object} Emote
 * @property {string} Name
 * @property {string} Content
 * @property {string} Reference
 * @property {number} Rank
 * @property {number} Creator
 */

class EmoteEmbed {
    /**
     * @param {Cephalon} bot
     * @param {Emote} emote
     * @param {User} author
     */
    constructor(bot, emote, creator) {
        this.author = {
            icon_url: creator.avatarURL,
            name: creator.username
        };
        if (emote.Content.match('http(?:s)?:\/\/[^ \/]+\....')) {
            this.thumbnail = {
                url: emote.Content.replace('.gif', 'h.jpg')
            };
        }
        this.title = emote.Name;
        this.fields = [
            {
                name: 'Reference',
                value: emote.Reference,
                inline: true
            },
            {
                name: 'Required Rank',
                value: Ranks[emote.Rank].name,
                inline: true
            }
        ];
        if (emote.Content.includes('http')) { this.url = emote.Content; }
        this.color = Ranks[emote.Rank].color;
    }
}

module.exports = EmoteEmbed;