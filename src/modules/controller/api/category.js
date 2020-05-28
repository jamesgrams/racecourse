/**
 * @file    Category Controller
 * @author  James Grams
 * @abstract
 */

const CategoryModel = require('../../model/mysql/category');
const Api = require('../api');

 /**
 * Class representing a Controller for the Category Endpoints
 */
class Category extends Api {

    /**
     * Constructor.
     * @param {request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor(request, response) {
        super(request, response, {
            "get": { 
                "params": {
                    "classes.id": request.query.class_id
                }
            },
            "add": { 
                "params": {
                    "classes.id": request.body.class_id,
                    "classes_users.is_admin": 1
                }
            },
            "update": { 
                "params": {
                    "classes.id": request.body.class_id,
                    "classes_users.is_admin": 1
                }
            },
            "delete": { 
                "params": {
                    "classes.id": request.body.class_id,
                    "classes_users.is_admin": 1
                }
            }
        }, CategoryModel);
    }

}

module.exports = Category;