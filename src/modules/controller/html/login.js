/**
 * @file    Login Controller
 * @author  James Grams
 * @abstract
 */

const Html = require("../html");
const LoginView = require("../../view/page/login");

 /**
 * Class representing a Login Controller.
 */
class Login extends Html {

    /**
     * Constructor.
     * @param {Request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor( request, response ) {
        super( request, response, {
            "standardRespond": {
                "params": false // means all allowed
            }
        },
        LoginView );
    }

}

module.exports = Login;