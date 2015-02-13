var express = require('express');
var app = express();
var path = require('path');
var util = require('util');
var config = require('./app/config');
var odm = require('./src/odm');
var _ = require('underscore');
var fs = require('fs');

_.mixin(require('underscore.string').exports());

app.set('view engine', 'twig');
app.set('twig options', {strict_variables: false});

// TODO: find out how to specify a list  view directories.
app.set('views', __dirname + '/src/core/resources/views');

app.use(express.logger('dev'));
app.use(express.errorHandler());
app.use(express.static(path.join(__dirname, 'public')));

odm.registry.initialize(config.get('odm'), function (err) {
    _.values(config.get('app.controllers')).forEach(function (path) {
        fs.readdirSync(path).forEach(function(name) {
            if(_.endsWith(name, '.js')) {
                // TODO: do not load all the controllers initially.
                // It could be fine to load routes only and then load a specific controller on request.
                require(path + name)[_.capitalize(_.rtrim(name, '.js'))](app, config, odm);
            }
        });
    });

    app.listen(3000);
});