var Crawler = require('crawler').Crawler;
var _ = require('underscore');
var util = require('util');
var Parser = require('./parser').Parser;

/**
 * @class
 * @param {Object} config
 * @param {Function} Model
 * @param {Function} setProgress
 * @param {Function} setDone
 */
var Autoru = function (config, Model, setProgress, setDone) {
    'use strict';

        /**
         * @type Crawler
         */
    var crawler,

        /**
         * Queued URLs.
         *
         * @type Array
         */
        queued = [],

        /**
         * Count of found cars.
         *
         * @type Number
         */
        foundCars = 0,

        /**
         * Count of imported cars.
         *
         * @type Number
         */
        importedCars = 0,

        /**
         * @type Parser
         */
        parser = new Parser(config.manufacturers);

    /**
     * Parses a car page and saves the car.
     *
     * @param {JQuery} $
     * @param {String} url
     */
    function processCar($, url) {
        var matches;
        // TODO: move the code below to a more proper place
        if (!(matches = url.match(/sale\/([\w\-]+)\.html/))) {
            throw new Error('Cannot match car ID');
        }

        var car =  new Model(_.extend(parser.parse($), {url: url, _id: matches[1]}));

        car.save(function(err) {
            if (err) {
                throw err;
            }
        });
    }

    /**
     * Finds links to car pages and adds them to the crawler queue.
     *
     * @param {JQuery} $
     */
    function findCars($) {
        var a = $('.cars-catalogue table tr').not('.header').find('a');

        a.each(function (index, el) {
            var name = $(el).text(), url = $(el).attr('href');

            if (
                !_.contains(queued, url)
                &&
                !_.contains(config.skip.names, name)
                &&
                !_.contains(config.skip.manufacturers, parser.parseName(name).manufacturer)
            ) {

                if (undefined !== setProgress) {
                    setProgress(importedCars, ++foundCars);
                }

                crawler.queue({
                    uri: url,
                    callback: function (err, res, $) {
                        if (err) {
                            throw err;
                        }

                        processCar($, url);

                        if (undefined !== setProgress) {
                            setProgress(++importedCars, foundCars);
                        }
                    }
                });

                queued.push(url);
            }
        });
    }

    /**
     * Finds page navigation and adds new pages to the crawler queue.
     *
     * @param {JQuery} $
     */
    function findPages($) {
        $('.pager:first a').each(function (i, el) {
            var name = $(el).text(),
                url = config.baseUrl + $(el).attr('href');

            if (!_.contains(queued, url) && !_.contains(config.skip.pages, name)) {
                crawler.queue(url);
                queued.push(url);
            }
        });
    }

    /**
     * Starts crawling process.
     */
    function crawl() {
        crawler = new Crawler({
            maxConnections: 10,
            onDrain: setDone,
            callback: function (err, res, $) {
                if (err) {
                    throw err;
                }

                //findPages($);
                findCars($);
            }
        });

        crawler.queue(config.baseUrl + config.startUri);
    }

    return {
        /**
         * Starts import process.
         */
        import: function () {
            Model.remove({}, function (err) {
                if (err) {
                    throw err;
                }

                crawl();
            });
        }
    };
};

module.exports.Autoru = Autoru;
