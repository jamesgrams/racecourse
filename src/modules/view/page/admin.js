/**
 * @file    Admin Page
 * @author  James Grams
 */

const Constants = require('../../../constants');
const Page = require('../page');
const Document = require("../../../document");

/**
 * Class representing the Admin Page.
 */
class Admin extends Page {

    /**
     * Constructor.
     * @param {boolean} [acceptsWebP] - True if the client can accept webp images.
     */
    constructor( acceptsWebP ) {
        super( Constants.PAGES.admin.name, Constants.PAGES.admin.description, acceptsWebP, Constants.PAGES.admin.path, Constants.PAGES.admin.js, Constants.PAGES.admin.css );
    }

    /**
     * Generate the specfic content for the dashboard page.
     * @returns {Array.<HTMLElement>} The content HTML Elements.
     */
    generateContent() {
        let pageItems = [];
    
        let adminSection = Document.document.createElement("div");
        adminSection.classList.add("admin");

        let tableSection = Document.document.createElement("table");
        tableSection.setAttribute("cellspacing", "0");
        adminSection.appendChild(tableSection);

        pageItems.push(adminSection);

        return pageItems;
    }

}

module.exports = Admin;