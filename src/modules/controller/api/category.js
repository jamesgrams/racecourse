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
                // remember, these are like the where values that we nee a record for, we can specify a custom where
                // for the kind of result we need
                "params": {
                    "users.is_global_admin": 1,
                    "classes.id": request.query.class_id, // we can validate on classes here, which means a class_id must always be specified in a get by a non-global user, but also allows for all categories to be selected in a class. If the user specifies a get for a category id that doesn't match the class id they specify in the request, they might get validated for the class, but they will get no results.
                },
                "where": [ ["users.is_global_admin", "classes.id"], "users.id" ]
            },
            "add": { 
                "params": {
                    "users.is_global_admin": 1,
                    "classes.id": request.body.class_id, // authorize on class id - you need a class id when adding a category
                    "classes_users.is_admin": 1
                },
                "where": [ ["users.is_global_admin", ["classes.id", "classes_users.is_admin"] ], "users.id" ]
            },
            "update": { 
                "params": {
                    "users.is_global_admin": 1,
                    "categories.id": request.body.id, // authorize on category id for update. Unlike get which will include the class id in the where clause, update will only include the category id. So they could authorize on a different class id, if we didn't use category id explicitly.
                    "classes_users.is_admin": 1
                },
                "where": [ ["users.is_global_admin", ["categories.id", "classes_users.is_admin"] ], "users.id" ]
            },
            "delete": { 
                "params": {
                    "users.is_global_admin": 1,
                    "categories.id": request.query.id, // authorize on categories id again although it is not necessary. we could do class since we do a delete where all fields like get, we don't want the ability to delete more than one at a time.
                    "classes_users.is_admin": 1
                },
                "where": [ ["users.is_global_admin", ["categories.id", "classes_users.is_admin"] ], "users.id" ]
            }
        }, CategoryModel);
    }

}

module.exports = Category;