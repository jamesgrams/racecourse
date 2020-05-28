/**
 * @file    Classes Users Table
 * @author  James Grams
 */

const Constants = require('../../../constants');
const MySQL = require('../mysql');

 /**
 * Class representing a Classes Users Table.
 */
class ClassUser extends MySQL {

    /**
     * Constructor.
     * @param {Connection} connection - The connection to the Database.
     */
    constructor( connection, data ) {
        super( connection, Constants.TABLES.classesUsers, data );
    }

}

ClassUser.FIELDS = [
    "id",
    "created",
    "modified",
    "is_admin",
    "user_id",
    "class_id"
];

module.exports = ClassUser;