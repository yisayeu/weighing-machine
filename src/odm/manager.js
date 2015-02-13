var mongoose = require('mongoose');
var util = require('util');
var Connection = mongoose.Connection;

/**
 * @class
 * @classdesc ODM Manager
 * @name Odm.Manager
 *
 * @param {Object} config
 * @param {Odm.Manager~readyCallback} callback
 */
var Manager = function (config, callback) {

    /**
     * @type {Connection}
     */
    var connection = mongoose.createConnection(config.connection.uri, config.connection.options);

    connection.on('error', function (err) {
        callback(err);
    });

    connection.once('open', function () {
        callback();
    });

    return {
        /**
         * Gets a model.
         *
         * @memberof Odm.Manager#
         *
         * @param {String} name
         *
         * @returns {Model}
         */
        getModel: function (name) {
            name = name.split(':');

            if (undefined === config.models[name[0]]) {
                throw new Error(util.format('Models namespace `%s` is not defined', name[0]));
            }

            // Load schema.
            var Schema = require(config.models[name[0]] + name[1].toLowerCase());

            // Create model.
            return connection.model(name[1], Schema);
        },

        close: function () {
            connection.close()
        }
    };
};

/**
 * The callback is called when Manager instance has been initialized.
 * @callback Odm.Manager~readyCallback
 * @param {String} err
 */

module.exports = Manager;
