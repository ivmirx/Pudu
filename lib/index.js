var Fs = require('fs'),
	Path = require('path');

var config = require('./config'),
	roots = require('./roots'),
	generator = require('./generator'),
	globals = require('./globals'),
	pages = require('./pages'),
	partials = require('./partials'),
	templates = require('./templates'),
	utils = require('./utils');

exports.generate = generate;

function generate() {
	if (Fs.existsSync('./config.yaml') == false) {
		logMissing('config.yaml');
		process.exit(1);
	}

	var directories = ['./globals/', './pages/', './partials/', './templates/'];
	for (var i = directories.length - 1; i >= 0; i--) {
		var path = directories[i];
		if (Fs.existsSync(path) == false) {
			logMissing(path);
			process.exit(1);
		}
	}

	roots.setup(process.cwd());

	partials.load(function() {

		globals.load(function(localizedGlobalItems) {

			pages.load(localizedGlobalItems, function(localizedPageConfigs) {

				templates.load(function(compiledTemplates) {

					utils.logTime('Loaded configs');
					generator.run(localizedGlobalItems, localizedPageConfigs, compiledTemplates);
				});
			});
		});
	});
}

function logMissing(name) {
	console.error('"' + name + '" not found: run "pudu install" first');
}
