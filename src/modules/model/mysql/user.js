/**
 * @file    Users Table
 * @author  James Grams
 */

const Constants = require('../../../constants');
const MySQL = require('../mysql');

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
    "salt"
];

module.exports = User;