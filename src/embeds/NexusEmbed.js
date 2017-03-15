'use strict';

class NexusEmbed {
    /**
     * @param {Cephalon} bot
     * @param {Array.<Attachment>} result
     * @param {string} query
     */
    constructor(bot, result, query) {
        const attachment = result[0];
        
        this.description = `Price Check for search term ${query}`;
        this.color = parseInt(attachment.color, 16);
        this.type = attachment.type;
        this.title = attachment.title;
        this.url = attachment.url;
        this.fields = attachment.fields;
        this.thumbnail = result.thumbnail;
        this.footer = attachment.footer;
    }
}

module.exports = NexusEmbed;