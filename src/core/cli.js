var ImportCommand = require('./command/importCommand').ImportCommand;/*
var multimeter = require('multimeter');

multimeter(process).drop(function (bar) {
    var done = function () {
        console.log('DONE');
    }

    var progress = function(n, d) {
        bar.ratio(n, d);
    };

    var command = new ImportCommand();

    command.execute(done, progress);
});*/

var done = function () {
    console.log('DONE');
}

var progress = function(n, d) {

};

var command = new ImportCommand();

command.execute(progress, done);

return;