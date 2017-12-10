var Fs = require('fs'),
	Path = require('path'),
	File = require('file'),
	Crypto = require('crypto'),
	Handlebars = require('handlebars');

var config = require('./config.js'),
	utils = require('./utils');

var newlineTag = '<br>',
	newlineRegex = /(\r\n|\n|\r)/gm;

var currentLocalizedUrls = null;

exports.run = run;

function run(localizedSharedItems, localizedPageConfigs, compiledTemplates) {
	var generated = [];
	var numberOfPages = 0;

	for (var id in localizedPageConfigs) {
		var pageConfigs = localizedPageConfigs[id];
		var keys = id.split('.');

		// 'lang' helper needs to know URLs to page translations
		currentLocalizedUrls = {};
		for (var locale in pageConfigs) {
			currentLocalizedUrls[locale] = utils.getNestedItem(localizedSharedItems[locale], keys);
		}

		for (var locale in pageConfigs) {
			var rootFilepath = currentLocalizedUrls[locale];

			if (config.useDirectoryNamesForIndexNames && keys.length > 2) {
				rootFilepath += keys[keys.length - 2] + '.html';
			}
			else {
				rootFilepath += 'index.html';
			}

			// could be null for directories without index
			if (pageConfigs[locale] == null) {
				continue;
			}

			// console.log(locale + ' ' + htmlRootUrl);
			var templateName = pageConfigs[locale]['_template'];
			var template = compiledTemplates[templateName];

			var combinedContext = {};
			for (var key in pageConfigs[locale]) {
				combinedContext[key] = pageConfigs[locale][key];
			}

			for (var key in localizedSharedItems[locale]) {
				combinedContext[key] = localizedSharedItems[locale][key];
			}

			// double compilation to process expressions from values and markdown
			try {
				var html = template(combinedContext);
				var finalTemplate = Handlebars.compile(html, config.handlebarsOptions);
				html = finalTemplate(combinedContext);
			}
			catch(error) {
				console.error('Error in page: ' + rootFilepath);
				console.error(error.message);
				process.exit(1);
			}

			savePage(rootFilepath, html);
			numberOfPages++;
		}
	}

	utils.logTime('Generated ' + numberOfPages + ' pages');
}

function savePage(rootFilepath, html) {
	var outputFilepath = Path.join(config.outputRootDirectory, rootFilepath);
	var outputDirectory = Path.dirname(outputFilepath);

	if (Fs.existsSync(outputDirectory) === false) {
		File.mkdirsSync(outputDirectory);
	}

	if (Fs.existsSync(outputFilepath)) {
		var oldFile = Fs.readFileSync(outputFilepath);
		var oldHash = Crypto.createHash('md5').update(oldFile).digest('hex');
		var newHash = Crypto.createHash('md5').update(html).digest('hex');

		if (oldHash == newHash) {
			return;
		}
	}

	Fs.writeFileSync(outputFilepath, html);
}

Handlebars.registerHelper('helperMissing', function(context, options) {
	console.error('Template defines "' + context.name + '", but not provided in context.');
	throw new Handlebars.Exception('See the error above ^');
});

Handlebars.registerHelper('br', function(text) {
	text = Handlebars.Utils.escapeExpression(text);
	text = text.replace(newlineRegex, newlineTag);
	return new Handlebars.SafeString(text);
});

Handlebars.registerHelper('lang', function(locale) {
	if (locale == 'all') {
		return currentLocalizedUrls;
	}
	else {
		return currentLocalizedUrls[locale];
	}
});
