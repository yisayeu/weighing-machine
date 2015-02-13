var _ = require('underscore');
var MarkManager = require('./markManager').MarkManager;
var Gearman = require('node-gearman');

/**
 * Car manager.
 *
 * @class
 * @name Core.Manager.CarManager
 * @param {Odm.Manager}
 */
var CarManager = function (om) {
    'use strict';

    /**
     * Car model.
     *
     * @type {???}
     */
    var Car = om.getModel('Core:Car');

    /**
     * Mark model.
     *
     * @type {???}
     */
    var Mark = om.getModel('Core:Mark');

    /**
     * Mark manager.
     *
     * @type {Core.Manager.MarkManager}
     */
    var markManager = new MarkManager(om);

    /**
     * @type Number
     */
    var listLimit = 300;

    var weights = {
        price: function (price, min, max) {
            return 1 - (price - min) / (max - min);
        },

        year: function (year, min, max) {
            return (year - min) / (max - min);
        },

        run: function (run, min, max) {
            return 1 - (run - min) / (max - min);
        }
    };

    function findBoundaryValues(border, fields, callback) {
        var values = [],
            sortDirection = ('min' === border) ? 1 : -1;

        function find() {
            if (fields.length) {
                var sort = {},
                    field = fields.pop();

                sort[field] = sortDirection;

                Car.findOne().sort(sort).exec(function (err, car) {
                    if (err) {
                        callback(err);
                    } else {
                        values[field] = car[field];
                        find();
                    }
                });
            } else {
                callback(undefined, values);
            }
        }

        find();
    }

    function weight(cars, mins, maxs, callback) {
        cars.forEach(function (car) {
            var sum = 0,
                components = {};

            _.each(weights, function (func, field) {
                components[field] = func(car[field], mins[field], maxs[field]);
                sum += components[field];
            });

            if (undefined !== car.mark) {
                components.votes = car.mark.votes;
            } else {
                components.votes = 0;
            }

            sum += components.votes;

            car.weight = sum;
            car.weightComponents = components;

            car.save();
        });

        callback();
    }

    /**
     * Applies a specific mark to the car.
     *
     * @param {String} id Car identifier.
     * @param {String} type Mark type - vote up, vote down, check or uncheck.
     * @param {Function} callback
     */
    function applyMark(id, type, callback) {
        Car.findOne({_id: id}).exec(function (err, car) {
            if (err) {
                callback(err);
            } else {
                markManager[type](car, function (err) {
                    callback(err);
                });
            }
        });
    }

    /**
     * Finds corresponding marks instances and injects them into cars instances as `mark` property.
     *
     * @param {???[]} cars
     * @param {Function} calback
     */
    function injectMarks(cars, callback) {
        Mark.find({car: { $in: _.pluck(cars, 'id')}}).exec(function (err, marks) {
            if (err) {
                callback(err);
            } else {
                marks = _.object(_.pluck(marks, 'car'), marks);

                cars.forEach(function (car) {
                    if (undefined !== marks[car.id]) {
                        car.mark = marks[car.id];
                    }
                });

                callback(undefined, cars);
            }
        });
    }

    return {
        /**
         * Gets cars for listing.
         *
         * @param {Object} parameters
         * @param {Function} callback
         */
        list: function (parameters, callback) {
            Car.find(parameters).sort({weight: -1}).limit(listLimit).exec(function (err, cars) {
                if (err) {
                    callback(err);
                } else {
                    injectMarks(cars, callback);
                }
            });
        },

        /**
         * Weights cars.
         *
         * @param {Function} callback
         */
        weight: function (callback) {
            findBoundaryValues('min', Object.keys(weights), function (err, mins) {
                if (err) {
                    callback(err);
                } else {
                    findBoundaryValues('max', Object.keys(weights), function (err, maxs) {
                        if (err) {
                            callback(err);
                        } else {
                            Car.find({}).exec(function (err, cars) {
                                if (err) {
                                    callback(err);
                                } else {
                                    injectMarks(cars, function (err, cars) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            weight(cars, mins, maxs, callback);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },

        /**
         * Votes up the car.
         *
         * @param {String} id Car identifier.
         * @param {Function} callback
         */
        voteUp: function (id, callback) {
            applyMark(id, 'voteUp', callback);
        },

        /**
         * Votes down the car.
         *
         * @param {String} id Car identifier.
         * @param {Function} callback
         */
        voteDown: function (id, callback) {
            applyMark(id, 'voteDown', callback);
        },

        /**
         * Checks the car.
         *
         * @param {String} id Car identifier.
         * @param {Function} callback
         */
        check: function (id, callback) {
            applyMark(id, 'check', callback);
        },

        /**
         * Unchecks the car.
         *
         * @param {String} id Car identifier.
         * @param {Function} callback
         */
        uncheck: function (id, callback) {
            applyMark(id, 'uncheck', callback);
        },

        getManufacturers: function (callback) {
            Car.find().distinct('manufacturer', function (err, manufacturers) {
                if (err) {
                    callback(err);
                } else {
                    callback(undefined, _.sortBy(manufacturers));
                }
            });
        },

        getModels: function (manufacturer, callback) {
            Car.find(manufacturer ? {manufacturer: manufacturer} : {}).distinct('model', function (err, models) {
                if (err) {
                    callback(err);
                } else {
                    callback(undefined, _.sortBy(models));
                }
            });
        },

        import: function (callback) {
            var gearman = new Gearman('localhost', '4730');

            gearman.on('connect', function () {

                gearman.registerWorker('import');

                callback();
            });

            gearman.connect();
        }
    };
};

module.exports.CarManager = CarManager;