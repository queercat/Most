/* Libraries needed. */
var fs = require('fs'); // File system management.
var PouchDB = require('pouchdb'); // JSON database.
var formidable = require('formidable'); // Handles uploads.
var express = require('express'); // Web framework.

/* Config stuff. */
var configPath = 'config.json'; // Change this to wherever you keep the JSON config.
var configObj = parse(fs.readFileSync(configPath)); // Creates the JSONified config.

var serverConfig = get(configObj, 'Server');
var dbConfig = get(configObj, 'Database');

/* Variables from libraries and config. */
var app = express(); 

var app_name = get(serverConfig, 'Name');
var app_description = get(serverConfig, 'Description');
var app_port = get(serverConfig, 'Port');
var app_frontpage_path = get(serverConfig, 'Frontpage_Path');

var app_upload_endpoint = get(serverConfig, 'Upload_Endpoint');
var app_download_endpoint = get(serverConfig, 'Download_Endpoint');

var db_name = get(dbConfig, 'Name');
var db_path = get(dbConfig, 'Path');

/* Variables that should be customized the the user's liking. */
var frontpageTemplate = {
    name: app_name,
    description: app_description,
    upload_endpoint: app_upload_endpoint
};

var frontpage = generateFromTemplate(fs.readFileSync(app_frontpage_path).toString(), frontpageTemplate);

/* Handle uploads. */
app.post(app_upload_endpoint, (req, resp) => {
    console.log('POSTed file.');
});

/* Serve page. */
app.get('/', (req, res) => {
    res.send(frontpage);
});

/* Handle downloads. */
app.get(app_download_endpoint, (req, res) => {
    console.log('REQed file.');
});

/**
 * @desc Generate text from a template with replacements. 
 * @param {String} str string to find things and replace with things.
 * @param {JSON Obj} templateObj a JSON representative of the {params} to replace.
 * @returns {String} the generated text from the template.
 */
function generateFromTemplate(str, templateObj) {
    let occurenceIndex = 0;

    while(str.indexOf('{', occurenceIndex) != -1 && str.indexOf('}') != -1) {
        startCurly = occurenceIndex = str.indexOf('{', occurenceIndex);
        endCurly = str.indexOf('}', occurenceIndex);

        /* Replace all the text with the template text. */
        oldStr = str.slice(startCurly, endCurly + 1)
        newStr = get(templateObj, oldStr.slice(1, oldStr.length - 1)); 

        str = replace(str, oldStr, newStr);
    }

    return str;

    /** [Example] 
     * var str = 'that is {adjective}'
     * var template = {adjective: 'cool'}
     * generateFromTemplate(str, template);
     * 
     * [Output]
     * that is cool
     */
}

/**
 * @param {String} origStr the string to search for old-string with and replace with new-string.
 * @param {String} oldStr search for this exact string and replace it with the new string. 
 * @param {String} newStr the new string to replace the old string.
 * @returns {String} the newly replaced string.
 */
function replace(origStr, oldStr, newStr) {
    return origStr.replace(oldStr, newStr);
}

/**
 * @desc Returns a parameter from a JSON object.
 * @param {JSON Obj} obj the JSON object to extract the parameter from.
 * @param {String} param the parameter to extract from the JSON object. 
 * @returns {String | JSON Obj} the value of the param from the JSON object.
 */
function get(obj, param) {
    return obj[param];
}

/**
 * @desc Turns a string into a JSON object.
 * @param {String} str string to parse.
 * @returns {JSON Obj}  returns the new JSONified string.
 */
function parse(str) {
    return JSON.parse(str);
}

/* Start the app and listen for incoming connections. */
console.log(app_name + ' listening on *:' + app_port);
app.listen(app_port);