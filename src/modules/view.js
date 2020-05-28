/**
 * @file    View
 * @author  James Grams
 * @abstract
 */

 /**
 * Class representing a View.
 */
class View {

    /**
     * Constructor.
     */
    constructor() {}

    /**
     * Generate the HTML element for the view.
     * @abstract
     * @returns {HTMLElement} The nav HTML Element.
     */
    generateElement() {}

}

module.exports = View;