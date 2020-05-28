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
                    "classes.id": request.query.id
                }
            },
            "add": { 
                "params": {
                    "classes.id": request.body.id,
                    "classes_users.is_admin": 1
                }
            },
            "update": { 
                "params": {
                    "classes.id": request.body.id,
                    "classes_users.is_admin": 1
                }
            },
            "delete": { 
                "params": {
                    "classes.id": request.body.id,
                    "classes_users.is_admin": 1
                }
            }
        }, ClassModel);
    }

}

module.exports = Class;