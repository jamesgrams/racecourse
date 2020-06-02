/**
 * @file    Admin Controller
 * @author  James Grams
 * @abstract
 */

const Html = require("../html");
const AdminView = require("../../view/page/admin");

 /**
 * Class representing an Admin Controller.
 */
class Admin extends Html {

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
                }
            }
        },
        AdminView );
    }

}

module.exports = Admin;