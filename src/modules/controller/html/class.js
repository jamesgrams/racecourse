/**
 * @file    Class Controller
 * @author  James Grams
 * @abstract
 */

const Html = require("../html");
const ClassView = require("../../view/page/class");

 /**
 * Class representing a Class Controller.
 */
class Class extends Html {

    /**
     * Constructor.
     * @param {Request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor( request, response ) {
        super( request, response, {
            "standardRespond": {
                "params": {
                    "users.is_global_admin": 1,
                    "classes.id": request.query.id
                },
                "where": [ ["users.is_global_admin", "classes.id"], "users.id" ]
            }
        },
        ClassView );
    }

}

module.exports = Class;