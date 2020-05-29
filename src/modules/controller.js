/**
 * @file    Controller
 * @author  James Grams
 * @abstract
 */

const Auth = require("./auth");

 /**
 * Class representing a Controller.
 */
class Controller {

    /**
     * Constructor.
     * @param {Request} request - The request object.
     * @param {Response} response - The response object.
     * @param {Object} authInfo - An object with keys being methods, and values being an object with keys of params and where to send to the auth controller.
     */
    constructor(request, response, authInfo) {
        this.request = request;
        this.response = response;
        this.authInfo = authInfo;
    }

    /**
     * Create a standard response for functions.
     * @abstract
     */
    standardRespond() {}

    /**
     * Create a forbidden response for functions.
     * @abstract
     */
    forbiddenRespond() {}

    /**
     * Determine if the user is allowed to perform the method.
     * @param {string} callerName - The name of the caller function permissions-wise.
     */
    async isAllowed( callerName ) {
        let auth = new Auth(this.request, this.response);
        if( !this.authInfo[callerName] ) return false; // If they do not specify an access object for the method, the method is NOT allowed.
        let isAllowed = await auth.validateToken(this.authInfo[callerName].params, this.authInfo[callerName].where);
        return isAllowed;
    }

}

module.exports = Controller;