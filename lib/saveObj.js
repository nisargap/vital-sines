var Parse = require('parse/node').Parse;
var parseKeys = require('../creds/creds');

Parse.initialize(parseKeys.parse_id, parseKeys.parse_js);
var TestObject = Parse.Object.extend("Test");
var testObject = new TestObject();
var value = {
  'criteria' : [
      {'rsid': 'rs334', 'genotype': 'TT', 'op': 'exact'},
      {'rsid': 'i3003137', 'genotype': 'AA', 'op': 'exact'}
    ],
  'operator' : 'or',
  'description' : "Immune to Sickle Cell"
  };

testObject.save(value).then(function(object) {
  console.log("hey it worked!");
});