import { Falsey, Truthy } from '../objects/Types.d';
import * as io from 'socket.io-client';

export default class Logger {
    public useMagnify: boolean = false;
    protected socket: any;

    constructor(magnify: string | boolean | Falsey | Truthy = false) {
        console.log(magnify);
        this.useMagnify = magnify as boolean;
        if(this.useMagnify === true && process.env.MAGNIFY_URL !== undefined) {
            this.socket = io(process.env.MAGNIFY_URL as string);
            this.socket.on('connect', function() {
                console.log('Connected to Magnify');
            });
            this.socket.emit('join', 'console');
        }
    }

    private _doLog(level: Level, message: string): void {
        console.log(`[${level}] ${message}`);
        if(this.useMagnify) {
            this.socket.emit('console log', {
                message: JSON.stringify(message).slice(1, -1),
                level: level
            });
        }
    }

    public debug(message: string): Promise<void> {
        return new Promise(() => this._doLog(Level.DEBUG, message));
    }
    
    public info(message: string): Promise<void> {
        return new Promise(() => this._doLog(Level.INFO, message));
    }

    public warning(message: string): Promise<void> {
        return new Promise(() => this._doLog(Level.WARNING, message));
    }

    public error(message: string): Promise<void> {
        return new Promise(() => this._doLog(Level.ERROR, message));
    }

    public fatal(message: string): Promise<void> {
        return new Promise(() => this._doLog(Level.FATAL, message));
    }
}
enum Level {
    DEBUG='DEBUG',
    INFO='INFO',
    WARNING='WARNING',
    ERROR='ERROR',
    FATAL='FATAL',
};