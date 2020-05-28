/**
 * @file    API Controller
 * @author  James Grams
 * @abstract
 */

const Controller = require("../controller");
const Constants = require('../../constants');
const Pool = require('../../pool');

 /**
 * Class representing an API Controller.
 */
class Api extends Controller {

    /**
     * Constructor.
     * @param {Request} request - The request object.
     * @param {Response} response - The response object.
     * @param {Object} authInfo - An object with keys being methods, and values being an object with keys of params and where to send to the auth controller.
     * @param {Model} crudModel - The model to use for CRUD operations.
     */
    constructor(request, response, authInfo, crudModel) {
        super( request, response, authInfo );
        this.crudModel = crudModel;
    }

    /**
     * Add fields to the database.
     */
    async add() {
        if( await isAllowed() ) {
            let errorMessage = false;
            try {
                await new this.crudModel( Pool.pool, this.generateParametersMap() ).insert();
            }
            catch(err) {
                console.log(err);
                errorMessage = Constants.ERROR_MESSAGES.failedConnection;
            }

            this.standardRespond( errorMessage );
        }
        else {
            this.forbiddenRespond();
        }
    }

    /**
     * Update fields in the database.
     */
    async update() {
        if( await isAllowed() ) {
            let errorMessage = false;
            try {
                // default where column is id
                await new this.crudModel( Pool.pool, this.generateParametersMap() ).update();
            }
            catch(err) {
                console.log(err);
                errorMessage = Constants.ERROR_MESSAGES.failedConnection;
            }

            this.standardRespond( errorMessage );
        }
        else {
            this.forbiddenRespond();
        }
    }

    /**
     * Get values for fields in a database.
     */
    async get() {
        if( await isAllowed() ) {
            let rows = await new this.crudModel( Pool.pool, this.generateParametersMap( true ) ).fetchAll();
            this.standardRespond( false, {"items": rows} );
        }
        else {
            this.forbiddenRespond();
        }
    }

    /**
     * Delete a record from the database.
     */
    async update() {
        if( await isAllowed() ) {
            let errorMessage = false;
            try {
                // default where column is id
                await new this.crudModel( Pool.pool, this.generateParametersMap() ).delete();
            }
            catch(err) {
                console.log(err);
                errorMessage = Constants.ERROR_MESSAGES.failedConnection;
            }

            this.standardRespond( errorMessage );
        }
        else {
            this.forbiddenRespond();
        }
    }

    /**
     * Respond to a forbidden request.
     */
    forbiddenRespond() {
        this.response.set({ 'content-type': Constants.JSON_ENCDOING });
        this.response.status( Constants.HTTP_FORBIDDEN );
        this.response.end( JSON.stringify( {"status": Constants.AJAX_FAILURE}) );
    }

    /**
     * Generate a parameter map.
     * @param {boolean} [useQuery] - True if we should use the query parameters instead of the body.
     * @returns {Object} - A map of parameters and their values.
     * Note: Whether or not we use query parameters should match with the values that we are authenticating on. So, for example, we use query parameters for gets -
     * So we should athenticate with the field in the query parameter. This prevents people from authenticating with one field in the body, but then accessing another
     * value.
     */
    generateParametersMap( useQuery=false ) {
        let type = useQuery ? "query" : "body";
        let map = {};
        for( let field of this.crudModel.FIELDS ) {
            if (this.request[type][field]) map[field] = this.request[type][field];
        }
        return map;
    }

    /**
     * Create a standard response for API functions.
     * @param {(boolean|string)} errorMessage - An error message or false if there is none.
     * @param {Object} object - The object to include in the JSON.
     */
    standardRespond( errorMessage, object ) {
        this.response.set({ 'content-type': Constants.JSON_ENCDOING });

        if( !object ) object = {};

        let responseObject = {};
        let code = Constants.HTTP_OK;
        responseObject.status = Constants.AJAX_SUCCESS;
        if( errorMessage ) {
            responseObject.status = Constants.AJAX_FAILURE;
            code = Constants.HTTP_BAD_REQUEST;
            responseObject.errorMessage = errorMessage;
        }

        this.response.status(code);

        responseObject = Object.assign( responseObject, object );
        this.response.end(JSON.stringify(responseObject));
    }

}

module.exports = Api;