var File = require('file'),
	Path = require('path');

var config = require('./config'),
	urls = require('./pageUrls'),
	markdown = require('./pageMarkdown'),
	utils = require('./utils'),
	roots = require('./roots');

exports.load = load;

function load(localizedGlobalItems, onLoaded) {
	var localizedPageConfigs = {};

	File.walkSync(roots.PAGES, function(directory, subdirectories, files) {
		if (subdirectories.indexOf('_root') != -1) {
			// look for files inside `_root/` instead
			return;
		}

		var pageConfigs = {};

		var relativeDirectory = File.path.relativePath(roots.PAGES, directory);
		var keys = utils.keysFromDirectory(relativeDirectory);
		var name = resolvePageConfigName(relativeDirectory);

		// can be null for directories without any index page
		var mainLocalePageConfig = findPageConfig(name, config.mainLocale, directory, files);
		pageConfigs[config.mainLocale] = mainLocalePageConfig;
		urls.addLocalizedUrl(mainLocalePageConfig, localizedGlobalItems, config.mainLocale, keys);

		// TODO: threads here would make Pudú faster
		for (var i = config.additionalLocales.length - 1; i >= 0; i--) {
			var locale = config.additionalLocales[i];
			var additionalPageConfig = findPageConfig(name, locale, directory, files);

			if (additionalPageConfig != null) {
				utils.fillNulls(mainLocalePageConfig, additionalPageConfig);
				urls.addLocalizedUrl(additionalPageConfig, localizedGlobalItems, locale, keys);
				pageConfigs[locale] = additionalPageConfig;
			}
			else {
				urls.addLocalizedUrl(mainLocalePageConfig, localizedGlobalItems, locale, keys);
				pageConfigs[locale] = mainLocalePageConfig;
			}
		}

		keys.unshift(config.linkPrefix);
		keys.push(config.linkSuffix);
		localizedPageConfigs[keys.join('.')] = pageConfigs;
	});

	// copy values from the main locale if some translations are missing
	for (var i = config.additionalLocales.length - 1; i >= 0; i--) {
		var locale = config.additionalLocales[i];
		utils.fillNulls(localizedGlobalItems[config.mainLocale], localizedGlobalItems[locale]);
	}

	onLoaded(localizedPageConfigs);
}

function resolvePageConfigName(path) {
	var name = config.pageConfigsName;

	if (name == null) {
		var parts = path.split(Path.sep);
		name = parts.pop();

		// "transparent" folders for tidy file organization
		if (name == '_root') {
			name = parts.pop();
		}

		// the config for `index.html` in each locale's root
		if (name == null || name.length == 0) {
			name = 'index';
		}
	}

	return name;
}

function findPageConfig(name, locale, directory, files) {
	var filename = null;
	var isMainLocale = (locale == config.mainLocale);

	if (isMainLocale) {
		filename = name + config.yamlExtension;

		if (files.indexOf(filename) == -1) {
			filename = name + '~' + locale + config.yamlExtension;
		}
	}

	if (filename == null) {
		filename = name + '~' + locale + config.yamlExtension;
	}

	if (files.indexOf(filename) == -1) {
		return null;
	}
	else {
		return loadPageConfig(filename, directory, files);
	}
}

function loadPageConfig(filename, directory, files) {
	var configPath = Path.join(directory, filename);

	var text = utils.loadFile(configPath);
	if (text == null || text.length == 0) {
		console.error('Empty config: "' + filename + '" in: ' + directory);
		process.exit(1);
	}

	var pageConfig = utils.loadAndConvertFile(configPath, config.yamlExtension);
	var templateName = pageConfig['_template'];
	if (templateName == null) {
		console.error('Missing "_template" value in page config: "' + configPath);
		process.exit(1);
	}

	if (templateName.charAt(0) == '/') {
		console.error('"_template" path must be relative, please remove "/": "' + configPath);
		process.exit(1);
	}

	markdown.loadMarkdown(pageConfig, filename, directory, files);
	return pageConfig;
}
