'use strict';

module.exports = function(Sale) {
  Sale.disableRemoteMethod('deleteById', true);
};
