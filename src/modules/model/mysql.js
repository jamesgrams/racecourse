/**
 * @file    MySQL Table
 * @author  James Grams
 */

const Model = require('../model');
const Constants = require('../../constants');

 /**
 * Class representing a MySQL Table.
 */
class MySQL extends Model {

    /**
     * Constructor.
     * @param {Connection|Pool} connection - The connection to the Database, or a connection pool.
     * @param {string} table - The name of the table to connect to.
     * @param {Object} data - Key/value pairs repesenting columns and their values in the database.
     */
    constructor( connection, table, data ) {
        super( data );

        // set undefined to null
        for( let key in data ) {
            if( typeof data[key] !== 'object' ) {
                if( data[key] === undefined ) data[key] = null;
            }
            else if( ! (typeof data[key].getMonth === "function" ) ) {
                data[key] = data[key].map( el => el === undefined ? null : el );
            }
        }

        this.connection = connection;
        this.table = table;
    }

    /**
     * Insert data into the database.
     * @returns {Promise<Number>} Promise containing the insert id.
     * @throws An exception if there was a problem running the query.
     */
    async insert() {
        let keys = Object.keys(this.data);
        let [meta, result] = await this.connection.execute("INSERT INTO " +
                this.table +
                "(" + keys.join(",") + ")" + 
                "VALUES" +
                "(" +keys.map( (el) => "?" ).join(",") + ")", 
            Object.values(this.data));
        if( !this.data.id ) {
            this.data.id = meta.insertId;
        }
        return Promise.resolve(meta.insertId);
    }

    /**
     * Update fields in the database.
     * @param {Array.<string|Array>} where - An array of keys in the data object whose values will serve to identify the current object that should be updated. 
     * If the item is an array, the items in the sub-array will be joined with an or, sub arrays of that with and, etc. Defaults to ID.
     * @returns {Promise} Promise when completed.
     * @throws An exception if there was a problem running the query.
     */
    async update( where ) {
        if( !where || !where.length ) where = [ Constants.DEFAULT_WHERE ];
        let values = Object.values(this.data).concat( where.flat().map( (item) => this.data[item] ) );

        await this.connection.execute( "UPDATE " + 
            this.table + 
            " SET " + 
            Object.keys(this.data).map( (key) => key + "=?" ).join(",") + 
            " WHERE " + 
            this.constructor.createWhereString(where), 
        values );

        return Promise.resolve();
    }

    /**
     * Delete this value in the database.
     * @param {Array.<string|Array>} where - An array of keys in the data object whose values will serve to identify the current object that should be updated. 
     * If the item is an array, the items in the sub-array will be joined with an or, sub arrays of that with and, etc. Defaults to all the keys currently in the data object.
     * @returns {Promise} Promise when completed.
     * @throws An exception if there was a problem running the query.
     */
    async delete( where ) {
        if( !where || !where.length ) where = Object.keys(this.data);
        let values = where.flat().map( (item) => this.data[item] );

        await this.connection.execute( "DELETE FROM " + 
            this.table + 
            " WHERE " + 
            this.constructor.createWhereString( where ), 
        values );

        return Promise.resolve();
    }

    /**
     * Fetch remaining values from the database based on what is already defined in this.data. This will update data.
     * @returns {Promise} Promise when completed.
     * @throws An exception if there was a problem running the query.
     */
    async fetch() {
        let values = Object.values(this.data);

        let [rows, fields] = await this.connection.execute( "SELECT * FROM " + 
            this.table + 
            " WHERE " + 
            this.constructor.createWhereString( Object.keys(this.data) ) +
            " LIMIT 1", 
        values );

        if( rows.length ) this.data = rows[0];

        return Promise.resolve();
    }

    /**
     * Fetch multiple values.
     * @param {Array.<string|Array>} where - An array of keys in the data object whose values will serve to identify the current object that should be updated. 
     * If the item is an array, the items in the sub-array will be joined with an or, sub arrays of that with and, etc. Defaults to all the keys currently in the data object. If a key
     * has multiple values (an array), multiple keys will be created for it in the where statement. 
     * @param {Array.<Object>} related - An array of objects, each with a table, localKey and foreignKey value used to create joins.
     * @param {Array.<String>} customFields - An array of fields that we only want to select. Otherwise, all fields will be selected. An option field of join type can also be used (e.g. "left outer")
     * @param {number} limit - The limit.
     * @param {number} offset - The offset.
     * @param {Array} orderByFields - The fields to order by.
     * @returns {Promise<Array>} An array containing the matching rows.
     * @throws An exception if there was a problem running the query.
     */
    async fetchAll( where, related, customFields, limit, offset, orderByFields ) {
        if( !where || !where.length ) where = Object.keys(this.data).map( (item) => typeof this.data[item] == "object" ? this.data[item].map( (subitem) => item ) : item ).flat();

        // values can be an array in which case we do multiple for that item
        // remember that the order of where matters, it should match the order of the data keys.
        let values = Object.keys(this.data).flat().map( (item) => this.data[item] ).flat();

        let table = this.table;
        if( related ) {
            for( let relation of related ) {
                table += " " + (relation.joinType ? relation.joinType + " " : "") + "join " + relation.table + " on " + relation.localKey + "=" + relation.foreignKey;
            }
        }

        let selectFields = "*";
        if( customFields ) selectFields = customFields.join(",");

        let query = "SELECT " + selectFields + " FROM " + 
            table + 
            (values.length ? " WHERE " + 
            this.constructor.createWhereString( where ) : "") + 
            (orderByFields ? " ORDER BY " + (orderByFields.join(",")) : "") +
            (limit ? " LIMIT " + limit : "") +
            (offset ? " OFFSET " + offset : "");
        console.log("executing " + query);
        let [rows, fields] = await this.connection.execute( query, values );
        
        return Promise.resolve(rows);
    }

    /**
     * Create a where string.
     * @param {Array.<string|Array>} - An array of keys in the data object whose values will serve to identify the current object that should be updated. 
     * If the item is an array, the items in the sub-array will be joined with an or, sub arrays of that with and, etc.
     * @param {number} [depth] - The current depth. Evens are AND, odds are OR.
     * @returns {string} The where string. 
     */
    static createWhereString( where, depth ) {
        if( !depth ) depth = 1;
        let conjunction = depth % 2 ?  " AND " : " OR ";
        return where.map( (item) => typeof item == "string" ? (item.match(".") ? "" : this.table + ".") + item + "=?" : "(" + this.createWhereString(item, depth+1) + ")" ).join(conjunction);
    }


}

module.exports = MySQL;