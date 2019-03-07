var Path = require('path');

exports.setup = setup;

function setup(directory) {
	exports.GLOBALS = Path.join(directory, './globals/');
	exports.PAGES = Path.join(directory, './pages/');
	exports.PARTIALS = Path.join(directory, './partials/');
	exports.TEMPLATES = Path.join(directory, './templates/');
}
