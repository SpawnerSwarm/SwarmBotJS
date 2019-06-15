import Bazaar from "./Bazaar";
import Cephalon from "../../Cephalon";

export default class Haven extends Bazaar {
    constructor(bot: Cephalon) {
        super(bot, process.env['HAVEN_BAZAAR'] as string, 'Haven Bazaar', 'haven', {
            prefix: '&h',
            statusMessage: 'Haven Bazaar Ready'
        });
    }
}