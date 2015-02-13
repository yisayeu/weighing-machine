var Manager = require('./manager');

/**
 * @class
 * @classdesc ODM Registry
 * @name Odm.Registry
 */
var Registry = function () {
    /**
     * @type {Boolean}
     * @memberof Odm.Registry~
     */
    var isInitialized = false;

    /**
     * @type {Object.<String, Odm.Manager>}
     * @memberof Odm.Registry~
     */
    var managers = [];

    /**
     * Name of the default manager.
     * @type {String}
     * @memberof Odm.Registry~
     * @constant
     * @default
     */
    const defaultManager = 'main';

    return {
        /**
         * Initializes registry.
         *
         * @memberof Odm.Registry#
         *
         * @param {Object} config
         * @param {Odm.Registry~readyCallback} callback
         */
        initialize: function (config, callback) {
            if (isInitialized) {
                callback(new Error('Registry has already been initialized'));
            }

            var lastErr, inQueue;

            inQueue = Object.keys(config.managers).length;

            var onManagerReady = function (err) {
                if (err) {
                    lastErr = err;
                }

                if (0 === --inQueue) {
                    callback(lastErr);
                }
            };

            for (var name in config.managers) {
                if (config.managers.hasOwnProperty(name)) {
                    managers[name] = new Manager(config.managers[name], onManagerReady);
                }
            }

            isInitialized = true;
        },

        /**
         * Gets registry.
         *
         * @memberof Odm.Registry#
         *
         * @param {String} name
         *
         * @returns {Odm.Manager}
         */
        getManager: function (name) {
            return managers[name || defaultManager];
        }
    };
};

/**
 * The callback is called when Registry instance has been initialized.
 * @callback Odm.Registry~readyCallback
 * @param {String} err
 */

module.exports = Registry;
