var ImportCommand = require('../command/importCommand').ImportCommand;
var Gearman = require('node-gearman');

var gearman = new Gearman('localhost', '4730');

gearman.on('connect', function () {
    console.log('Connected to Gearman');

    gearman.registerWorker('import', function(payload, worker) {
        var progress = function(n, d) {
            if (n === d) {
                worker.end(true);
            } else {
                worker.write({n: n, d: d});
            }
        };

        var command = new ImportCommand();

        command.execute(progress);
    });

    console.log('Worker has been registered');
    gearman.close();
});

gearman.on('close', function () {
    console.log('Connection closed');
});

gearman.connect();