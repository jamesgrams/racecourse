/**
 * @file    Class Controller
 * @author  James Grams
 * @abstract
 */

const ClassModel = require('../../model/mysql/class');
const Api = require('../api');

 /**
 * Class representing a Controller for the Class Endpoints
 */
class Class extends Api {

    /**
     * Constructor.
     * @param {request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor(request, response) {
        super(request, response, {
            "get": { 
                "params": {
                    "users.is_global_admin": 1, // order matters here - needs to match the order in the where clause
                    "classes.id": request.query.id // if null, well in mysql null != null, you have to use is null, so you won't get results as intended
                },
                "where": [ ["users.is_global_admin", "classes.id"], "users.id" ]
            },
            "add": { 
                "params": {
                    "users.is_global_admin": 1
                }
            },
            "update": { 
                "params": {
                    "users.is_global_admin": 1,
                    "classes.id": request.body.id,
                    "classes_users.is_admin": 1
                },
                "where": [ ["users.is_global_admin", ["classes.id", "classes_users.is_admin"] ], "users.id" ]
            },
            "delete": { 
                "params": {
                    "users.is_global_admin": 1
                }
            }
        }, ClassModel);
    }

}

module.exports = Class;