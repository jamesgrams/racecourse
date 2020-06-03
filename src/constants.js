/**
 * @file    Constants
 * @author  James Grams
 */

const ServerSpecific = require('./server-specific');

/**
 * Class representing Constants.
 * This file should include any text/media paths the user sees that is not dynamically generated.
 * In addition, other commonly used and changes values can be put in here.
 */
class Constants {}

// This is appended to the Title of every page
Constants.MAIN_NAME = "RaceCourse";
Constants.TITLE_APPEND = " | " + Constants.MAIN_NAME;

// These are the paths for the pages
Constants.PAGES = {
    login: {"name": "Login", "js": ["/assets/js/login.min.js"], "css": ["/assets/css/login.min.css", "/assets/css/form.min.css"], "path": "/login", "description": "Login to RaceCourse"},
    dashboard: {"name": "Dashboard", "js": ["/assets/js/dashboard.min.js"], "css": ["/assets/css/dashboard.min.css"], "path": "/", "description": "RaceCourse Dashboard"},
    class: {"name": "Class", "js": ["/assets/js/class.min.js","https://cdn.tiny.cloud/1/"+ServerSpecific.TINY_KEY+"/tinymce/5/tinymce.min.js"], "css": ["/assets/css/class.min.css"], "path": "/class", "description": "RaceCourse Class"},
    admin: {"name": "Admin", "js": ["/assets/js/admin.min.js"], "css": ["/assets/css/admin.min.css"], "path": "/admin", "description": "RaceCourse Admin"},
    notFound: {"name": "404", "js": [], "css": [], "path": "/404", "description": "404"}
}

Constants.API_PREFIX = "/api/";

// API endpoints
Constants.ENDPOINTS = {
    class: Constants.API_PREFIX + "class",
    user: Constants.API_PREFIX + "user",
    login: Constants.API_PREFIX + "login",
    classUser: Constants.API_PREFIX + "class-user",
    category: Constants.API_PREFIX + "category"
}

// The encoding of the site
Constants.ENCODING = "text/html; charset=utf-8";
// webp encoding
Constants.WEBP_ENCODING = "image/webp";
// json encoding
Constants.JSON_ENCDOING = "application/json";
// accept header
Constants.ACCEPT_HEADER = "Accept";

// good request
Constants.HTTP_OK = 200;
// bad request
Constants.HTTP_BAD_REQUEST = 422;
// Unauthorized
Constants.HTTP_FORBIDDEN = 401;
// Not found
Constants.HTTP_NOT_FOUND = 404;

// ajax success
Constants.AJAX_SUCCESS = "success";
// ajax failure
Constants.AJAX_FAILURE = "failure";

// Error messages
Constants.ERROR_MESSAGES = {
    "badInput": "You have entered invalid input. Please try again.",
    "failedConnection": "An error occurred while trying to connect to the database. Please try again.",
    "invalidCredentials": "Invalid credentials.",
    "missingRequiredFields": "Please fill out all required fields.",
    "noId": "No identifier specified."
};

// HTML Doctype
Constants.HTML_DOCTYPE = "<!DOCTYPE html>";

// Tables
Constants.TABLES = {
    classes: "classes",
    users: "users",
    classesUsers: "classes_users",
    categories: "categories"
}

// Default where column
Constants.DEFAULT_WHERE = "id";

// Length of the Scrypt key
Constants.CRYPTO_KEY_LEN = 128;
Constants.SALT_RANDOM_LEN = 20;
// Token expires in
Constants.TOKEN_OPTIONS = {"expiresIn": "2d"};
Constants.TOKEN_EXPIRES_IN_MS = 172800000;
// Token cookie
Constants.TOKEN_COOKIE = "racecourse-token";
Constants.ID_COOKIE = "racecourse-id";

// Log out button
Constants.LOG_OUT_BUTTON_TEXT = "Log Out";

// Hex to 32 bit hex
Constants.hexTo32BitHex = function(hex) {
    hex = hex.toString();
    let couplets = hex.match(/.{1,2}/g);
    let newString = "";
    for( let couplet of couplets ) {
        let sum = 0;
        for( let item of couplet ) {
            let intItem = parseInt(item);
            if( !intItem && intItem != 0 ) {
                intItem = item.charCodeAt(0);
                intItem = intItem - 87;
            }
            sum += intItem;
        }
        if( sum < 10 ) newString += sum.toString();
        else newString += String.fromCharCode(sum + 87);
    }
    return newString;
}

Constants.REDIRECT_PARAM = "r";

// Patterns
Constants.PATTERNS = {
    "email": "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$",
    "phone": "\\(\\d{3}\\)\\s\\d{3}\\s-\\s\\d{4}",
    "expiration": "(0[123456789]|1[012])\/\\d\\d",
    "card": "[3456]\\d{3}\\s\\d{4}\\s\\d{4}\\s\\d{4}"
}

// Form maxlengths
Constants.DEFAULT_FORM_MAX_LENGTH = 100;
Constants.EMAIL_MAX_LENGTH = 255;
Constants.MESSAGE_MAX_LENGTH = 2500;
Constants.EXPIRATION_DATE_MAX_LENGTH = 5;
Constants.CREDIT_CARD_MAX_LENGTH = 19;
Constants.ADDRESS_MAX_LENGTH = 500;
Constants.PHONE_MAX_LENGTH = 16;
Constants.GUESTS_MAX_LENGTH = 2;
Constants.ROOMS_MAX_LENGTH = 1;
Constants.ZIP_MAX_LENGTH = 20;

// Login Form
Constants.LOGIN_FORM_TITLE = "Login";
// Labels for the login form
Constants.LOGIN_LABELS = {
    email: "Email",
    password: "Password",
    submit: "Login"
}

// default email used for adding - don't allow to login with it.
Constants.DEFAULT_EMAIL = "new@grams.family";

Constants.LOGO_PATH = "/assets/images/logo-transparent.png";
Constants.LOGO_WEBP_PATH = "/assets/images/logo-transparent.webp";
Constants.LOGO_ALT = "Logo";

module.exports = Constants;