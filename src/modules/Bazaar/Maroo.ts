import Bazaar from "./Bazaar";
import Cephalon from "../../Cephalon";

export default class Haven extends Bazaar {
    constructor(bot: Cephalon) {
        super(bot, process.env['MAROO_BAZAAR'] as string, 'Maroo\'s Bazaar', 'maroo', {
            prefix: '&m',
            statusMessage: 'Maroo\'s Bazaar Ready'
        });
    }
}