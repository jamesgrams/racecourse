/**
 * @file    Dashboard Page
 * @author  James Grams
 */

const Constants = require('../../../constants');
const Page = require('../page');
const Document = require("../../../document");

/**
 * Class representing the Login Page.
 */
class Dashboard extends Page {

    /**
     * Constructor.
     * @param {boolean} [acceptsWebP] - True if the client can accept webp images.
     */
    constructor( acceptsWebP ) {
        super( Constants.PAGES.dashboard.name, Constants.PAGES.dashboard.description, acceptsWebP, Constants.PAGES.dashboard.path, Constants.PAGES.dashboard.js, Constants.PAGES.dashboard.css );
    }

    /**
     * Generate the specfic content for the dashboard page.
     * @returns {Array.<HTMLElement>} The content HTML Elements.
     */
    generateContent() {
        let pageItems = [];
    
        let dashboardSection = Document.document.createElement("div");
        dashboardSection.classList.add("dashboard");

        pageItems.push(dashboardSection);

        return pageItems;
    }

}

module.exports = Dashboard;