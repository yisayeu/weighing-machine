var util = require('util');
var _ = require('underscore');
var moment = require('moment');

_.mixin(require('underscore.string').exports());

/**
 * @class
 * @classdesc Provides methods for parsing a complete page containing car information.
 */
var Parser = function (manufacturers) {
    /**
     * Cached results of names parsing.
     * @type {Object}
     */
    var names = {};

    /**
     * @type {Object}
     */
    var selectors = {
        name: '.content .auto-model a',
        price: '.content .cost span',
        year: '#card-year strong',
        run: '#card-run strong',
        transmission: '#card-transmission_key strong',
        modification: '#card-modification_id strong',
        updatedAt: '.sale-counter p:first strong',
        description: 'h3:contains(Дополнительная информация) ~ p',
        kit: 'h3:contains(Комплектация:) ~ ul li'
    };

    var regExps = {
        price: /([\d\s]+)\s\$/,
        run: /([\d\s]+)\sкм/
    };

    function match(field, string) {
        if (undefined === regExps[field]) {
            throw util.format('RegExp for field `%s` is not defined', field);
        }

        var matched = string.match(regExps[field]);

        if (!matched) {
            throw util.format('Cannot parse %s: %s', field, string);
        }

        return matched[1];
    };

    return {
        /**
         * Parses a string containing car name.
         *
         * @param {Strign} name
         *
         * @return {Object}
         */
        parseName: function(name) {
            var result, i;

            if (undefined === names[name]) {
                manufacturers.every(function(manufacturer) {
                    if (0 === (i = name.indexOf(manufacturer))) {
                        result = {
                            manufacturer: manufacturer, model: name.substr(manufacturer.length + 1)
                        };

                        return false;
                    }

                    return true;
                });

                if (undefined === result) {
                    throw util.format('Cannot parse car name: %s', name);
                }

                names[name] = result;
            }

            return names[name];
        },

        /**
         * Parses a string containing car price.
         *
         * @param {String} price
         *
         * @return {Number}
         */
        parsePrice: function(price) {
            return parseInt(match('price', price).replace(' ', ''));
        },

        /**
         * Parses a string containing car year.
         *
         * @param {String} year
         *
         * @return {Number}
         */
        parseYear: function(year) {
            return parseInt(year);
        },

        /**
         * Parses a string containing car run.
         *
         * @param {String} run
         *
         * @return {Number}
         */
        parseRun: function(run) {
            return parseInt(match('run', run).replace(' ', ''));
        },

        parseUpdatedAt: function(updatedAt) {
            return moment(updatedAt, 'DD.MM.YYYY').toDate();
        },

        /**
         * Parses a complete page containing car information.
         *
         * @param {JQuery} $
         *
         * @return {Object}
         */
        parse: function($) {
            var car = {}, el, value, parse;

            for (var field in selectors) {
                el = $(selectors[field]);

                if (1 < el.length) {
                    value = [];

                    el.each(function(k, v) {
                        value.push($(v).text());
                    });
                } else {
                    value = el.text();
                }

                if (undefined !== (parse = this['parse' + _.capitalize(field)])) {
                    value = parse.call(this, value);
                }

                if (!(value instanceof Object) || (value instanceof Date) || (value instanceof Array)) {
                    car[field] = value;
                } else {
                    car = _.extend(car, value);
                }
            }

            return car;
        }
    };
};

module.exports.Parser = Parser;
