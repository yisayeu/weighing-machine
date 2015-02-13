var Registry = require('./registry');

/**
 * @namespace Odm
 */
var Odm = {};

/**
 * @type {Odm.Registry}
 * @memberof Odm.
 */
Odm.registry = new Registry();

module.exports = Odm;