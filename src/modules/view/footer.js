/**
 * @file    Footer
 * @author  James Grams
 */

const Constants = require('../../constants');
const View = require('../view');
const Document = require("../../document");

/**
 * Class representing a Footer.
 */
class Footer extends View {

    /**
     * Constructor.
     * @param {Document} document - The JSDOM document.
     */
    constructor( document ) {
        super( document );
    }

    /**
     * Generate the HTML element for the footer.
     * @returns {HTMLElement} The footer HTML Element.
     */
    generateElement() {
        let footer = Document.document.createElement("footer");
        let copyright = Document.document.createElement("div");
        copyright.classList.add("copyright");
        let currentYear = new Date().getFullYear();
        copyright.innerHTML = "&copy; " + currentYear;
        footer.appendChild(copyright);
    
        return footer;
    }

}

module.exports = Footer;