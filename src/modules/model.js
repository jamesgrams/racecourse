/**
 * @file    Model
 * @author  James Grams
 * @abstract
 */

 /**
 * Class representing a Model.
 */
class Model {

    /**
     * Constructor.
     * @param {Object} data - Key/value pairs repesenting columns and their values in the data store.
     */
    constructor( data ) {
        this.data = data;
        if( !this.data ) this.data = {};
    }

    /**
     * Insert data.
     * @abstract
     */
    async insert() {}

    /**
     * Update fields.
     * @abstract
     */
    async update() {}

    /**
     * Delete values.
     * @abstract
     */
    async delete() {}

    /**
     * Fill in the rest of the data.
     * @abstract
     */
    async fetch() {}

    /**
     * Fetch all data.
     * @abstract
     */
    async fetchAll() {}

}

module.exports = Model;