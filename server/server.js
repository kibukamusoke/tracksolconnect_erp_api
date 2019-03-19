'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
let bodyParser = require('body-parser');

var app = module.exports = loopback();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let logger = function (req, res, next) {
  console.log(JSON.stringify(req.body, null, 2));
  next(); // pass the request to the next handler in the stack ::
};
app.use(logger);

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
