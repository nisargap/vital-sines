var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Vital Sines' });
});

router.get('/demo', function(req, res, next) {
  res.render('demo', { title: 'Vital Sines Demo' });
});

module.exports = router;
