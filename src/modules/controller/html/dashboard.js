/**
 * @file    Dashboard Controller
 * @author  James Grams
 * @abstract
 */

const Html = require("../html");
const DashboardView = require("../../view/page/dashboard");

 /**
 * Class representing a Dashboard Controller.
 */
class Dashboard extends Html {

    /**
     * Constructor.
     * @param {Request} request - The request object.
     * @param {Response} response - The response object.
     */
    constructor( request, response ) {
        super( request, response, {
            "standardRespond": {}
        },
        DashboardView );
    }

}

module.exports = Dashboard;