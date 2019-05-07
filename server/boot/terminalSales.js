let Promise = require('bluebird');

module.exports = {

  paymentModeDetail: (app, p59Data) => {
    return new Promise((resolve, reject) => {
      // ~4294967290~20-03000008~0~0~0~0~0~0~0~6700~0~6700~0~6700~998~~~994~~~
      let p59Array = p59Data.split('~');
      let mapArray = ['osn', 'SNUM', 'invoiceNo', '#T_A', '#T_E', '#T_I'
        , 'L1', 'R2', 'X3', 'XX3', '#T', 'ROUND', 'PAID', 'CHG',
        'CASH', 'yA2', 'yA1', 'yA3', 'yB2', 'yB1', 'yB3'];

      let result = [p59Array].map((row, index) => {
        return row.reduce((result, field, index) => {
          result[mapArray[index]] = field;
          return result;
        }, {});
      });

      result = result[0];

      let paymentModes = [
        {
          id: 0,
          type: 'Cash',
          code: 'cash',
          amount: Number(result.CASH) * 0.01,
          reference: ''
        },
        {
          id: Number(result.yA2 ? result.yA2 : 0),
          type: 'userDefined',
          amount: Number(result.yA1 ? result.yA1 : 0) * 0.01,
          reference: result.yA3
        },
        {
          id: Number(result.yB2 ? result.yB2 : 0),
          type: 'userDefined',
          amount: Number(result.yB1 ? result.yB1 : 0) * 0.01,
          reference: result.yB3
        }
      ];

      let paymentDetail = {
        total: Number(result['#T']),
        rounding: Number(result.ROUND) * 0.01,
        //paid: Number(result.PAID) * 0.01,
        //change: Number(result.CHG) * 0.01,
        //cash: Number(result.CASH) * 0.01
      };

      if(!(paymentModes[1].id && paymentModes[1].id > 0 && paymentModes[2].id && paymentModes[2].id > 0))
      {
        paymentDetail.paymentModes = [paymentModes[0]];
        resolve(paymentDetail);
        return;
      }
      app.models.PaymentMode.find({where: {or: [{id: paymentModes[1].id}, {id: paymentModes[2].id}]}})
        .then(modes => {
          if (modes.length === 0) {
            resolve(paymentDetail);
            return;
          }
          paymentDetail.paymentModes = paymentModes;
          for (x = 0; x < modes.length; x++) {
            let mode = modes.find(xt => Number(xt.id) === paymentDetail.paymentModes[x+1].id);
            paymentDetail.paymentModes[x+1].code = mode ? mode.code : null;
          }
          resolve(paymentDetail);
        }).catch(e => {
        console.log(e);
        reject(e);
      });

    });
  },
  createCustomerSale2: (app, data) => { // cash sales and sales order
    return new Promise((resolve, reject) => {
      if (!data.tmsId) {
        reject('INVALID / MISSING TMS ID!');
        return;
      }

      let customerCode = (data.p54.split('&')[0]).split('=')[1];
      let paymentTerm = null;

      app.models.Staff.findOne({where: {clientId: data.tmsId, cardNo: data.cardno}})
        .then(staff => {
          if (!(staff && staff.id)) {
            reject("Unknown staff Card");
            return;
          }
          //insert into sales log:
          let salesObject = {
            "terminalId": parseInt(data.t, 16),
            "terminalVersion": data.v,
            "customerCode": customerCode,
            "customerId": null,
            "staffCard": data.cardno,
            staffCode: staff.code,
            "actionId": data.act,
            "txnDate": data.txndate,
            "clientId": data.tmsId,
            "status": 0,
            "items": [],
            "paymentDetails": {}
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
                    uom: product.uom,
                    quantity: Number(item.quantity),
                    reference: item.reference,
                    taxGroup: item.taxGroup,
                    discountType: item.discountType,
                    discount: Number(item.discount),
                    unitPrice: Number(item.unitPrice)
                  });
                }
              }).catch(e => {
              console.log(e);

            }).finally(() => {
              console.log('finally' + JSON.stringify(salesObject));
              if (data.itemSelectionData[0].items.length === index + 1) {
                // add payment modes if cash sale::
                module.exports.paymentModeDetail(app, data.p59, data.type, data.p54)
                  .then(paymentDetails => {
                    salesObject.paymentDetails = paymentDetails;
                    // save the sale object
                    if (data.type === 'cashSale') {
                      app.models.Sale.create(salesObject, (err, result) => {
                        if (err) {
                          console.log(err);
                          reject(err);
                          return;
                        }

                        console.log(result);
                        resolve(result);

                      });
                    } else if (data.type === 'salesOrder') {
                      app.models.SalesOrder.create(salesObject, (err, result) => {
                        if (err) {
                          console.log(err);
                          reject(err);
                          return;
                        }

                        console.log(result);
                        resolve(result);

                      });
                    }

                  }).catch(e => {
                  console.log(e);
                  reject(e);
                });

              }
            });
          });
        }).catch(e => {
        console.log(e);
        reject(e);
      });


    });
  },


  createStockReturn: (app, data) => {
    return new Promise((resolve, reject) => {
      if (!data.tmsId) {
        reject('INVALID / MISSING TMS ID!');
        return;
      }

      let customerCode = (data.p54.split('&')[0]).split('=')[1];

      app.models.Staff.findOne({where: {clientId: data.tmsId, cardNo: data.cardno}})
        .then(staff => {
          if (!(staff && staff.id)) {
            reject("Unknown staff Card");
            return;
          }
          //insert into stockReturn log:
          let stockReturnObject = {
            "terminalId": parseInt(data.t, 16),
            "terminalVersion": data.v,
            "customerCode": customerCode,
            "customerId": null,
            "staffCard": data.cardno,
            staffCode: staff.code,
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
                  stockReturnObject.items.push({
                    id: product.id,
                    code: product.code,
                    name: product.name,
                    uom: product.uom,
                    quantity: Number(item.quantity),
                    reference: item.reference,
                    unitPrice: Number(item.unitPrice)
                  });
                }
              }).catch(e => {
              console.log(e);

            }).finally(() => {
              console.log('finally' + JSON.stringify(stockReturnObject));
              if (data.itemSelectionData[0].items.length === index + 1) {
                app.models.StockReturn.create(stockReturnObject, (err, result) => {
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
        }).catch(e => {
        console.log(e);
        reject(e);
      });

    });
  },

  createCustomerSale: (app, data) => {
    return new Promise((resolve, reject) => {
      if (!data.tmsId) {
        reject('INVALID / MISSING TMS ID!');
        return;
      }

      let customerCode = (data.p54.split('&')[0]).split('=')[1];

      let p59Array = data.p59.split('~');
      let mapArray = ['osn', 'SNUM', 'invoiceNo', '#T_A', '#T_E', '#T_I'
        , 'L1', 'R2', 'X3', 'XX3', '#T', 'ROUND', 'PAID', 'CHG',
        'CASH', 'yA2', 'yA1', 'yA3', 'yB2', 'yB1', 'yB3'];

      let result = [p59Array].map((row, index) => {
        return row.reduce((result, field, index) => {
          result[mapArray[index]] = field;
          return result;
        }, {});
      });

      let p59Arr = result[0];


      app.models.Staff.findOne({where: {clientId: data.tmsId, cardNo: data.cardno}})
        .then(staff => {
          if (!(staff && staff.id)) {
            reject("Unknown staff Card");
            return;
          }
          //insert into sales log:
          let salesObject = {
            "terminalId": parseInt(data.t, 16),
            "terminalVersion": data.v,
            "customerCode": customerCode,
            "customerId": null,
            "staffCard": data.cardno,
            staffCode: staff.code,
            "actionId": data.act,
            "txnDate": data.txndate,
            "invoiceNo": p59Arr.invoiceNo,
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
                    uom: product.uom,
                    quantity: Number(item.quantity),
                    reference: item.reference,
                    taxGroup: item.taxGroup,
                    discountType: item.discountType,
                    discount: Number(item.discount),
                    unitPrice: Number(item.unitPrice)
                  });
                }
              }).catch(e => {
              console.log(e);

            }).finally(() => {
              console.log('finally' + JSON.stringify(salesObject));
              if (data.itemSelectionData[0].items.length === index + 1) {
                module.exports.paymentModeDetail(app, data.p59)
                  .then(paymentDetails => {
                    // save the sale object
                    salesObject.paymentDetails = paymentDetails;
                    app.models.Sale.create(salesObject, (err, result) => {
                      if (err) {
                        console.log(err);
                        reject(err);
                        return;
                      }

                      console.log(result);
                      resolve(result);

                    });
                  }).catch(e => {
                    console.log(e);
                    reject(e);
                });

              }
            });
          });
        }).catch(e => {
        console.log(e);
        reject(e);
      });


    });
  },

  createCustomerSalesOrder: (app, data) => { // cash sales and sales order
    return new Promise((resolve, reject) => {
      if (!data.tmsId) {
        reject('INVALID / MISSING TMS ID!');
        return;
      }

      let customerCode = (data.p54.split('&')[0]).split('=')[1];
      let paymentTermId = (data.p54.split('&')[1]).split('=')[1];

      let p59Array = data.p59.split('~');
      let mapArray = ['osn', 'SNUM', 'invoiceNo', '#T_A', '#T_E', '#T_I'
        , 'L1', 'R2', 'X3', 'XX3', '#T', 'ROUND', 'PAID', 'CHG',
        'CASH', 'yA2', 'yA1', 'yA3', 'yB2', 'yB1', 'yB3'];

      let result = [p59Array].map((row, index) => {
        return row.reduce((result, field, index) => {
          result[mapArray[index]] = field;
          return result;
        }, {});
      });

      let p59Arr = result[0];

      app.models.Staff.findOne({where: {clientId: data.tmsId, cardNo: data.cardno}})
        .then(staff => {
          if (!(staff && staff.id)) {
            reject("Unknown staff Card");
            return;
          }
          //insert into sales log:
          let salesObject = {
            "terminalId": parseInt(data.t, 16),
            "terminalVersion": data.v,
            "customerCode": customerCode,
            "customerId": null,
            "staffCard": data.cardno,
            staffCode: staff.code,
            "actionId": data.act,
            "txnDate": data.txndate,
            "invoiceNo": p59Arr.invoiceNo,
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
                    uom: product.uom,
                    quantity: Number(item.quantity),
                    reference: item.reference,
                    taxGroup: item.taxGroup,
                    discountType: item.discountType,
                    discount: Number(item.discount),
                    unitPrice: Number(item.unitPrice)
                  });
                }
              }).catch(e => {
              console.log(e);

            }).finally(() => {
              console.log('finally' + JSON.stringify(salesObject));
              if (data.itemSelectionData[0].items.length === index + 1) {
                // add payment mode ::
                app.models.PaymentMode.findOne({where: {id: paymentTermId}})
                  .then(paymentTerm => {
                    salesObject.paymentTermCode = paymentTerm.code;
                    salesObject.paymentTermId = paymentTerm.id;
                    app.models.SalesOrder.create(salesObject, (err, result) => {
                      if (err) {
                        console.log(err);
                        reject(err);
                        return;
                      }

                      console.log(result);
                      resolve(result);

                    });
                  }).catch(e => {
                  console.log(e);
                });
              }
            });
          });
        }).catch(e => {
        console.log(e);
        reject(e);
      });


    });
  }

};
