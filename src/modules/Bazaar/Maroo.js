'use strict';

const Bazaar = require('./Bazaar.js');

class Haven extends Bazaar {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, process.env['MAROO_BAZAAR'], 'Maroo\'s Bazaar', 'maroo', {
            prefix: '&m',
            statusMessage: 'Maroo\'s Bazaar Ready'
        });
    }
}

module.exports = Haven;