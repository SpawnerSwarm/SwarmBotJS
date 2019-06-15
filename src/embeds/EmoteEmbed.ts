import Ranks from "../objects/Ranks.on";
import { RankNum } from "../objects/Types.d";
import { Snowflake, User, RichEmbed } from "discord.js";
import Cephalon from "../Cephalon";
import Emote from "../objects/Emote";

export default class EmoteEmbed extends RichEmbed {
    public Name: string;
    public Content: string;
    public Reference: string;
    public Rank: RankNum;
    public /*You cannot defy your*/ Creator: Snowflake;

    constructor(bot: Cephalon, emote: Emote, creator: User | undefined) {
        super();
        if(creator == undefined) {
            creator = bot.client.user;
        }
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
        let color = Ranks[emote.Rank].color;
        if(color !== undefined) {
            this.setColor(color);
        }
    }
}