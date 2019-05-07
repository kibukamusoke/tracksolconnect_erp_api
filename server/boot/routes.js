let terminalFiles = require('./terminalFiles');
let terminalSale = require('./terminalSales');

module.exports = function (app) {
  let router = app.loopback.Router();

  router.get('/api/terminalUpdate/:clientId', function (req, res) {
    terminalFiles.getTerminalFiles(app, req.params.clientId)
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
    req.body.type = req.params.type;
    terminalSale.createCustomerSale(app, req.body)
      .then(response => {
        res.setHeader('Content-type', 'application/json');
        res.status(200);
        res.send(response);
      }).catch(e => {
      console.log(e);
    });
  });

  router.post('/api/createStockReturn', function (req, res) {
    console.log(req.body);
    console.log(req.params);
    req.body.type = req.params.type;
    terminalSale.createStockReturn(app, req.body)
      .then(response => {
        res.setHeader('Content-type', 'application/json');
        res.status(200);
        res.send(response);
      }).catch(e => {
      console.log(e);
    });
  });

  router.post('/api/createCustomerSalesOrder', function (req, res) {
    console.log(req.body);
    console.log(req.params);
    req.body.type = req.params.type;
    terminalSale.createCustomerSalesOrder(app, req.body)
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
