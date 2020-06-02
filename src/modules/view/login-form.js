/**
 * @file    Login
 * @author  James Grams
 */

const Constants = require('../../constants');
const View = require('../view');
const Input = require('./input');
const Document = require("../../document");

/**
 * Class representing a Login Form.
 */
class Login extends View {

    /**
     * Constructor.
     */
    constructor() {
        super();
    }

    /**
     * Generate the HTML element for the login form.
     * @returns {HTMLElement} The login HTML Element.
     */
    generateElement() {
        let form = Document.document.createElement("form");
        form.setAttribute("data-endpoint", Constants.ENDPOINTS.login);
        form.setAttribute("aria-labelledby", "login-title");
        
        let title = Document.document.createElement("h2");
        title.classList.add("form-title");
        title.setAttribute("id", "login-title");
        title.innerHTML = Constants.LOGIN_FORM_TITLE;
        form.appendChild(title);
    
        let usernameInput = new Input(Constants.LOGIN_LABELS.email, "email", "email", true, Constants.EMAIL_MAX_LENGTH).generateElement();
        let passwordInput = new Input(Constants.LOGIN_LABELS.password, "password", "password", true, Constants.DEFAULT_FORM_MAX_LENGTH).generateElement();
        let button = Document.document.createElement("button");
        button.setAttribute("aria-label", Constants.LOGIN_LABELS.submit);
        button.setAttribute("aria-live", "polite");
        button.innerHTML = Constants.LOGIN_LABELS.submit;
        
        form.appendChild(usernameInput);
        form.appendChild(passwordInput);
        form.appendChild(button);
    
        return form;
    }

}

module.exports = Login;