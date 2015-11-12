var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var results = require('./routes/results.js');
var multer = require('multer');
var keys = require('../creds/creds');


var app = express();


/**********************
 * For authentication
 */
var Parse = require('parse/node').Parse;
var parseKeys = require('../creds/creds');
Parse.initialize(parseKeys.parse_id, parseKeys.parse_js);
var querystring = require('querystring');
var _ = require('underscore');
var Buffer = require('buffer').Buffer;

var githubClientId = 'your-github-client-id-here';
var githubClientSecret = 'your-github-client-secret-here';

// Create resticted user rules for parse object.
var restrictedACL = new Parse.ACL();
restrictedACL.setPublicReadAccess(false);
restrictedACL.setPublicWriteAccess(false);

// Disable public access for Get/Find/Create/Update/Delete. Master key only.
var TokenRequest = Parse.Object.extend("TokenRequest");
var TokenStorage = Parse.Object.extend("TokenStorage");

var githubRedirectEndpoint = 'https://github.com/login/oauth/authorize?';
var githubValidateEndpoint = 'https://github.com/login/oauth/access_token';
var githubUserEndpoint = 'https://api.github.com/user';



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser({keepExtensions:true,uploadDir:path.join(__dirname,'/files')}));

// app.use(multipart);

app.use(multer({dest:'./uploads/'}).single('genome-file'));
app.use(multer({dest:'./uploads/'}).single('eye-image'));
// TODO: uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Authentication code was adapted from: https://github.com/ParsePlatform/CloudCodeOAuthGitHubTutorial/blob/master/cloud/main.js
app.get('/authorize', function(req, res) {
  
  var tokenRequest = new Parse.Object("TokenRequest");
  // Secure against public
  tokenRequest.setACL(restrictedACL);
  
  tokenRequest.save(null, {useMasterKey: true}).then(function(obj) {
    // Redirect browser for authorization.
    
    res.redirect(
      githubRedirectEndpoint + querystring.stringify({
        client_id: githubClientId,
        state: obj.id
  })
    );
  }, function(error) {
    res.render('error', {errorMessage: 'Failed to save auth request.'});
  });
});

app.get('/oauthCallback', function(req, res) {
  var data = req.query;
  var token;
  
  if(!(data && data.code && data.state)) {
    res.render('error', { errorMessage: 'Invalid auth response received.'});
    return;
  }
  var query = new Parse.Query(TokenRequest);
  
  Parse.Cloud.useMasterKey();
  Parse.Promise.as().then(function() {
    return query.get(data.state);
  }).then(function() {
    return obj.destroy();
  }).then(function() {
    return getGitHubAccessToken(data.code);
  }).then(funtion(access) {
    var githubData = access.data;
    if(githubData && githubData.access_token && githubData.token_type) {
      token = githubData.access_token;
    } else {
      return Parse.Promise.error("Invalid acess request.");
    }
  }); //TODO: Finish coding. I'm currently on line 153 of https://github.com/ParsePlatform/CloudCodeOAuthGitHubTutorial/blob/master/cloud/main.js
});

module.exports = app;
