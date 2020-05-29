/**
 * @file    Classes Table
 * @author  James Grams
 */

const Constants = require('../../../constants');
const MySQL = require('../mysql');

 /**
 * Class representing a Classes Table.
 */
class Class extends MySQL {

    /**
     * Constructor.
     * @param {Connection} connection - The connection to the Database.
     */
    constructor( connection, data ) {
        super( connection, Constants.TABLES.classes, data );
    }

}

Class.FIELDS = [
    "id",
    "created",
    "modified",
    "name",
    "start_date",
    "end_date"
];

module.exports = Class;