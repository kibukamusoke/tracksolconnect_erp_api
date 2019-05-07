'use strict';

module.exports = function (Paymentmode) {
  Paymentmode.deleteByCode = function (data, next) {
    Paymentmode.findOne({where: {clientId: data.clientId, code: data.code}})
      .then(paymentmode => {
        if (!(paymentmode && paymentmode.id)) {
          next('Paymentmode not found!');
          return;
        }

        Paymentmode.deleteById(Number(paymentmode.id))
          .then(x => {
            next(null, paymentmode);
          })
          .catch(next);

      }).catch(next);
  };

  Paymentmode.remoteMethod('deleteByCode', {
    accepts:
      {
        arg: 'data',
        type: 'clientCodeInput',
        http: {
          source: 'body'
        }
      },
    returns: {
      arg: 'deleted',
      type: 'paymentmode',
      root: true
    },
    http: {
      path: '/paymentmodesDeleteByCode',
      verb: 'delete'
    }
  });


  Paymentmode.paymentmodesTerminalFile = function (clientId, next) {
    Paymentmode.find({where: {clientId: clientId}})
      .then(paymentmodes => {
        let opt9 = 'T=6\nI=1\nR=1\nL=OPT9.TXT\nM=1\nD=\n';
        let optpay = 'T=6\nI=1\nR=1\nL=OPTPAY.TXT\nM=1\nD=\n';

        if (paymentmodes.length === 0) {
          opt9 = 'B=' + opt9.length + '\n' + opt9;
          optpay = 'B=' + optpay.length + '\n' + optpay;
          next(null, opt9 + optpay);
          return;
        }

        paymentmodes.forEach((paymentmode, index) => {
          opt9 += paymentmode.id + '|' + encodeURI(paymentmode.name) + '|' + encodeURI(paymentmode.code) + '|0|\n';
          optpay += paymentmode.id + '|' + encodeURI(paymentmode.name) + '|' + encodeURI(paymentmode.code) + '|0|\n';
          if (paymentmodes.length === index + 1) {
            opt9 = 'B=' + opt9.length + '\n' + opt9;
            optpay = 'B=' + optpay.length + '\n' + optpay;
            next(null, opt9 + optpay);
          }
        });
      }).catch(e => {
      console.log(e);
      next(e);
    });
  };

  Paymentmode.remoteMethod('paymentmodesTerminalFile', {
    accepts:
      {
        arg: 'clientId',
        type: 'string',
        http: {
          source: 'params'
        }
      },
    returns: {
      arg: 'fileData',
      type: 'string',
      root: true
    },
    http: {
      path: '/paymentmodesTerminalFile/:clientId',
      verb: 'get'
    }
  });

  // send data as plain text ::
  Paymentmode.afterRemote('paymentmodesTerminalFile', function (context, remoteMethodOutput, next) {
    context.res.setHeader('Content-type', 'text/plain');
    context.res.end(context.result);
  });


};
