/**
 * @file    Select
 * @author  James Grams
 */

const View = require('../view');
const Document = require("../../document");

/**
 * Class representing a Select.
 */
class Select extends View {

    /**
     * Constructor.
     * @param {string} label - The label for the select.
     * @param {string} name - The name for this select.
     * @param {Array.<Object>} options - An array of options each with a name and value key.
     * @param {boolean} [required] - True if the input is required.
     */
    constructor( label, name, options, required ) {
        super();
        this.label = label;
        this.name = name;
        this.options = options;
        this.required = required;
    }

    /**
     * Generate the HTML element for the input.
     * @returns {HTMLElement} The input HTML Element.
     */
    generateElement() {
        let labelElement = Document.document.createElement("label");
        labelElement.setAttribute("for", this.name);
        let select = Document.document.createElement("select");
        select.setAttribute("name", this.name);
        select.setAttribute("id", this.name);
        select.setAttribute("aria-label", this.label);
        labelElement.innerHTML = this.label;
        if( this.required ) select.setAttribute("required","");
        for( let option of this.options ) {
            let optionElement = Document.document.createElement("option");
            optionElement.setAttribute("value",option.value);
            optionElement.innerHTML = option.name;
            select.appendChild(optionElement);
        }
        labelElement.appendChild(select);
        return labelElement;
    }

}

module.exports = Select;