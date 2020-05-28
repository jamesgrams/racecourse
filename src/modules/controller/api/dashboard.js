/**
 * @file    Dashboard Controller
 * @author  James Grams
 * @abstract
 */

const ClassModel = require('../../model/mysql/class');
const Api = require('../api');

 /**
 * Class representing a Controller for the Dashboard Endpoints
 */
class Dashboard extends Api {

    /**
     * Constructor.
     * @param {request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor(request, response) {
        super(request, response, {
            "get": {} // we know at least user id will be specified.
        }, ClassModel);
    }

    /**
     * Get values for fields in a database.
     */
    async get() {
        if( isAllowed() ) {
            // Fetch all classes that the user is in.
            let rows = await new this.crudModel.fetchAll( null, [
                { 'table': 'classes_users', 'localKey': 'classes.id', 'foreignKey': 'class_id' },
                { 'table': 'users', 'localKey': 'user_id', 'foreignKey': 'users.id' },
            ] );
            this.standardRespond( false, {"items": rows} );
        }
        else {
            this.forbiddenRespond();
        }
    }

}

module.exports = Dashboard;