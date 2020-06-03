/**
 * @file    Server Specific
 * @author  James Grams
 */

/**
 * Class representing Server Specific.
 * This file should include server specific details such as passwords.
 */
class ServerSpecific {}

ServerSpecific.MYSQL_CONNECTION = {
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE
};

ServerSpecific.PORT = process.env.PORT ? process.env.PORT : 80;

ServerSpecific.TOKEN_KEY = process.env.TOKEN_KEY;

ServerSpecific.TINY_KEY = process.env.TINY_KEY;

module.exports = ServerSpecific;