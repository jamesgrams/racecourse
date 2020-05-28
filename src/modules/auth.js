/**
 * @file    Authentication Controller
 * @author  James Grams
 * @abstract
 */

const UserModel = require('./model/mysql/user');
const jwt = require("jsonwebtoken");
const Pool = require("../pool");
const crypto = require("crypto");
const ServerSpecific = require("../server-specific");
const Constants = require("../constants");

 /**
 * Class representing Authentication functions.
 */
class Auth {

    /**
     * Constructor.
     * @param {Request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }

    /**
     * Create an access token.
     */
    async createToken() {
        let email = this.request.body.email;
        let password = this.request.body.password;
        if( !email || !password ) {
            this.respondLogin();
            return;
        }

        let userModel = new UserModel( Pool.pool, { 
            "email": email
        } );

        userModel.fetch();

        if(rows.length) {
            if( crypto.scryptSync(password, userModel.salt, Constants.CRYPTO_KEY_LEN).toString("hex") == userModel.hash ) {
                let token = jwt.sign( {"user": userModel["id"], "email": userModel["email"]}, ServerSpecific.TOKEN_KEY, Constants.TOKEN_OPTIONS );
                this.response.cookie( Constants.TOKEN_COOKIE, token, { maxAge: Constants.TOKEN_EXPIRES_IN_MS} );
                this.respondLogin(token);
            }
            else {
                this.respondLogin();
            }
        }
        else {
            this.respondLogin();
        }
    }

    /**
     * Respond to a login request.
     * @param {String} [token] - The access token or blank if there is none.
     */
    respondLogin( token ) {
        this.response.set({ 'content-type': Constants.JSON_ENCDOING });
        this.response.status( token ? Constants.HTTP_OK : Constants.HTTP_FORBIDDEN );

        if( !token ) {
            this.response.end( JSON.stringify({"status": Constants.AJAX_FAILURE, "errorMessage": Constants.ERROR_MESSAGES.invalidCredentials}) );
        }
        else {
            this.response.end( JSON.stringify({"status": Constants.AJAX_SUCCESS, "token": token}) );
        }
    }

    /**
     * Validate the header token.
     * @param {Object} [params] - An optional object with keys being keys in the users/classes/classesUsers tables and values being
     * the expected value, that the user should have a record for in order to validate. (e.g. {"classes.id": 3, "classes_users.is_admin": 1})
     * @param {Array.<string|Array>} [where] - An array of keys that will be set in the mysql - allows for or.
     */
    async validateToken( params={}, where=null ) {
        let token = this.request.cookies[Constants.TOKEN_COOKIE];
        if( token ) {
            try {
                let result = jwt.verify( token, ServerSpecific.TOKEN_KEY, Constants.TOKEN_OPTIONS );

                // Got a valid token, let's see if it's valid for where we are going.
                params["users.id"] = result.user;
                
                // remember, where defaults to all the keys currently in the object
                let userModel = new UserModel( Pool.pool, params );
        
                let rows = await userModel.fetchAll( where, [
                    { 'table': 'classes_users', 'localKey': 'users.id', 'foreignKey': 'user_id', 'joinType': 'left outer' },
                    { 'table': 'classes', 'localKey': 'class_id', 'foreignKey': 'classes.id', 'joinType': 'left outer' },
                ], ["classes.id"]);

                this.request.tokenData = {email: result.email};

                if( rows.length ) return true;
                return false;
            }
            catch(err) {
                return false; // Invalid token
            }
        }
        else {
            return false;
        }
    }

}

module.exports = Auth;