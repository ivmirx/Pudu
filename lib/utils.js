var Fs = require('fs'),
	Path = require('path'),
	Yaml = require('js-yaml'),
	Showdown = require('showdown');

var config = require('./config');

var mdConverter = new Showdown.Converter(config.markdownSettings);
mdConverter.setFlavor(config.markdownFlavor);

var start = process.hrtime();

exports.loadFile = loadFile;
exports.loadAndConvertFile = loadAndConvertFile;
exports.fillNulls = fillNulls;
exports.keysFromDirectory = keysFromDirectory;
exports.getNestedItem = getNestedItem;
exports.logTime = logTime;

function loadFile(filepath) {
	return Fs.readFileSync(filepath, 'utf8');
}

function loadAndConvertFile(filepath, extname) {
	var item = loadFile(filepath);
	// text = text.replace(/\n$/, ''); // last string added by ST

	if (extname == config.yamlExtension) {
		// TODO: threads
		// convert YAML to JSON object
		item = Yaml.safeLoad(item);
	}
	else if (extname == config.markdownExtension) {
		// TODO: threads
		// convert Markdown to HTML
		item = mdConverter.makeHtml(item);
	}

	return item;
}

function fillNulls(object, copycat) {
	if (object == null || typeof object !== 'object') {
		return;
	}

	for (var key in object) {
		if (copycat[key] == null) {
			copycat[key] = object[key];
		}
		else {
			fillNulls(object[key], copycat[key]);
		}
	}
}

// objects mirror folders
function keysFromDirectory(relativePath) {
	var keys = relativePath.split(Path.sep);

	if (keys == null || keys[0].length == 0) {
		keys.shift();
	}

	if (keys[keys.length-1] == '_root') { // use '_root' folder for organizing
		keys.pop();
	}

	return keys;
}

function getNestedItem(object, nestedPath) {
	var pointer = object;

	for (var i = 0; i < nestedPath.length; i++) {
		var item = nestedPath[i];

		if (pointer[item] == null) {
			pointer[item] = {};
		}

		pointer = pointer[item];
	}

	return pointer;
}

function logTime(note) {
	var seconds = process.hrtime(start)[0] + process.hrtime(start)[1] / 1000000000;
	console.log(note + ': ' + seconds.toFixed(3) + ' seconds');
	start = process.hrtime();
}
