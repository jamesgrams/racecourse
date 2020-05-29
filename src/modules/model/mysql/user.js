/**
 * @file    Users Table
 * @author  James Grams
 */

const Constants = require('../../../constants');
const MySQL = require('../mysql');
const crypto = require("crypto");

 /**
 * Class representing an Users Table.
 */
class User extends MySQL {

    /**
     * Constructor.
     * @param {Connection} connection - The connection to the Database.
     */
    constructor( connection, data ) {
        super( connection, Constants.TABLES.users, data );
        // convert the password to hash and salt
        delete this.data.salt;
        delete this.data.hash;
        if( this.data.password ) {
            this.data.salt = crypto.randomBytes(Constants.SALT_RANDOM_LEN).toString('hex');
            this.data.hash = crypto.scryptSync(this.data.password, this.data.salt, Constants.CRYPTO_KEY_LEN).toString("hex");
            delete this.data.password;
        }
    }

}

User.FIELDS = [
    "id",
    "created",
    "modified",
    "email",
    "first",
    "last",
    "hash",
    "salt",
    "password" // not a real field
];

module.exports = User;