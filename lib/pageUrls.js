var config = require('./config'),
	utils = require('./utils'),
	roots = require('./roots');

exports.addLocalizedUrl = addLocalizedUrl;

// Pudú supports fully localized URL slugs, for example:
// English: example.com/about-us/
// Spanish: example.com/es/conócenos/

function addLocalizedUrl(pageConfig, localizedGlobalItems, locale, keys) {
	var rootPath = '';
	keys = keys.slice();

	if (keys.length == 0) {
		rootPath = '/';
		if (locale != config.mainLocale || config.useMainLocalePath) {
			rootPath += locale + '/';
		}
	}
	else {
		// Handlebars expressions for links reflect the directory structure in `pages/`
		var currentSection = keys[keys.length-1];
		var prevLocalizedPath = '';

		var prevSectionKeys = keys.slice(0, keys.length-1);
		prevSectionKeys.unshift(config.linkPrefix);

		var parent = utils.getNestedItem(localizedGlobalItems[locale], prevSectionKeys);
		prevLocalizedPath = parent[config.linkSuffix];
		rootPath += prevLocalizedPath + currentSection + '/';
	}

	// to prevent name collisions, all link expressions begin with a unique prefix, `_` by default
	keys.unshift(config.linkPrefix);

	// localized link parts are stored along with deeper nested objects, so their expressions also need a unique key, `_` by default
	var parent = utils.getNestedItem(localizedGlobalItems[locale], keys);
	parent[config.linkSuffix] = rootPath;
}
