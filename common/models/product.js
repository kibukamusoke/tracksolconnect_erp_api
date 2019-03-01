'use strict';


module.exports = function (Product) {

  Product.productsTerminalFile = function (next) {
    Product.find({})
      .then(products => {
        let itemsStr = 'T=6\nI=1\nR=1\nL=CAT.TXT\nM=1\nD=\n';
        let stockStr = 'T=6\nI=1\nR=1\nL=STK.TXT\nM=1\nD=\n';

        if (products.length === 0) {
          next(null, 'B=' + itemsStr.length + '\n' + itemsStr + 'B=' + stockStr.length + '\n' + stockStr);
          return;
        }

        products.forEach((product, index) => { //itemsStr can have a formula here::
          itemsStr += (index + 1) + '|' + product.id + '|' + product.id + '||' + encodeURI(product.name) + '|' + product.minPrice + '|' + (product.maxPrice ? product.maxPrice : product.unitPrice) + '|1|' + encodeURI(product.code) + '|' + (product.maxPrice ? product.maxPrice : product.unitPrice) + '|11|1|2|\n';
          stockStr += (index + 1) + '|' + product.id + '|' + product.id + '||' + encodeURI(product.name) + '|' + product.minPrice + '|' + (product.maxPrice ? product.maxPrice : product.unitPrice) + '|1|' + encodeURI(product.code) + '|' + (product.maxPrice ? product.maxPrice : product.unitPrice) + '|11|1|2|\n';
          if (products.length === index + 1) {
            next(null, 'B=' + itemsStr.length + '\n' + itemsStr + 'B=' + stockStr.length + '\n' + stockStr);
          }
        });

      }).catch(next);
  };

  Product.remoteMethod('productsTerminalFile', {
    returns: {
      arg: 'fileData',
      type: 'string',
      root: true
    },
    http: {
      path: '/products-terminal-file',
      verb: 'get'
    }
  });

  // send data as plain text ::
  Product.afterRemote('productsTerminalFile', function (context, remoteMethodOutput, next) {
    context.res.setHeader('Content-type', 'text/plain');
    context.res.end(context.result);
  });


};
