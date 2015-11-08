var express = require('express');
var router = express.Router();
var genome = require('../genome/process_genome');
var fs = require('fs');
var dna = require('dna2json');
var gql = require ('gql');

var tests = [

    {
    criteria : function(snps){

            var query = gql.or([
              gql.exact('rs334', 'TT'),
              gql.exact('i3003137', 'AA')
            ]);
            return query(snps);
        },
    'description' : "Immune to Sickle Cell:"
    }
]

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Vital Sines' });
});

router.get('/demo', function(req, res, next) {
    res.render('demo', { title: 'Vital Sines Demo' });
});

router.post('/process_genome', function(req, res, next) {

    console.log(req.file);
    var filename = req.file.originalname;
    fs.readFile(req.file.path, 'utf-8', function (err, data) {
      if (err) throw err;

      // parsing dna
      dna.parse(data, function(err, snps){

        if (err) throw err;
        // var query = gql.or([
        //   gql.exact('rs334', 'TT'),
        //   gql.exact('i3003137', 'AA')
        // ]);
        // var isMatch = tests.sickelCell(snps);

        var responseString = "";
        for(var i = 0; i < tests.length; i++){

            var isMatch = tests[i].criteria(snps);

            var resString = tests[i].description + ' ' + isMatch;

            responseString += resString + "<br>";

        }

        res.send(responseString);
        // console.log("THE ACTUAL VALUE IS: " + snps.rs12562034.genotype);


        //console.log(snps);
        /*
        console.log(isMatch); // true or false
        var resString = "You are " + (isMatch ? "" : "not") + " immune to sickle cell";
        res.send(resString);*/
      });

    });

    //res.send("uploaded " + req.file.originalname);
}); 


module.exports = router;
