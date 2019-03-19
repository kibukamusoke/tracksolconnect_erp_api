'use strict';

module.exports = function(Staff) {
  Staff.deleteByCode = function (data, next) {
    Staff.findOne({where: {clientId: data.clientId, code: data.code}})
      .then(staff => {
        if (!(staff && staff.id)) {
          next('Staff not found!');
          return;
        }

        Staff.deleteById(Number(staff.id))
          .then(x => {
            next(null, staff);
          })
          .catch(next);

      }).catch(next);
  };

  Staff.remoteMethod('deleteByCode', {
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
      type: 'staff',
      root: true
    },
    http: {
      path: '/staffDeleteByCode',
      verb: 'delete'
    }
  });

};
