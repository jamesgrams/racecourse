/**
 * @file    Connection Pool
 * @author  James Grams
 */

const mysql = require('mysql2');
const ServerSpecific = require('./server-specific');

/**
 * Class representing a pool.
 */
class Pool {}

Pool.pool = mysql.createPool(ServerSpecific.MYSQL_CONNECTION).promise();

module.exports = Pool;