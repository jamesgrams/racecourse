/**
 * @file    Login Page
 * @author  James Grams
 */

const Constants = require('../../../constants');
const Page = require('../page');
const LoginForm = require('../login-form');
const Document = require("../../../document");

/**
 * Class representing the Login Page.
 */
class Login extends Page {

    /**
     * Constructor.
     * @param {boolean} [acceptsWebP] - True if the client can accept webp images.
     */
    constructor( acceptsWebP ) {
        super( Constants.PAGES.login.name, Constants.PAGES.login.description, acceptsWebP, Constants.PAGES.login.path, Constants.PAGES.login.js, Constants.PAGES.login.css );
    }

    /**
     * Generate the specfic content for the login page.
     * @returns {Array.<HTMLElement>} The content HTML Elements.
     */
    generateContent() {
        let pageItems = [];
    
        let loginSection = Document.document.createElement("div");
        loginSection.classList.add("login");

        let loginForm = new LoginForm(Document.document).generateElement();
        loginSection.appendChild(loginForm);

        pageItems.push(loginSection);

        return pageItems;
    }

}

module.exports = Login;