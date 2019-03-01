let Promise = require('bluebird');

module.exports = {

  createCustomerSale: (app, data) => {
    return new Promise((resolve, reject) => {
      if (!data.tmsId) {
        reject('INVALID / MISSING TMS ID!');
        return;
      }

      let customerCode = (data.p54.split('&')[0]).split('=')[1];

      //insert into sales log:
      let salesObject = {
        "terminalId": parseInt(data.t, 16),
        "terminalVersion": data.v,
        "customerCode": customerCode,
        "customerId": null,
        "staffCard": data.cardno,
        "actionId": data.act,
        "txnDate": data.txndate,
        "clientId": data.tmsId,
        "status": 0,
        "items": []
      };
      data.itemSelectionData[0].items.forEach((item, index) => {
        app.models.Product.findOne({where: {id: item.id}})
          .then(product => {
            console.log(product);
            if (product && product.id) {
              salesObject.items.push({
                id: product.id,
                code: product.code,
                name: product.name,
                quantity: item.quantity,
                reference: item.reference,
                taxGroup: item.taxGroup,
                discountType: item.discountType,
                discount: item.discount,
                unitPrice: item.unitPrice
              });
            }
          }).catch(e => {
          console.log(e);

        }).finally(() => {
          console.log('finally' + JSON.stringify(salesObject));
          if (data.itemSelectionData[0].items.length === index+1) {
            // save the sale object
            app.models.Sale.create(salesObject, (err, result) => {
              if (err) {
                console.log(err);
                reject(err);
                return;
              }

              console.log(result);
              resolve(result);

            });
          }
        });
      });
    });
  }

};