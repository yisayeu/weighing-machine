var Gearman = require('node-gearman');

var gearman = new Gearman('localhost', '4730');

gearman.on('connect', function () {
    console.log('Connected to Gearman');

    var job = gearman.submitJob('import', null);

    job.on('data', function (data){
        console.log(console.log(data));
    });

    job.on('end', function (){
        console.log("Job completed!");
        gearman.close();
    });

    job.on('error', function (error){
        console.log(error.message);
        gearman.close();
    });
});

gearman.on('close', function () {
    console.log('Connection closed');
});

gearman.connect();