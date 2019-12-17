var assert = require('assert');
var should = require('chai').should();
let setupConversation = require('../../conversations/setup');
let testUtils = require('../../utils/testing_utils');


const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config')[env];
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const models = require('../../models');

const phoneNumbers = ["9198462735", "9198684114"];

const users = [
    {
        firstName: "Blerp",
        lastName: "Person",
        phoneNumber: phoneNumbers[0]
    },
    {
        firstName: "Two",
        lastName: "Cool",
        phoneNumber: phoneNumbers[1]
    }
]

describe('Setup conversation', () => {
    describe('setupGame', () => {

        beforeEach(done => {
            done();
        })

        it('it should be add the users to the database', (done) => {
            setupConversation.setupGameForTesting(users).then(() => {
                models.user.findAndCountAll({where: {
                    phoneNumber: {
                        [Sequelize.Op.in]: phoneNumbers
                    }
                }}).then((users) => {
                    users.count.should.equal(phoneNumbers.length);
                    done();
                }).catch(err => {done(err)});
            }).catch(err => {
                done(err)
            });
        });
    })
})
