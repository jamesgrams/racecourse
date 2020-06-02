/**
 * @file    Categories Table
 * @author  James Grams
 */

const Constants = require('../../../constants');
const MySQL = require('../mysql');

 /**
 * Class representing a Categories Table.
 */
class Category extends MySQL {

    /**
     * Constructor.
     * @param {Connection} connection - The connection to the Database.
     */
    constructor( connection, data ) {
        super( connection, Constants.TABLES.categories, data );
    }

}

Category.FIELDS = [
    "id",
    "created",
    "modified",
    "name",
    "content",
    "display_order",
    "class_id"
];

module.exports = Category;