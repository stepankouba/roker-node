'use strict';
const fetch = require('node-fetch');
const Storage = require('node-storage');
const { URLSearchParams } = require('url');

const DEFAULT_HOST = 'https://api.roker.app';
const DEFAULT_PORT = null;
const DEFAULT_API_VERSION = 'v1';
const DEFAULT_AUTH_URL = 'dev-4l3u576s.eu.auth0.com';

const rokerVersion = require('../package.json').version;

const Resources = {
    files: require('./services/Files'),
    expenses: require('./services/Expenses')
};

class Roker {
    /**
     * 
     */
    version = rokerVersion;

    /**
     * 
     */
    accessToken = null;

    /**
     * 
     */
    storage = undefined;

    constructor(options = {}) {
        this.clientID = options.clientID;
        this.clientSecret = options.clientSecret;
        this.host = options.host || DEFAULT_HOST;
        this.port = options.port || DEFAULT_PORT;
        this.apiVersion = options.apiVersion || DEFAULT_API_VERSION;

        if (!this.clientID || !this.clientSecret) {
            throw new Error('Roker: Can not initiate roker library withou ClientID and ClientSecret')
        }

        this._createResource(this);

        this.storage = new Storage('./.roker');
    }

    _createResource(roker) {
        Object.keys(Resources).forEach(key => {
            roker[key] = Resources[key](this);
        });
    }

    _createURL(url) {
        const start = this.port ? `${this.host}:${this.port}` : this.host;

        return `${start}/${this.apiVersion}${url}`;
    }

    fetch(rokerUrl, options = {}) {
        let promise;

        // console.log(rokerUrl, options);

        if (!this.isAccessTokenValid()) {
            promise = this.getAccessToken();
        } else {
            promise = Promise.resolve();
        }

        return promise.then(() => {
            options.headers = {
                'Authorization': `Bearer ${this.accessToken.token}`,
                'Content-Type': 'application/json'
            };

            options.body = JSON.stringify(options.body);
            return fetch(this._createURL(rokerUrl), options);
        })
    }

    isAccessTokenValid() {
        return this.accessToken && this.accessToken.expiresIn && (Date.now() + 3600 < this.accessToken.issuedAt + this.accessToken.expiresIn);
    }

    getAccessToken() {
        const token = this.storage.get('token');
        
        if (token) {
            this.accessToken = token;

            if (this.isAccessTokenValid()) {
                return Promise.resolve();
            }
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', this.clientID);
        params.append('client_secret', this.clientSecret);
        params.append('audience', 'https://roker/finances');

        return fetch(`https://${DEFAULT_AUTH_URL}/oauth/token`,{
                method: 'post',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: params
            })
            .then(this.checkResponseStatus)
            .then(resp => {
                this.accessToken = {
                    issuedAt: Date.now(),
                    tokenType: resp.token_type,
                    expiresIn: resp.expires_in,
                    token: resp.access_token
                };

                return Promise.resolve();
            }).then(() => {
                // store access token
                this.storage.put('token', this.accessToken);
                return Promise.resolve();
            })
            .catch(err => {
                console.error(err);
                throw new Error('TestUtils.getAccessToken: unable to store access token', err);
            });
    }

    checkResponseStatus = resp => {
        if (resp.ok) {
            return resp.json();
        } else {
            return resp.json().then(data => Promise.reject(data));
        }
    }
}

module.exports = Roker;