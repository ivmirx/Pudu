var Path = require('path');

exports.setup = setup;

function setup(directory) {
	exports.PAGES = Path.join(directory, './pages/');
	exports.PARTIALS = Path.join(directory, './partials/');
	exports.SHARED = Path.join(directory, './shared/');
	exports.TEMPLATES = Path.join(directory, './templates/');
}
