var Fs = require('fs'),
	Path = require('path'),
	Yaml = require('js-yaml'),
	Showdown = require('showdown'),
	Prism = require('prismjs');

// Should be a config eventually
require('prismjs/components/prism-bash');
require('prismjs/components/prism-shell-session');
require('prismjs/components/prism-csharp');
require('prismjs/components/prism-json');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-sql');
require('prismjs/components/prism-markdown');

var config = require('./config');

var mdConverter = new Showdown.Converter(config.markdownSettings);
mdConverter.setFlavor(config.markdownFlavor);

var start = process.hrtime();

exports.loadFile = loadFile;
exports.loadAndConvertFile = loadAndConvertFile;
exports.fillNulls = fillNulls;
exports.keysFromDirectory = keysFromDirectory;
exports.getNestedItem = getNestedItem;
exports.logTime = logTime;
exports.highlightCodeBlocks = highlightCodeBlocks;

function loadFile(filepath) {
	return Fs.readFileSync(filepath, 'utf8');
}

function loadAndConvertFile(filepath, extname) {
	var item = loadFile(filepath);

	if (extname == config.yamlExtension) {
		item = Yaml.load(item);
	}
	else if (extname == config.markdownExtension) {
		item = mdConverter.makeHtml(item);
		item = highlightCodeBlocks(item);
	}

	return item;
}

function highlightCodeBlocks(html) {
	// Replace code blocks with Prism-highlighted versions
	return html.replace(/<pre><code(?:\s+class="([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g, function(match, langClass, code) {
		// Extract language from class (e.g., "javascript" from "javascript language-javascript")
		var language = 'plaintext';
		if (langClass) {
			// Showdown may include multiple classes, extract the language
			var classes = langClass.split(' ');
			for (var i = 0; i < classes.length; i++) {
				var cls = classes[i];
				if (cls && cls !== 'language-' && !cls.startsWith('language-')) {
					language = cls;
					break;
				} else if (cls.startsWith('language-')) {
					language = cls.replace(/^language-/, '');
					break;
				}
			}
		}

		// Decode HTML entities
		var decodedCode = code
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");

		// Handle language aliases
		var languageAliases = {
			'sh': 'bash',
			'shell': 'bash',
			'zsh': 'bash',
			'cs': 'csharp',
			'dotnet': 'csharp',
		};

		if (languageAliases[language]) {
			language = languageAliases[language];
		}

		// Check if language is supported by Prism
		if (!Prism.languages[language]) {
			// Language not available, use plaintext
			language = 'plaintext';
		}

		// Highlight the code
		var highlightedCode = Prism.highlight(decodedCode, Prism.languages[language], language);

		// Return the highlighted code block with Prism classes
		return '<pre class="language-' + language + '"><code class="language-' + language + '">' + highlightedCode + '</code></pre>';
	});
}

// fills missing content in additional locales with content from the main locale
function fillNulls(object, copycat) {
	if (object == null || typeof object !== 'object') {
		return;
	}

	// TODO: maybe log the auto-filled values to spot configuration problems?
	for (var key in object) {
		if (copycat[key] == null) {
			copycat[key] = object[key];
		}
		else {
			fillNulls(object[key], copycat[key]);
		}
	}
}

// converts a file path into an array of keys for nested objects
function keysFromDirectory(relativePath) {
	var keys = relativePath.split(Path.sep);

	if (keys == null || keys[0].length == 0) {
		keys.shift();
	}

	if (keys[keys.length-1] == '_root') { // `_root/` directory is optional
		keys.pop();
	}

	return keys;
}

// gets a value from a tree of objects by following an array of keys
function getNestedItem(object, nestedPath) {
	var pointer = object;

	for (var i = 0; i < nestedPath.length; i++) {
		var item = nestedPath[i];

		if (pointer[item] == null) {
			pointer[item] = {};
		}

		pointer = pointer[item];
	}

	return pointer;
}

function logTime(note) {
	var seconds = process.hrtime(start)[0] + process.hrtime(start)[1] / 1000000000;
	console.log(note + ': ' + seconds.toFixed(3) + ' seconds');
	start = process.hrtime();
}
