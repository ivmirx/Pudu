var Fs = require('fs'),
	Path = require('path'),
	File = require('file'),
	Crypto = require('crypto'),
	Handlebars = require('handlebars');

var config = require('./config.js'),
	utils = require('./utils');

var currentPageLocale = null;

var newlineTag = '<br>',
	newlineRegex = /(\r\n|\n|\r)/gm;

exports.run = run;

function run(localizedGlobalItems, localizedPageConfigs, compiledTemplates) {
	var generated = [];
	var numberOfPages = 0;

	for (var id in localizedPageConfigs) {
		var pageConfigs = localizedPageConfigs[id];
		var keys = id.split('.');
		var pageLocalizedUrls = {};

		for (var locale in pageConfigs) {
			pageLocalizedUrls[locale] = utils.getNestedItem(localizedGlobalItems[locale], keys);
		}

		for (var locale in pageConfigs) {
			currentPageLocale = locale;
			var rootFilepath = pageLocalizedUrls[locale];

			if (config.useDirectoryNamesForIndexNames && keys.length > 2) {
				rootFilepath += keys[keys.length - 2] + '.html';
			}
			else {
				rootFilepath += 'index.html';
			}

			// can be null for directories without any index page
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

			for (var key in localizedGlobalItems[locale]) {
				combinedContext[key] = localizedGlobalItems[locale][key];
			}

			// second compilation to process "linked" Handlebars expressions inside YAML configs and Markdown files
			try {
				var html = template(combinedContext);
				var finalTemplate = Handlebars.compile(html, config.handlebarsOptions);
				html = finalTemplate(combinedContext);
				html = utils.highlightCodeBlocks(html);
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

// get the page locale during compilation
// usage: `{{{_locale}}}`
Handlebars.registerHelper('_locale', function(options) {
	return currentPageLocale;
});

// replace newline characters with `<br>` in multiline YAML strings
// usage: `{{{_br some.value.path.in.yaml}}}`
Handlebars.registerHelper('_br', function(text) {
	text = Handlebars.Utils.escapeExpression(text);
	text = text.replace(newlineRegex, newlineTag);
	return new Handlebars.SafeString(text);
});
