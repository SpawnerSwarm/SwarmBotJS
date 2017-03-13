﻿'use strict';

const http = require('http');

const WorldState = require('warframe-worldstate-parser');

const worldStateURL = 'http://content.warframe.com/dynamic/worldState.php';

class WorldStateCache {
    constructor(timeout) {
        this.url = worldStateURL;
        this.timeout = timeout;
        this.currentData = null;
        this.lastUpdated = null;
        this.updating = null;

        this.update();
    }

    getData() {
        if (this.updating) {
            return this.updating;
        }
        if (Date.now() - this.lastUpdated > this.timeout) {
            return this.update();
        }
        return Promise.resolve(this.currentData);
    }

    update() {
        this.updating = this.httpGet().then((data) => {
            this.lastUpdated = Date.now();
            this.currentData = new WorldState(data);
            this.updating = null;
            return this.currentData;
        }).catch((err) => {
            this.updating = null;
            throw err;
        });
        return this.updating;
    }

    httpGet() {
        return new Promise((resolve, reject) => {
            const request = http.get(this.url, (response) => {
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
                }
                const body = [];
                response.on('data', chunk => body.push(chunk));
                response.on('end', () => resolve(body.join('')));
            });
            request.on('error', err => reject(err));
        });
    }
}

module.exports = WorldStateCache;