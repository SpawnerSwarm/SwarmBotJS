'use strict';
/*eslint-disable no-console*/

const request = require('request');

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
        if(this.requestDisabled === 'false') {request.post(process.env.NEURAL_SENTRY_URL, {form: {message: message, level: level}});}
    }.bind(this);
});

module.exports = Logger;