var config = require('../../../app/config');
var odm = require('../../odm');
var Importer = require('../../importer').Importer;

var ImportCommand = function () {
    return {
        execute: function (progress, done) {
            odm.registry.initialize(config.get('odm'), function (err) {
                if (err) {
                    throw err;
                }

                var manager = odm.registry.getManager();
                var importer = new Importer(config.get('import'));

                importer.import('autoru', manager.getModel('Core:Car'), progress, function () {
                    done();
                });
            });
        }
    };
};

module.exports.ImportCommand = ImportCommand;