'use strict';

const chai = require('chai');
const expect = chai.expect;

const Roker = require('../lib/roker');

const roker = new Roker({
    clientID: 'Mpz4GGmIheSihi5FBGPNcEgrHYZg3QCw',
    clientSecret: 'Op_3NbnzEtd_xWdoKsHD0zRY_-Lj0GCi_XJEGg6_MTU9qGexxIVQt-bIVkkb1cMC',
    host: 'http://localhost',
    port: 9601
});

describe('Roker NodeJS SDK', () => {
    it('Create new expense from file', done => {
        roker.expenses.createFromFile({filePath: './test/test.png'})
            .then(resp => {
                expect(resp.data).to.have.all.keys(['id', 'attachement', 'createdAt', 'status']);
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            });
    });
});