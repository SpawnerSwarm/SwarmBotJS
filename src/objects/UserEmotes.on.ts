import { Snowflake } from "discord.js";

export function simple(emote: UserEmote): emote is SimpleUserEmote {
    return emote.isSimple;
}

export interface UserEmote {
    isSimple: boolean,
    call: string
}

export interface SimpleUserEmote extends UserEmote {
    user: Snowflake,
    content: string
}

export interface ComplexUserEmote extends UserEmote {
    function(id: Snowflake): Promise<string>;
}

export const UserEmotes = [
    {
        isSimple: true,
        user: "139109512744402944",
        content: "http://i.imgur.com/ACoUhAW.gifv",
        call: "holdup"
    } as SimpleUserEmote,
    {
        isSimple: true,
        user: "138043934143152128",
        content: "http://i.imgur.com/1xzQkSo.png",
        call: "brutal"
    } as SimpleUserEmote,
    {
        isSimple: true,
        user: "137976237292388353",
        content: "test",
        call: "etest"
    } as SimpleUserEmote,
    {
        isSimple: true,
        user: "138043934143152128",
        content: "Funks go e y y man kill zucchini angst",
        call: "gecko"
    } as SimpleUserEmote,
    {
        isSimple: false,
        function: async (id: Snowflake) => {
            /*eslint-disable indent*/
            switch(id) {
                case "138043934143152128": return "http://i.imgur.com/MXeL1Jh.gifv"; //Fox
                case "137976237292388353": return "http://i.imgur.com/6AMJZaD.gifv"; //Mardan
                case "139109512744402944": return "http://i.imgur.com/LUfk3HX.gifv"; //Quantum
                default: return "( ͡° ͜ʖ ͡°)";
            }
            /*eslint-enable indent*/
        },
        call: "lenny"
    } as ComplexUserEmote
] as UserEmote[];
export default UserEmotes;