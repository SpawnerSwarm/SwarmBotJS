import { Fissure } from "../objects/Types";
import { RichEmbed } from "discord.js";
import Cephalon from "../Cephalon";

export default class FissuresEmbed extends RichEmbed {
    constructor(bot: Cephalon, fissures: Fissure[]) {
        super();
        this.color = fissures.length > 2 ? 0x00ff00 : 0xff0000;
        this.fields = fissures.map(a => this.parseFissure(a));
        this.title = 'Fissures';
        this.footer = {
            icon_url: 'https://avatars1.githubusercontent.com/u/24436369',
            text: 'Data evaluated by api.warframestat.us | Warframe Community Developers',
        };
        if(process.env.SOURCE) {
            this.thumbnail = {
                url: `${process.env.SOURCE.replace('github', 'raw.githubusercontent')}/master/src/resources/fissure.png`,
            };
        }
    }

    parseFissure(fissure: Fissure): {
        name: string,
        value: string,
        inline?: boolean
    } {
        var embed = {
            name: `${fissure.missionType} ${fissure.tier}`,
            value: `[${fissure.eta}] ${fissure.node} against ${fissure.enemy}`,
        };
        return embed;
    }
}