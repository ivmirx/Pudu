var Path = require('path'),
	File = require('file'),
	Recursive = require('recursive-readdir'),
	Handlebars = require('handlebars');

var config = require('./config'),
	utils = require('./utils'),
	roots = require('./roots');

exports.load = load;

function load(onLoaded) {
	var partials = {};

	Recursive(roots.PARTIALS, config.ignoredFiles, function(err, files) {
		for (var i = files.length - 1; i >= 0; i--) {
			var filepath = files[i];
			var extname = Path.extname(filepath);
			var item = utils.loadAndConvertFile(filepath, extname);

			// object nesting reflects the directory structure in `partials/`
			var directory = Path.dirname(filepath);
			var relativeDirectory = File.path.relativePath(roots.PARTIALS, directory);

			var keys = utils.keysFromDirectory(relativeDirectory);
			keys.unshift(config.partialsPrefix);

			var parent = utils.getNestedItem(partials, keys);
			var name = Path.basename(filepath, extname);
			parent[name] = item;
		}

		registerPartials(partials, []);
		onLoaded();
	});
}

// Handlebars requires partials to be "registered" before template compilation
function registerPartials(object, nestedPath) {
	for (var key in object) {
		var item = object[key];

		if (typeof item === 'string') {
			var id = nestedPath.join('.') + '.' + key;
			Handlebars.registerPartial(id, item);
		}
		else {
			// we need to go deeper
			var currentPath = nestedPath.slice();
			currentPath.push(key);
			registerPartials(item, currentPath);
		}
	}
}
