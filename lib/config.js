var Fs = require('fs'),
	Path = require('path'),
	Yaml = require('js-yaml');

var filepath = Path.join(process.cwd(), 'config.yaml');

if (Fs.existsSync(filepath) == false) {
	console.error('"' + 'config.yaml' + '" not found: run "pudu install" first');
	process.exit(1);
}

var config = Fs.readFileSync(filepath, 'utf8');
module.exports = Yaml.safeLoad(config);
