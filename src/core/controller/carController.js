var _ = require('underscore');
var CarManager = require('../manager/carManager').CarManager;

var CarController = function (app, config, odm) {
    var om = odm.registry.getManager();
    var carManager = new CarManager(om);

    app.get('/list', function(req, res) {
        var parameters = {};

        if (req.query.manufacturer) {
            parameters.manufacturer = req.query.manufacturer;
        }

        if (req.query.model) {
            parameters.model = req.query.model;
        }

        carManager.list(parameters, function (err, cars) {
            if (err) {
                throw err;
            }

            carManager.getManufacturers(function (err, manufacturers) {
                if (err) {
                    throw err;
                }

                carManager.getModels(req.query.manufacturer, function (err, models) {
                    if (err) {
                        throw err;
                    }

                    res.render('car/list.html.twig', {
                        request: req, cars: cars, manufacturers: manufacturers, models: models
                    });
                });
            });
        });
    });

    app.get('/weight', function(req, res) {
        carManager.weight(function (err) {
            if (err) {
                throw err;
            }

            res.redirect('/list');
        });
    });

    app.get('/up/:id', function(req, res) {
        carManager.voteUp(req.params.id, function (err) {
            if (err) {
                throw err;
            }

            res.redirect('/list');
        });
    });

    app.get('/down/:id', function(req, res) {
        carManager.voteDown(req.params.id, function (err) {
            if (err) {
                throw err;
            }

            res.redirect('/list');
        });
    });

    app.get('/check/:id', function(req, res) {
        carManager.check(req.params.id, function (err) {
            if (err) {
                throw err;
            }

            res.redirect('/list');
        });
    });

    app.get('/uncheck/:id', function(req, res) {
        carManager.uncheck(req.params.id, function (err) {
            if (err) {
                throw err;
            }

            res.redirect('/list');
        });
    });

    app.get('/import', function(req, res) {
        carManager.import(function (err) {
            if (err) {
                throw err;
            }

            res.redirect('/list');
        });
    });
};

module.exports.CarController = CarController;