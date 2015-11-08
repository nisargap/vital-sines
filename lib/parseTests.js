var Parse = require('parse/node').Parse;
var parseKeys = require('../creds/creds');
Parse.initialize(parseKeys.parse_id, parseKeys.parse_js);
var TestObject = Parse.Object.extend("Test");
var gql = require ('gql');

var global;

var query = new Parse.Query(TestObject);
exports.getTests = function(callback){
  var myQuery = query.find({
    success: function(data) {

      // data processing into functional style
      // [{criteria: func, description}]

      var processedTests = [];

      for(var i in data){

        var processedObj;
        var crit = data[i].get('criteria');
        var operator = data[i].get('operator');
        var descrip = data[i].get('description');


        processedObj = { criteria : crit,
        'operator': operator,
        description: descrip

        };

        processedTests.push(processedObj);

      }
      callback(processedTests);
    },
    error: function(error) {
      // error is an instance of Parse.Error.

      callback(error);
    }
  });
}
