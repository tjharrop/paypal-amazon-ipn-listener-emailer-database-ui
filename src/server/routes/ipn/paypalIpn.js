var https = require('https');
var qs = require('querystring');

var SANDBOX_URL = 'ipnpb.sandbox.paypal.com';
var REGULAR_URL = 'ipnpb.paypal.com';

module.exports = function verify(params, settings) {

  return new Promise(function (resolve, reject) {

    // Settings are optional, use default settings if not set
    if (!settings) {
      settings = {
        'allow_sandbox': false
      };
    }

    if (!params) {
      reject('error: No params were passed to ipn.verify');
      return;
    }

    params.cmd = '_notify-validate';

    var body = qs.stringify(params, null, null, {

      // identity function to avoid ipn verification errors with
      // non ascii characters that would otherwise become encoded
      // such as "ð" -> "%C3%B0"
      encodeURIComponent: (x) => x
    });

    // Set up the request to paypal
    var reqOptions = {
      host: (params.test_ipn) ? SANDBOX_URL : REGULAR_URL,
      method: 'POST',
      path: '/cgi-bin/webscr',
      headers: {
        'Content-Length': body.length
      }
    };

    if (params.test_ipn && !settings.allow_sandbox) {
      reject('error: Received request with test_ipn parameter while sandbox is disabled');
      return;
    }

    var req = https.request(reqOptions, function paypalRequest(res) {
      var data = [];

      res.on('data', function paypalResponse(d) {
        data.push(d);
      });

      res.on('end', function responseEnd() {
        var response = data.join('');

        // Check if IPN is valid
        if (response === 'VERIFIED') {
          resolve(response);
        } else {
          reject('error: IPN Verification status: ' + response);
        }
      });
    });

    // Add the post parameters to the request body
    req.write(body);

    // Request error
    req.on('error', (err) => reject(err));

    req.end();

  });
};
