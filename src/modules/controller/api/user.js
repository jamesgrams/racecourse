/**
 * @file    User Controller
 * @author  James Grams
 * @abstract
 */

const UserModel = require('../../model/mysql/user');
const Api = require('../api');

 /**
 * Class representing a Controller for the User Endpoints
 */
class User extends Api {

    /**
     * Constructor.
     * @param {request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor(request, response) {
        super(request, response, {
            "get": { 
                "params": {
                    "users.is_global_admin": 1,
                    "users.id": request.query.id
                },
                "where": [ ["users.is_global_admin", "users.id" ], "users.id" ] // one of these users.id is the requested user, and the other user is the one from their token. basically, we want them to match.
            },
            "add": { 
                "params": {
                    "users.is_global_admin": 1
                }
            },
            "update": { 
                "params": {
                    "users.is_global_admin": 1,
                    "users.id": request.body.id
                },
                "where": [ ["users.is_global_admin", "users.id" ], "users.id" ]
            },
            "delete": { 
                "params": {
                    "users.is_global_admin": 1
                }
            }
        }, UserModel);
    }

}

module.exports = User;