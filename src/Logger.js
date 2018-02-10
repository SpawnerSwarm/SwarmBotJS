'use strict';
/*eslint-disable no-console*/

const request = require('request');
const io = require('socket.io-client');

/**
 * @typedef {Object.<function>} Logger
 * @property {function} debug
 * @property {function} info
 * @property {function} warning
 * @property {function} error
 * @property {function} fatal
*/

class Logger {
    constructor(legacy) {
        this.requestDisabled = legacy;
        if(this.requestDisabled == 'false') {
            this.socket = io(process.env.MAGNIFY_URL);
            this.socket.on('connect', function() {
                console.log('Connected to Magnify');
            });
            this.socket.emit('join', 'console');
        }
    }
}
const logLevel = process.env.LOG_LEVEL;
const levels = [
    'DEBUG',
    'INFO',
    'WARNING',
    'ERROR',
    'FATAL',
];

levels.forEach((level) => {
    //eslint-disable-next-line func-names
    Logger.prototype[level.toLowerCase()] = function (message) {
        if (levels.indexOf(level) >= levels.indexOf(logLevel)) {
            //eslint-disable-next-line no-console
            console.log(`[${level}] ${message}`);
        }
        if (level === 'fatal') {
            //TODO: Neural Sentry
            console.log(`${message}`);
        }
        if (level === 'error') {
            //TODO: Neural Sentry
            console.log(`${message}`);
        }
        if(this.requestDisabled == 'false') {this.socket.emit('console log', {message: message, level: level});}
    };
});

module.exports = Logger;