let terminalFiles = require('./terminalFiles');
let terminalSale = require('./terminalSales');

module.exports = function (app) {
  let router = app.loopback.Router();

  router.get('/api/terminalUpdate', function (req, res) {
    terminalFiles.getTerminalFiles(app)
      .then(terminalFiles => {
        res.setHeader('Content-type', 'text/plain');
        res.status(200);
        res.end(terminalFiles);
      }).catch(e => {
      console.log(e);
    });
  });

  router.post('/api/createCustomerSale', function (req, res) {
    console.log(req.body);
    console.log(req.params);
    terminalSale.createCustomerSale(app, req.body)
      .then(response => {
        res.setHeader('Content-type', 'application/json');
        res.status(200);
        res.send(response);
      }).catch(e => {
      console.log(e);
    });
  });
  app.use(router);
};
