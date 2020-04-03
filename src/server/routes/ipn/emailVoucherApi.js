var aws = require('aws-sdk');
var request = require('request');
var constants = require('../../../shared/constants');

// aws loads config from environmental variables
// available to process.env because of .env file and dotenv package

// load AWS SES
// apiVersion is Amazon-provided boilerplate, do not change
var ses = new aws.SES({
  apiVersion: '2010-12-01'
});

module.exports = ({

  // these are es6 default parameters, only applied if not provided
  toEmail = constants.defaultToEmail,
  fromEmail = constants.defaultFromEmail,
  emailSubject = 'no subject received',
  messageText = 'no plaintext included',
  messageHtml = 'no html message included',
  venueName = 'Mystery venue',
  voucherAmount = '1,000,000',
  voucherId = 'br0k3n',
  customerName = 'The Undertaker',
  template = '17217943',
  venueLogo = 'ht',

  // amazon || postmark
  sendEngine = 'postmark'
}) => {


  if (sendEngine === 'amazon') {

    // accepts one or an array of e-mails
    var to = [toEmail];

    // this sends the email via the aws-sdk
    ses.sendEmail({
      Source: fromEmail,
      Destination: {
        ToAddresses: to
      },
      Message: {
        Subject: {
          Data: emailSubject
        },
        Body: {
          Text: {
            Data: messageText
          },
          Html: {
            Data: messageHtml
          }
        }
      }
    },
    function (err, data) {
      if (err) {
        console.error(err);
      } else {
        console.log('Email sent:');
        console.log(data);
      }
    });
  }

  if (sendEngine === 'postmark') {
    var options = {
      url: 'https://api.postmarkapp.com/email/withTemplate',
      json: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_API_TOKEN
      },
      body: {
        From: fromEmail,
        To: toEmail,
        Bcc: 'tj@hospothreads.com',
        TemplateId: template,
        TemplateModel: {
          'Venue': venueName,
          'Amount': voucherAmount,
          'txn': voucherId,
          'customerName': customerName,
          'logo': venueLogo
        }
      }
    };

    request.post(options, function (error, response, body) {
      console.log('error:', error); // log the error if one occurred
      console.log('Email sent!');
      console.log('statusCode:', response && response.statusCode); // log the response status code if a response was received
      console.log('body:', body); // log the response
    });

  }
};
