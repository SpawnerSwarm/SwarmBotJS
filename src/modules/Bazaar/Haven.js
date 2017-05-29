'use strict';

const Bazaar = require('./Bazaar.js');

class Haven extends Bazaar {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, process.env['HAVEN_BAZAAR'], 'Haven Bazaar', 'haven', {
            prefix: '&h',
            statusMessage: 'Haven Bazaar Ready'
        });
    }
}

module.exports = Haven;