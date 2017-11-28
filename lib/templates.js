var File = require('file'),
	Recursive = require('recursive-readdir'),
	Handlebars = require('handlebars');

var config = require('./config'),
	utils = require('./utils'),
	roots = require('./roots');

exports.load = load;

function load(onLoaded) {
	var compiledTemplates = {};
	var options = { 'strict':true };

	Recursive(roots.TEMPLATES, config.ignoredFiles, function(err, files) {
		for (var i = files.length - 1; i >= 0; i--) {
			var filepath = files[i];
			var template = utils.loadFile(filepath);
			var key = File.path.relativePath(roots.TEMPLATES, filepath);

			compiledTemplates[key] = Handlebars.compile(template, config.handlebarsOptions);
		}

		onLoaded(compiledTemplates);
	});
}
