/**
 * @file    Picture
 * @author  James Grams
 */

const View = require('../view');
const Document = require("../../document");

/**
 * Class representing a Picture.
 */
class Picture extends View {

    /**
     * Constructor.
     * @param {String} src - The standard url of picture. 
     * @param {String} webpSrc - The url of the webp picture.
     * @param {String} alt - The alt text for the image.
     */
    constructor( src, webpSrc, alt ) {
        super();
        this.src = src;
        this.webpSrc = webpSrc;
        this.alt = alt;
    }

    /**
     * Generate the HTML element for the picture.
     * @returns {HTMLElement} The picture HTML Element.
     */
    generateElement() {
        let picture = Document.document.createElement("picture");
        let source = Document.document.createElement("source");
        source.setAttribute("type", "image/webp");
        source.setAttribute("srcset", this.webpSrc);
        picture.appendChild(source);
        source = Document.document.createElement("source");
        source.setAttribute("srcset", this.src);
        picture.appendChild(source);
        let img = Document.document.createElement("img");
        img.setAttribute("src", this.src);
        img.setAttribute("alt", this.alt);
        picture.appendChild(img);
        return picture;
    }

}

module.exports = Picture;