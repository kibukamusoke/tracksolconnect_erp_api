let Promise = require('bluebird');
module.exports = {
  getTerminalFiles: (app, clientId) => {
    console.log('client id = ' + clientId);
    return new Promise((resolve, reject) => {
      console.log(JSON.stringify(app.models.Paymentmode));
      app.models.Product.productsTerminalFile(clientId, (err, products) => {
        if (err) {
          console.log(err);
          products = '';
          //next(err);
          //return;
        }
        console.log(products);
        app.models.Customer.customersTerminalFile(clientId, (err, customers) => {
          if (err) {
            console.log(err);
            customers = '';
            //next(err);
            //return;
          }

          console.log(customers);
          app.models.PaymentMode.paymentmodesTerminalFile(clientId, (err, paymentmodes) => {
            if (err) {
              console.log(err);
              paymentmodes = '';
              //next(err);
              //return;
            }
            console.log(paymentmodes);
            let extraFiles =
              'B=101\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT1.TXT\n' +
              'M=1\n' +
              'O_EN=Please select UOM\n' +
              'O_BM=Sila pilih UOM\n' +
              'O_DEF=1|Units|0|\n' +
              'D=\n' +
              '1|Units|0|\n' +
              'B=103\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT2.TXT\n' +
              'M=1\n' +
              'O_EN=Please select Tax\n' +
              'O_BM=Sila pilih TAX\n' +
              'O_DEF=5|No Tax|0|\n' +
              'D=\n' +
              '5|No Tax|0|\n' +
              'B=115\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT4.TXT\n' +
              'M=1\n' +
              'O_EN=Please select Tax\n' +
              'O_BM=Sila pilih TAX\n' +
              'O_DEF=5|No Tax 0 %25|0|\n' +
              'D=\n' +
              '5|No Tax 0 %25|0|\n' +
              'B=97\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT6.TXT\n' +
              'M=1\n' +
              'O_EN=Please select Tax\n' +
              'O_BM=Sila pilih TAX\n' +
              'O_DEF=3|N/A|0|\n' +
              'D=\n' +
              '3|N/A|0|\n' +
              'B=131\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT5.TXT\n' +
              'M=1\n' +
              'O_EN=Please select Tax\n' +
              'O_BM=Sila pilih TAX\n' +
              'O_DEF=1|NO VAT 0%25|0|26|26|26|\n' +
              'D=\n' +
              '1|NO VAT 0%25|0|26|26|26|\n' +
              'B=103\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT8.TXT\n' +
              'M=1\n' +
              'O_EN=Please select Tax\n' +
              'O_BM=Sila pilih TAX\n' +
              'O_DEF=3|NO VAT|0|\n' +
              'D=\n' +
              '3|NO VAT|0|\n' +
              'B=103\n' +
              'T=6\n' +
              'I=64\n' +
              'R=1\n' +
              'L=GST.TXT\n' +
              'M=1\n' +
              'O_EN=Please select Tax\n' +
              'O_BM=Sila pilih TAX\n' +
              'O_DEF=VAT|3|\n' +
              'D=\n' +
              'NO VAT|1|\n' +
              'VAT|3|\n' +
              'B=113\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT3.TXT\n' +
              'M=1\n' +
              'O_EN=Please select Tax\n' +
              'O_BM=Sila pilih TAX\n' +
              'O_DEF=1|Yes|0|\n' +
              'D=\n' +
              '1|Yes|0|\n' +
              '2|No|0|\n' +
              '3|IM|0|\n' +
              'B=126\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT8_OVR.TXT\n' +
              'M=1\n' +
              'O_EN=Please select\n' +
              'O_BM=Sila pilih\n' +
              'O_DEF=-1|Overwrite\n' +
              'D=\n' +
              '-1|Overwrite\n' +
              '-2|Add|ADD\n' +
              '-3|Reduce|SUB\n' +
              'B=124\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT8_ADD.TXT\n' +
              'M=1\n' +
              'O_EN=Please select\n' +
              'O_BM=Sila pilih\n' +
              'O_DEF=-2|ADD\n' +
              'D=\n' +
              '-1|Overwrite|OVR\n' +
              '-2|Add|ADD\n' +
              '-3|Reduce|SUB\n' +
              'B=127\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT8_SUB.TXT\n' +
              'M=1\n' +
              'O_EN=Please select\n' +
              'O_BM=Sila pilih\n' +
              'O_DEF=-3|Reduce\n' +
              'D=\n' +
              '-1|Overwrite|OVR\n' +
              '-2|Add|ADD\n' +
              '-3|Reduce|SUB\n' +
              'B=107\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT8_TRF.TXT\n' +
              'M=1\n' +
              'O_EN=Please select\n' +
              'O_BM=Sila pilih\n' +
              'O_DEF=-4|Transfer|TRF\n' +
              'D=\n' +
              '-4|Transfer|TRF\n' +
              'B=105\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT8_DSP.TXT\n' +
              'M=1\n' +
              'O_EN=Please select\n' +
              'O_BM=Sila pilih\n' +
              'O_DEF=-5|Dispose|DSP\n' +
              'D=\n' +
              '-5|Dispose|DSP\n' +
              'B=272\n' +
              'T=6\n' +
              'I=1\n' +
              'R=1\n' +
              'L=OPT7.TXT\n' +
              'M=1\n' +
              'O_EN=Select Category\n' +
              'O_BM=Sila pilih PM\n' +
              'O_DEF=-1|UNCATEGORIZED|0|\n' +
              'D=\n' +
              '-1|UNCATEGORIZED|0|\n' +
              '15|Offshelf|0|\n' +
              '18|Wood Range|0|\n' +
              '19|Primers & Undercoat|0|\n' +
              '20|Thinners and Spirits|0|\n' +
              '21|Tinted|0|\n' +
              '29|RAW MATERIALS|0|\n' +
              '30|JAVIER|0|\n' +
              '31|Paper|0|\n' +
              '32|COFFEE|0|\n';
            resolve(products + customers + paymentmodes + extraFiles);
          });
        });
      });
    });
  }
};
