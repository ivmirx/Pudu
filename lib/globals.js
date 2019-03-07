var Path = require('path'),
	File = require('file'),
	Recursive = require('recursive-readdir');

var config = require('./config'),
	utils = require('./utils'),
	roots = require('./roots');

exports.load = load;

function load(onLoaded) {
	var localizedGlobalItems = {};
	addLocaleRoots(localizedGlobalItems);

	Recursive(roots.GLOBALS, config.ignoredFiles, function(err, files) {
		for (var i = files.length - 1; i >= 0; i--) {
			var filepath = files[i];
			var extname = Path.extname(filepath);
			var item = utils.loadAndConvertFile(filepath, extname);

			var locale = config.mainLocale;
			var parts = Path.basename(filepath, extname).split('~');

			if (parts.length == 2) {
				locale = parts[1];
			}
			else if (parts.length > 2) {
				console.error('Wrong file name: ' + filepath);
			}

			// object nesting reflects the directory structure in `globals/`
			var directory = Path.dirname(filepath);
			var relativeDirectory = File.path.relativePath(roots.GLOBALS, directory);

			var keys = utils.keysFromDirectory(relativeDirectory);
			keys.unshift(config.globalsPrefix);

			var parent = utils.getNestedItem(localizedGlobalItems[locale], keys);
			var name = Path.basename(filepath, extname);

			if (parent[name] != null) {
				console.error('Trying to assign global item "' + filepath + '" to an occupied key with the same name!');
				process.exit(1);
			}

			parent[parts[0]] = item;
		}

		// copy values from the main locale if some translations are missing
		for (var i = config.additionalLocales.length - 1; i >= 0; i--) {
			var locale = config.additionalLocales[i];
			utils.fillNulls(localizedGlobalItems[config.mainLocale], localizedGlobalItems[locale]);
		}

		// console.log(localizedGlobalItems);
		onLoaded(localizedGlobalItems);
	});
}

function addLocaleRoots(object) {
	object[config.mainLocale] = {};

	for (var i = config.additionalLocales.length - 1; i >= 0; i--) {
		var locale = config.additionalLocales[i];
		object[locale] = {};
	}
}
