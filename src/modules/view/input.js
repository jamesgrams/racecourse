/**
 * @file    Input
 * @author  James Grams
 */

const View = require('../view');
const Document = require("../../document");
const Constants = require("../../constants");

/**
 * Class representing an Input.
 */
class Input extends View {

    /**
     * Constructor.
     * @param {string} label - The label for the input.
     * @param {string} name - The name for this input.
     * @param {string} type - The type of input.
     * @param {boolean} [required] - True if the input is required.
     * @param {number} [maxlength] - The maximum length of the input.
     * @param {*} [defaultValue] - The default value for the field.
     * @param {string} [pattern] - The pattern for this field.
     * @param {Object} [attributes] - Further attributes to add the to field.
     */
    constructor( label, name, type, required, maxlength, defaultValue, pattern, attributes ) {
        super();
        this.label = label;
        this.name = name;
        this.type = type;
        this.required = required;
        this.maxlength = maxlength;
        this.defaultValue = defaultValue;
        this.pattern = pattern;
        this.attributes = attributes;
    }

    /**
     * Generate the HTML element for the input.
     * @returns {HTMLElement} The input HTML Element.
     */
    generateElement() {
        let labelElement = Document.document.createElement("label");
        labelElement.setAttribute("for", this.name);
        let description = Document.document.createElement("span");
        description.innerHTML = this.label;
        let input = Document.document.createElement(this.type == "textarea" ? this.type : "input");
        //input.setAttribute("placeholder", label);
        input.setAttribute("type", this.type);
        input.setAttribute("name", this.name);
        input.setAttribute("id", this.name);
        if( this.type == "email" ) input.setAttribute("pattern", Constants.PATTERNS.email);
        if( this.type == "tel" ) input.setAttribute("pattern", Constants.PATTERNS.phone);
        if( this.pattern ) input.setAttribute("pattern", this.pattern);
        if( this.type == "textarea" ) input.setAttribute("aria-label", this.label);
        if( this.required ) input.setAttribute("required","");
        if( this.maxlength ) input.setAttribute("maxlength", this.maxlength);
        if( this.defaultValue ) input.setAttribute("value", this.defaultValue);
        if( this.attributes ) {
            let keys = Object.keys(this.attributes);
            for( let key of keys ) {
                input.setAttribute(key, this.attributes[key]);
            }
        }
        labelElement.appendChild(input);
        labelElement.appendChild(description);
        return labelElement;
    }

}

module.exports = Input;