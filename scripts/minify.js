const UglifyJS = require("uglify-js");
const uglifycss = require('uglifycss');
const fs = require('fs');

const jsFiles = ["assets\\js\\index.js", "assets\\js\\login.js", "assets\\js\\dashboard.js", "assets\\js\\class.js", "assets\\js\\admin.js"];
for( let jsFile of jsFiles ) {
    let contents = fs.readFileSync(jsFile, 'utf8');
    let minified = UglifyJS.minify(contents);
    if( minified.error ) console.log(minified.error);
    let newFile = jsFile.replace(/\.js/,".min.js");
    fs.writeFileSync(newFile, minified.code);
}
console.log("Minified JS...");

const cssFiles = ["assets\\css\\index.css", "assets\\css\\login.css", "assets\\css\\form.css", "assets\\css\\dashboard.css", "assets\\css\\class.css", "assets\\css\\admin.css"];
for( let cssFile of cssFiles ) {
    let contents = fs.readFileSync(cssFile, 'utf8');
    let minified = uglifycss.processString(contents);
    let newFile = cssFile.replace(/\.css/,".min.css");
    fs.writeFileSync(newFile, minified);
}
console.log("Minified CSS...");