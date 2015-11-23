// importing libraries
try{
    var express = require('express');
    var router = express.Router();
    var genome = require('../genome/process_genome');
    var fs = require('fs');
    var dna = require('dna2json');
    var gql = require ('gql');
    var Parse = require('parse/node').Parse;
    var parseKeys = require('../creds/creds');
}
catch(err){
    
    console.log("Error in library import");
    
}

Parse.initialize(parseKeys.parse_id, parseKeys.parse_js);

// test object needed for genome test storage
var TestObject = Parse.Object.extend("Test");

// require the tests library
var parseTests = require('../lib/parseTests');

var globalData;

// get all the tests
// TODO: possible race condition in storage of globalData variable
var tests = parseTests.getTests(function(data){
    globalData = data;
});

// process critieria that is passed from the tests object
function processCriteria(snps, crit, operator){

    var gqlArray = [];
      
    for(var j in crit){

        var currObj = crit[j];

          // eval is not recommended in this situation
          // but accomplishes the job
          // TODO: come up with a better solution
          eval("gqlArray.push(gql." + currObj.op + "(currObj.rsid, currObj.genotype));");
    }
    
    // create the query
    var query =  eval("gql." + operator + "(gqlArray);" );
    
    // process the query given the snps object, SNPS refers to genome data
    // that is to be queried
    return query(snps);

}

// old tests object, this is the format that the tests are stored
// in parse, this commented code is strictly for reference
/* 
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
*/

// routes
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

function error(res){
    res.send('error invalid file');
}

router.post('/add_test', function(req, res, next){
    try{
    var testObject = new TestObject();

    var criteriaArray = [];

    for(var i = 0; i < req.body.rsid.length; i++){

        var criteriaObj = {};
        criteriaObj['rsid'] = req.body.rsid[i].toLowerCase();
        criteriaObj['genotype'] = req.body.genotype[i].toUpperCase();
        criteriaObj['op'] = req.body.op[i].toLowerCase();

        criteriaArray.push(criteriaObj);

    }
    console.log(req.body.operator);
    var operator = req.body.operator;
    if (operator === 'undefined')
        operator = 'or';

    var value = {
      'title' : req.body.title,
      'rep' : req.body.rep,
      'criteria' : criteriaArray,
      'operator' : operator.toLowerCase(),
      'description' : req.body.description
      };
    testObject.save(value).then(function(object) {
      console.log("new object saved!");
      var tests = parseTests.getTests(function(data){
        globalData = data;
      });
      res.redirect('/createtest');
    });
    }catch(err){
        res.send('invalid');
    }

});

function buildResponseString(filename, res) {
    try{
    fs.readFile(filename, 'utf-8', function (err, data) {
      if (err) {
            throw err;
        }


      // parsing dna
      dna.parse(data, function(err, snps){

        if (err) {
            throw err;
        }

        var responseString = [];
        for(var i = 0; i < globalData.length; i++){

            var criteriaRes = processCriteria(snps, globalData[i].criteria, globalData[i].operator);
            responseString.push({title: globalData[i].title, rep: globalData[i].rep, description: globalData[i].description, result: criteriaRes});

        }
        // console.log('RESPONSE:' + JSON.stringify(responseString));
        res.send(JSON.stringify(responseString));

      });

    });
    }catch(err){
        res.send('invalid');
    }
}

router.post('/sample_test', function(req, res, next){

    var filepath = "sample_data/23andme-male.txt";
    buildResponseString(filepath, res);

});

router.post('/process_genome', function(req, res, next) {

    //console.log("THE DATA 2: " + JSON.stringify(globalData));

    //console.log(req.file);
    var filename = req.file.path;
    buildResponseString(filename, res);

});


module.exports = router;
