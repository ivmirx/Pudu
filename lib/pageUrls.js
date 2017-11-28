var config = require('./config'),
	utils = require('./utils'),
	roots = require('./roots');

exports.addLocalizedUrl = addLocalizedUrl;

function addLocalizedUrl(pageConfig, localizedSharedItems, locale, keys) {
	// page link ID reflects directory structure
	var rootPath = '';
	keys = keys.slice();

	if (keys.length == 0) {
		rootPath = '/';
		if (locale != config.mainLocale || config.useMainLocalePath) {
			rootPath += locale + '/';
		}
	}
	else {
		var currentSection = (pageConfig != null && pageConfig['_url_section']) || keys[keys.length-1];
		var prevLocalizedPath = '';

		var prevSectionKeys = keys.slice(0, keys.length-1);
		prevSectionKeys.unshift(config.linkPrefix);

		var parent = utils.getNestedItem(localizedSharedItems[locale], prevSectionKeys);
		prevLocalizedPath = parent[config.linkSuffix];
		rootPath += prevLocalizedPath + currentSection + '/';
	}

	// to prevent name collisions, all link expressions begin from an unique prefix, '_' by default
	keys.unshift(config.linkPrefix);

	// since links are stored in nested objects, they also need a unique key inside the object
	var parent = utils.getNestedItem(localizedSharedItems[locale], keys);
	parent[config.linkSuffix] = rootPath;
	// console.log(locale + ': ' + rootPath);
}
