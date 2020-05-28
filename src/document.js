/**
 * @file    Document
 * @author  James Grams
 */

const Constants = require('./constants');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/**
 * Class representing a document.
 */
class Document {}

Document.document = new JSDOM(Constants.HTML_DOCTYPE).window.document;

module.exports = Document;