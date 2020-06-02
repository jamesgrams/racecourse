/**
 * @file    Class Page
 * @author  James Grams
 */

const Constants = require('../../../constants');
const Page = require('../page');
const Document = require("../../../document");

/**
 * Class representing the Class Page.
 */
class Class extends Page {

    /**
     * Constructor.
     * @param {boolean} [acceptsWebP] - True if the client can accept webp images.
     */
    constructor( acceptsWebP ) {
        super( Constants.PAGES.class.name, Constants.PAGES.class.description, acceptsWebP, Constants.PAGES.class.path, Constants.PAGES.class.js, Constants.PAGES.class.css );
    }

    /**
     * Generate the specfic content for the dashboard page.
     * @returns {Array.<HTMLElement>} The content HTML Elements.
     */
    generateContent() {
        let pageItems = [];
    
        let classSection = Document.document.createElement("div");
        classSection.classList.add("class");

        let title = Document.document.createElement("h1");
        title.classList.add("class-title");
        classSection.appendChild(title);

        let infoSection = Document.document.createElement("div");
        infoSection.classList.add("class-info");
        classSection.appendChild(infoSection);

        let categoriesSection = Document.document.createElement("ul");
        categoriesSection.classList.add("categories");
        infoSection.appendChild(categoriesSection);

        let contentSection = Document.document.createElement("div");
        contentSection.classList.add("content");
        infoSection.appendChild(contentSection);

        let editorSection = Document.document.createElement("div");
        editorSection.classList.add("editor");
        contentSection.appendChild(editorSection);

        pageItems.push(classSection);

        return pageItems;
    }

}

module.exports = Class;