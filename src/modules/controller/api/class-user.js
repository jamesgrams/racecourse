/**
 * @file    Class User Controller
 * @author  James Grams
 * @abstract
 */

const ClassUserModel = require('../../model/mysql/class-user');
const Api = require('../api');

 /**
 * Class representing a Controller for the Class User Endpoints
 */
class ClassUser extends Api {

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
                }
            },
            "add": { 
                "params": {
                    "users.is_global_admin": 1
                }
            },
            "update": { 
                "params": {
                    "users.is_global_admin": 1
                }
            },
            "delete": { 
                "params": {
                    "users.is_global_admin": 1
                }
            }
        }, UserModel);
    }

}

module.exports = ClassUser;