'use strict';

module.exports = function (Customer) {


  Customer.deleteByCode = function (data, next) {
    Customer.findOne({where: {clientId: data.clientId, code: data.code}})
      .then(customer => {
        if (!(customer && customer.id)) {
          next('Customer not found!');
          return;
        }

        Customer.deleteById(Number(customer.id))
          .then(x => {
            next(null, customer);
          })
          .catch(next);

      }).catch(next);
  };

  Customer.remoteMethod('deleteByCode', {
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
      type: 'customer',
      root: true
    },
    http: {
      path: '/customersDeleteByCode',
      verb: 'delete'
    }
  });


  Customer.customersTerminalFile = function (clientId, next) {
    Customer.find({where: {clientId: clientId}})
      .then(customers => {
        let resStringTXT = 'T=7\nI=1\nR=1\nL=CUSTOMER.TXT\nM=1\nD=\n';
        let resStringLST = 'T=7\nI=1\nR=1\nL=CUSTOMER.LST\nM=1\nSEARCH_COL=2;6,1,LOCMAP.TXT;1,3\nD=\n';

        if (customers.length === 0) {
          resStringTXT = 'B=' + resStringTXT.length + '\n' + resStringTXT;
          resStringLST = 'B=' + resStringLST.length + '\n' + resStringLST;
          next(null, resStringTXT + resStringLST);
          return;
        }

        customers.forEach((customer, index) => {
          resStringTXT += customer.id + '|' + encodeURI(customer.businessName) + '|' + customer.id + '|' + customer.primaryPhone + '|' + (customer.addressLine1 ? encodeURI(customer.addressLine1) : '') + (customer.addressLine2 ? '%0A' + encodeURI(customer.addressLine2) : '') + (customer.zip ? '%0A' + customer.zip : '') + (customer.state ? ' ' + customer.state : '') + '|' + (customer.creditLimit ? customer.creditLimit * 100 : 0) +  '|\n';
          if (customer.code && customer.code.length > 3) ;
          resStringLST += customer.code + '|' + customer.id + '|' + encodeURI(customer.businessName) + '|' + (customer.primaryPhone ? customer.primaryPhone : '') + '||||xx|||' + (customer.creditLimit ? customer.creditLimit * 100 : 0) + '|\n';

          if (customers.length === index + 1) {
            resStringTXT = 'B=' + resStringTXT.length + '\n' + resStringTXT;
            resStringLST = 'B=' + resStringLST.length + '\n' + resStringLST;
            next(null, resStringTXT + resStringLST);
          }
        });

      }).catch(e => {
      console.log(e);
      next(e);
    });
  };

  Customer.remoteMethod('customersTerminalFile', {
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
      path: '/customersTerminalFile/:clientId',
      verb: 'get'
    }
  });

  // send data as plain text ::
  Customer.afterRemote('customersTerminalFile', function (context, remoteMethodOutput, next) {
    context.res.setHeader('Content-type', 'text/plain');
    context.res.end(context.result);
  });

};
