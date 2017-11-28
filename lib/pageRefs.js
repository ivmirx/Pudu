var Path = require('path');

var config = require('./config'),
	utils = require('./utils');

exports.copySharedValues = copySharedValues;

function copySharedValues(pageConfig, sharedItems) {
	if (pageConfig == null) {
		return;
	}

	var references = pageConfig['_shared'];
	if (references == null) {
		return;
	}

	if (references instanceof Array) {
		// TODO: prevent values too
		console.error('"_shared" must be a map, not a sequence');
		process.exit(1);
	}

	fillSharedValues(pageConfig, references, sharedItems);
}

function fillSharedValues(target, references, sharedItems) {
	if (references instanceof Array) {
		for (var i = references.length - 1; i >= 0; i--) {
			if (references[i] == null) {
				continue;
			}
			else if (typeof references[i] === 'string') {
				if (target[i] != null) {
					console.error('Trying to assign "_shared" value to an occupied index "' + i + '"');
					process.exit(1);
				}

				target[i] = getSharedValue(references[i], sharedItems);
			}
			else {
				if (target[i] == null) {
					if (references[i] instanceof Array) {
						target[i] = [];
					}
					else {
						target[i] = {};
					}
				}

				fillSharedValues(target[i], references[i], sharedItems);
			}
		}
	}
	else {
		for (var key in references) {
			if (references[key] == null) {
				continue;
			}
			else if (typeof references[key] === 'string') {
				if (target[key] != null) {
					console.error('Trying to assign "_shared" value to an occupied key "' + key + '"');
					process.exit(1);
				}

				target[key] = getSharedValue(references[key], sharedItems);
			}
			else {
				if (target[key] == null) {
					if (references[key] instanceof Array) {
						target[key] = [];
					}
					else {
						target[key] = {};
					}
				}

				fillSharedValues(target[key], references[key], sharedItems);
			}
		}
	}
}

function getSharedValue(key, sharedItems) {
	var nestedPath = key.split('.');
	return utils.getNestedItem(sharedItems, nestedPath);
}

function exit(directory, filename) {
	console.error(Path.join(directory, filename));
	process.exit(1);
}
