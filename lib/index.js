var Fs = require('fs'),
	Path = require('path');

var config = require('./config'),
	roots = require('./roots'),
	partials = require('./partials'),
	templates = require('./templates'),
	shared = require('./shared'),
	pages = require('./pages'),
	generator = require('./generator'),
	utils = require('./utils');

exports.generate = generate;

function generate() {
	if (Fs.existsSync('./config.yaml') == false) {
		logMissing('config.yaml');
		process.exit(1);
	}

	var directories = ['./pages/', './partials/', './shared/', './templates/'];
	for (var i = directories.length - 1; i >= 0; i--) {
		var path = directories[i];
		if (Fs.existsSync(path) == false) {
			logMissing(path);
			process.exit(1);
		}
	}

	roots.setup(process.cwd());

	partials.load(function() {

		shared.load(function(localizedSharedItems) {

			pages.load(localizedSharedItems, function(localizedPageConfigs) {

				templates.load(function(compiledTemplates) {

					utils.logTime('Loaded configs');
					generator.run(localizedSharedItems, localizedPageConfigs, compiledTemplates);
				});
			});
		});
	});
}

function logMissing(name) {
	console.error('"' + name + '" not found: run "pudu install" first');
}
