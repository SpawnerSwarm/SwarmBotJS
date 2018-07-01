import { RichEmbed } from "discord.js";
import Cephalon from "../Cephalon";

export default class NexusEmbed extends RichEmbed {
    constructor(bot: Cephalon, result: any, query: string) {
        super();
        const attachment = result[0];
        
        this.description = `Price Check for search term ${query}`;
        this.color = parseInt(attachment.color, 16);
        this.title = attachment.title;
        this.url = attachment.url;
        this.fields = attachment.fields;
        this.thumbnail = result.thumbnail;
        this.footer = attachment.footer;
    }
}