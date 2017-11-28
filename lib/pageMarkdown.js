var Path = require('path');

var config = require('./config'),
	utils = require('./utils');

exports.loadMarkdown = loadMarkdown;

function loadMarkdown(pageConfig, filename, directory, files) {
	var mdNames = pageConfig['_markdown'];
	if (mdNames == null) {
		return;
	}

	if (mdNames instanceof Array == false) {
		console.error('"_markdown" must be a YAML sequence');
		exit(directory, filename);
	}

	for (var i = mdNames.length - 1; i >= 0; i--) {
		var item = mdNames[i];

		if (item == null || typeof item !== 'object') {
			console.error('"_markdown" sequence must store file references in "key: filename" format');
			exit(directory, filename);
		}

		var itemKeys = Object.keys(item);
		if (itemKeys.length != 1) {
			console.error('"_markdown" sequence can\'t have more than one key in each object');
			exit(directory, filename);
		}

		var key = itemKeys[0];
		var name = item[key];
		var filename = name + config.markdownExtension;

		if (files.indexOf(filename) == -1) {
			console.error('Markdown file not found');
			exit(directory, filename);
		}

		if (pageConfig[key] != null) {
			console.error('Trying to assign Markdown file "' + filename + '" to an occupied key "' + key + '"');
			exit(directory, filename);
		}

		var path = Path.join(directory, filename);
		pageConfig[key] = utils.loadAndConvertFile(path, config.markdownExtension);
	}

	return;
}

function exit(directory, filename) {
	console.error(Path.join(directory, filename));
	process.exit(1);
}
