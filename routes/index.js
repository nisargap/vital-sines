var express = require('express');
var router = express.Router();
var genome = require('../genome/process_genome');
var fs = require('fs');
var dna = require('dna2json');
var gql = require ('gql');
var Parse = require('parse/node').Parse;
var parseKeys = require('../creds/creds');
Parse.initialize(parseKeys.parse_id, parseKeys.parse_js);
var TestObject = Parse.Object.extend("Test");

var parseTests = require('../lib/parseTests');
// THIS IS NOT HOW YOU ARE SUPPOSED TO USE NODE.JS
var globalData;
var tests = parseTests.getTests(function(data){
    globalData = data;
});

function processCriteria(snps, crit, operator){


      var gqlArray = [];

      for(var j in crit){

        var currObj = crit[j];

        // VERY INSECURE ... DON'T TRY THIS IN PRODUCTION ENVIRONMENT
        eval("gqlArray.push(gql." + currObj.op + "(currObj.rsid, currObj.genotype));");
      }

      var query =  eval("gql." + operator + "(gqlArray);" );

      return query(snps);

}
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
    },
    {
    criteria : function(snps){

            var query = gql.or([
              gql.exact('rs7025486', 'A'),
              gql.exact('rs1800796', 'C')
            ]);
            return query(snps);
        },
    'description' : "Risk of Abdominal aortic aneurysm:"
    }
]

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Vital Sines' });
});

router.get('/demo', function(req, res, next) {
    res.render('demo', { title: 'Vital Sines Demo' });
});
router.get('/createtest', function(req, res, next){

    res.render('createTest', { title: 'Vital Sines Create Test'});
});

router.post('/add_test', function(req, res, next){

    var testObject = new TestObject();

    var criteriaArray = [];

    for(var i = 0; i < req.body.rsid.length; i++){

        var criteriaObj = {};
        criteriaObj['rsid'] = req.body.rsid[i];
        criteriaObj['genotype'] = req.body.genotype[i];
        criteriaObj['op'] = req.body.op[i];

        criteriaArray.push(criteriaObj);

    }
    var value = {
      'criteria' : criteriaArray,
      'operator' : req.body.operator,
      'description' : req.body.description
      };
    testObject.save(value).then(function(object) {
      console.log("new object saved!");
      var tests = parseTests.getTests(function(data){
        globalData = data;
      });
      res.redirect('/createtest');
    });

});
router.post('/sample_test', function(req, res, next){

    var filepath = "sample_data/23andme-male.txt";
    fs.readFile(filepath, 'utf-8', function (err, data) {
      if (err) throw err;

      // parsing dna
      dna.parse(data, function(err, snps){

        if (err) throw err;

        var responseString = [];
        for(var i = 0; i < globalData.length; i++){

            var criteriaRes = processCriteria(snps, globalData[i].criteria, globalData[i].operator);
            responseString.push({description: globalData[i].description, result: criteriaRes});

        }
        console.log('RESPONSE:' + JSON.stringify(responseString));
        res.send(JSON.stringify(responseString));

      });

    });

});

router.post('/process_genome', function(req, res, next) {

    //console.log("THE DATA 2: " + JSON.stringify(globalData));

    //console.log(req.file);
    var filename = req.file.originalname;
    fs.readFile(req.file.path, 'utf-8', function (err, data) {
      if (err) throw err;

      // parsing dna
      dna.parse(data, function(err, snps){

        if (err) throw err;

        var responseString = [];
        for(var i = 0; i < globalData.length; i++){

            var criteriaRes = processCriteria(snps, globalData[i].criteria, globalData[i].operator);
            responseString.push({description: globalData[i].description, result: criteriaRes});

        }

        res.send(responseString);

      });

    });

});


module.exports = router;
