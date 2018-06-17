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
var app_description = get(serverConfig, 'Config');
var app_port = get(serverConfig, 'Port');

var db_name = get(dbConfig, 'Name');
var db_path = get(dbConfig, 'Path');



/**
 * @desc Returns a parameter from a JSON object.
 * @param {JSON Obj} obj the JSON object to extract the parameter from.
 * @param {String} param the parameter to extract from the JSON object. 
 * @returns {String | JSON Obj} 
 */
function get(obj, param) {
    return obj[param];
}

/**
 * @desc Turns a string into a JSON object.
 * @param {String} str string to parse.
 * @returns {JSON Obj} 
 */
function parse(str) {
    return JSON.parse(str);
}

/* Start the app and listen for incoming connections. */
console.log(app_name + ' listening @' + app_port);
app.listen(app_port);