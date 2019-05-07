'use strict';

module.exports = function(SalesOrder) {
  SalesOrder.disableRemoteMethod('deleteById', true);
};
