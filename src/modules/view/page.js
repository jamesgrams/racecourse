/**
 * @file    Page
 * @author  James Grams
 * @abstract
 */

const Constants = require('../../constants');
const View = require('../view');
const Footer = require('./footer');
const Document = require("../../document");
const Picture = require("./picture");

/**
 * Class representing a page.
 */
class Page extends View {

    /**
     * Constructor.
     * @param {string} title - The title of the page.
     * @param {string} description - The description of the page.
     * @param {boolean} [acceptsWebP] - True if the client can accept webp images.
     * @param {string} [path] - The path the client is currently on.
     * @param {Array.<string>} [jsFiles] - JavaScript files needed for this page.
     * * @param {Array.<string>} [cssFiles] - CSS files needed for this page.
     */
    constructor( title, description, acceptsWebP, path, jsFiles, cssFiles ) {
        super();
        this.title = title;
        this.description = description;
        this.acceptsWebP = acceptsWebP;
        this.path = path;
        this.jsFiles = jsFiles ? jsFiles : [];
        this.jsFiles.push("/assets/js/index.min.js");
        this.jsFiles = this.jsFiles.filter( function(item, i, ar) { return ar.indexOf(item) === i; }); // unique
        this.cssFiles = cssFiles ? cssFiles : [];
        this.cssFiles.push("/assets/css/index.min.css");
        this.cssFiles.push("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap");
        this.cssFiles = this.cssFiles.filter( function(item, i, ar) { return ar.indexOf(item) === i; }); // unique
    }

    /**
     * Generate the HTML content for the page.
     * @abstract
     * @returns {Array.<HTMLElement>} An array of HTML elements for the page.
     */
    generateContent() {}

    /**
     * Generate the HTML element for the page.
     * @returns {HTMLElement} The page HTML Element.
     */
    generateElement() {
        let content = this.generateContent();

        let html = Document.document.createElement("html");
        html.setAttribute("lang","en-us");
        if( this.acceptsWebP ) html.classList.add("webp");

        let head = Document.document.createElement("head");

        // add preloads
        for( let jsFile of this.jsFiles ) {
            let preloadLink = Document.document.createElement("link");
            preloadLink.setAttribute("rel", "preload");
            preloadLink.setAttribute("as", "script");
            preloadLink.setAttribute("href", jsFile);
            head.appendChild(preloadLink);
        }

        // Add favicons
        head.innerHTML += '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="manifest" href="/site.webmanifest"><link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"><meta name="msapplication-TileColor" content="#4287f5"><meta name="theme-color" content="#4287f5">';

        // Add stylesheets
        for( let cssFile of this.cssFiles ) {
            let link = Document.document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", cssFile);
            head.appendChild(link);
        }

        let titleElement = Document.document.createElement("title");
        titleElement.innerHTML = this.constructor.createTitle(this.title ? this.title : "");
        head.appendChild(titleElement);
        
        let meta = Document.document.createElement("meta");
        meta.setAttribute("name", "description");
        meta.setAttribute("content", this.description ? this.description : "");
        head.appendChild(meta);

        let viewport = Document.document.createElement("meta");
        viewport.setAttribute("name", "viewport");
        viewport.setAttribute("content","width=device-width, initial-scale=1");
        head.appendChild(viewport);

        html.appendChild(head);

        let body = Document.document.createElement("body");
        let header = Document.document.createElement("header");
        let homeLink = Document.document.createElement("a");
        homeLink.setAttribute("href", Constants.PAGES.dashboard.path);
        homeLink.appendChild( new Picture(Constants.LOGO_SMALL_PATH, Constants.LOGO_SMALL_PATH_WEBP, Constants.LOGO_ALT).generateElement() );
        homeLink.innerHTML += Constants.MAIN_NAME;
        homeLink.classList.add("ajax-link");
        header.appendChild(homeLink);
        let nameSection = Document.document.createElement("div");
        nameSection.classList.add("user-name");
        header.appendChild(nameSection);
        let buttonsSection = Document.document.createElement("div");
        buttonsSection.classList.add("buttons");
        header.appendChild(buttonsSection);
        body.appendChild(header);
        
        let contentWrapper = Document.document.createElement("main");
        contentWrapper.setAttribute("id","content-wrapper");
        for( let i=0; i<content.length; i++ ) {
            contentWrapper.appendChild(content[i]);
        }
        body.appendChild(contentWrapper);

        body.appendChild(new Footer().generateElement());

        for( let jsFile of this.jsFiles ) {
            let js = Document.document.createElement("script");
            js.setAttribute("src", jsFile);
            body.appendChild(js);
        }

        html.appendChild(body);

        return html;
    }

    /**
     * Generate the information necessary for this page to be sent in an ajax request.
     * @returns {Object} The object containing only necessary page information.
     */
    generateAjax() {
        let html = this.generateContent().map( el => el.outerHTML );
        let joinedContent = html.join("");
        return {
            title: this.constructor.createTitle(this.title), 
            content: joinedContent, 
            description: this.description,
            js: this.jsFiles,
            css: this.cssFiles
        };
    }

    /**
     * Create a title of a page.
     * @param {String} title - The title of the page without anything appended.
     * @returns {String} The title of the page.
     */
    static createTitle(title) {
        return title + Constants.TITLE_APPEND;
    }

}

module.exports = Page;