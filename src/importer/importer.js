var util = require('util');
var _ = require('underscore');

_.mixin(require('underscore.string').exports());

var Importer = function(config) {
    return {
        import: function(type, model, progress) {
            var Source = require(util.format('./source/%s', type))[_.capitalize(_.camelize(type))];
            var source = new Source(config[type], model, progress);

            source.import();
        }
    };
};

module.exports.Importer = Importer;