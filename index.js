/* Libraries needed. */
var fs = require('fs'); // File system management.
var path = require('path'); // Path stuff.
var crypto = require('crypto'); // File name generation.
var formidable = require('formidable'); // Handles uploads.
var express = require('express'); // Web framework.

/* Config stuff. */
var configPath = 'config.json'; // Change this to wherever you keep the JSON config.
var configObj = parse(fs.readFileSync(configPath)); // Creates the JSONified config.

var serverConfig = get(configObj, 'server');
var dbConfig = get(configObj, 'database');

/* Variables from libraries and config. */
var app = express(); 

var app_name = get(serverConfig, 'name');
var app_description = get(serverConfig, 'description');
var app_port = get(serverConfig, 'port');
var app_frontpage_path = get(serverConfig, 'frontpage_Path');
var app_404_path = get(serverConfig, '404_path');
var app_domain = get(serverConfig, 'domain');

var app_upload_endpoint = get(serverConfig, 'upload_Endpoint');
var app_download_endpoint = get(serverConfig, 'download_Endpoint');
var app_upload_directory = get(serverConfig, 'upload_Directory');
var app_max_file_size = get(serverConfig, 'max_file_size'); // in megabytes.

/* Variables that should be customized the the user's liking. */
let frontpageTemplate = {
    name: app_name,
    description: app_description,
    upload_endpoint: app_upload_endpoint,
    max_file_size: app_max_file_size,
    domain: app_domain
};

let frontpage = generateFromTemplate(fs.readFileSync(app_frontpage_path).toString(), frontpageTemplate);
let upload_directory = path.join(__dirname, app_upload_directory)

/* Handle uploads. */
app.post(app_upload_endpoint, (req, res) => {
    form = new formidable.IncomingForm();

    form.uploadDir = app_upload_directory;
    form.keepExtensions = true;
    form.maxFileSize = app_max_file_size * 1024 * 1024;

    let newFileName = '';

    form.on('fileBegin', function(name, file) {
        newFileName = crypto.randomBytes(4).toString('hex') + '.' + file.name.split('.')[file.name.split('.').length - 1];
        file.path = path.join(upload_directory, newFileName);
    });

    form.on('file', function(name, file) {
        console.log('Uploaded file: ' + newFileName);
    });

    form.on('error', function(err) {
        console.log('Upload error! ' + err.toString());
        res.end();
    });

    form.on('aborted', function() {
        res.end();
    });

    form.on('end', function() {
        res.set('Content-Type', 'text/plain');
        res.send(path.join('http://', path.join(app_domain, path.join(app_download_endpoint, newFileName)) + '\n'));
        res.end();
    });

    form.parse(req);
});

/* Serve static page. */
app.get('/', (req, res) => {
    res.send(frontpage);
});

/* Handle downloads. */
app.get(path.join(app_download_endpoint, ':file'), (req, res) => {
    fileReq = req.params.file;
    fileReqPath = path.join(upload_directory, fileReq)

    if (fs.existsSync(fileReqPath)) {
        res.sendFile(fileReqPath);
    } else {
        res.status(404).send(fs.readFileSync(app_404_path).toString());
    }

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
