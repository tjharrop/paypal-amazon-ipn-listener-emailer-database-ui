const express = require('express');
const router = express.Router();
const paypalIpn = require('./paypalIpn');
const purchaserDatabase = require('./purchaserDatabase');
const emailApi = require('./emailApi');
const constants = require('../../../shared/constants');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const flat = require('flat');
const parseReqBody = require('./shared.js').parseReqBody;
const normalizeOrderId = require('./orderIdTools').normalizeOrderId;

const CUSTOMER_SUBJECT = 'Your shiny new download';
const DOWNLOAD_INSTRUCTIONS_TEXT = require('./downloadInfo').text;
const DOWNLOAD_INSTRUCTIONS_HTML = require('./downloadInfo').html;
const FROM_EMAIL = constants.defaultFromEmail;
const SUBJECT_FAIL = 'ipn promise chain rejected with: ';
const IPN_RECEIVED_SUCCESS = 'ipn data received (PayPal)';
const IPN_RECEIVED_SUCCESS_AMAZON = 'ipn data received (Amazon)';
const TO_EMAIL = constants.defaultToEmail;
const PAYPAL_PRODUCT_NAME_SNIPPET = 'Excellent Product';
const AMAZON_PRODUCT_NAME_SNIPPET = 'Excellent Product';

var amazonPayments = require('amazon-payments');

router.get('/', function (req, res) {
  res.sendStatus(200);
});

// to *always* parse json even with wrong content-type
// per https://github.com/expressjs/body-parser/issues/76
var parsejsonAlways = bodyParser.json({
  type: function () {
    return true;
  }
});

router.post(['/amazon', '/amazon/:environment'], parsejsonAlways, function (req, res) {

  // for testing, direct ipn to api/amazon/sandbox,
  // sets environment to Sandbox
  var environment;
  if(req.params.environment === 'sandbox') {
    environment = 'Sandbox';
  } else {
    environment = 'Production';
  }

  var payment = amazonPayments.connect({
    environment: amazonPayments.Environment[environment],
    sellerId: process.env.amz_merchant_id,
    mwsAccessKey: process.env.amz_access_key,
    mwsSecretKey: process.env.amz_secret_key,
    clientId: process.env.amz_client_id
  });

  payment = Promise.promisifyAll(payment);
  payment.offAmazonPayments = Promise.promisifyAll(payment.offAmazonPayments);

  res.sendStatus(200);

  payment.parseSNSResponseAsync(req.body)
    .then((data) => {

      // data will contain JSON-ified XML from the message.
      console.log('data: ', data);

      // send me an email of the ipn data received
      emailApi({
        toEmail: TO_EMAIL,
        fromEmail: FROM_EMAIL,
        emailSubject: IPN_RECEIVED_SUCCESS_AMAZON,
        messageText: parseReqBody(flat(data)),
        messageHtml: parseReqBody(flat(data), true)
      });

      return data;
    })
    .then((data) => {

      // pass-through non-capture ipn messages for database update only
      if (data.NotificationData && !data.NotificationData.AmazonCaptureId) {
        return data;
      }

      // get email of purchaser
      return payment.offAmazonPayments.getOrderReferenceDetailsAsync({

        // pass true to just get order id
        AmazonOrderReferenceId: normalizeOrderId(data, true)
      });

    })
    .then((data) => {

      // normalize and append order id
      data = normalizeOrderId(data);

      // add purchase info to database
      return purchaserDatabase.checkAmazon(data);
    })
    .then((data) => {
      return purchaserDatabase.updateAmazon(data);
    })
    .then((data) => {
      console.log('database operation complete ', data.extractedOrderId);

      // only applies to capture -> getOrderReferenceDetailsAsync results
      if (data.OrderReferenceDetails) {

        // only send download link if the product name contains the snippet defined above
        // Amazon Pay button must have product name encoded in the 'Seller Note' field
        if (data.OrderReferenceDetails.SellerNote && data.OrderReferenceDetails.SellerNote.indexOf(AMAZON_PRODUCT_NAME_SNIPPET) >= 0) {

          // send me an exact copy of the customer download email
          emailApi({
            toEmail: TO_EMAIL,
            fromEmail: FROM_EMAIL,
            emailSubject: `(amazon) I sent a download link to ${data.OrderReferenceDetails.Buyer.Email} with subject "${CUSTOMER_SUBJECT}" and text included`,
            messageText: DOWNLOAD_INSTRUCTIONS_TEXT,
            messageHtml: DOWNLOAD_INSTRUCTIONS_HTML
          });

          // send the customer their download link
          emailApi({
            toEmail: data.OrderReferenceDetails.Buyer.Email,
            fromEmail: FROM_EMAIL,
            emailSubject: CUSTOMER_SUBJECT,
            messageText: DOWNLOAD_INSTRUCTIONS_TEXT,
            messageHtml: DOWNLOAD_INSTRUCTIONS_HTML
          });
        } else {

          // send me notification that the following customer
          // will not be receiving a download link
          emailApi({
            toEmail: TO_EMAIL,
            fromEmail: FROM_EMAIL,
            emailSubject: `I will not be sending a download message to ${data.OrderReferenceDetails.Buyer.Email}`,
            messageText: `I will not be sending a download message to ${data.OrderReferenceDetails.Buyer.Email} ${parseReqBody(flat(data))}`,
            messageHtml: `I will not be sending a download message to ${data.OrderReferenceDetails.Buyer.Email} ${parseReqBody(flat(data), true)}`
          });
        }
      }


    })
    .catch((err) => {
      console.error(`caught promise rejection: ${err}`);

      // send me an email if any promise rejected
      emailApi({
        toEmail: TO_EMAIL,
        fromEmail: FROM_EMAIL,
        emailSubject: SUBJECT_FAIL + err,
        messageText: parseReqBody(flat(req.body)),
        messageHtml: parseReqBody(flat(req.body), true)
      });
    });
});

router.post('/paypal', function (req, res) {
  res.sendStatus(200);

  // send me an email of the ipn data received
  emailApi({
    toEmail: TO_EMAIL,
    fromEmail: FROM_EMAIL,
    emailSubject: IPN_RECEIVED_SUCCESS,
    messageText: parseReqBody(req.body),
    messageHtml: parseReqBody(req.body, true)
  });

  paypalIpn(req.body, {
    'allow_sandbox': true
  })
    .then((data) => {
      console.log('ipn response came back as: ', data);
      return purchaserDatabase.check(req.body);
    })
    .then((data) => {
      return purchaserDatabase.update(data);
    })
    .then((data) => {
      console.log('database operation complete ', data.txn_id);
      if (data.payment_status === 'Completed') {

        // only send download link if the product name contains the snippet defined above
        // PayPal button must have product name encoded in the 'Item name' field
        if (data.item_name && data.item_name.indexOf(PAYPAL_PRODUCT_NAME_SNIPPET) >= 0) {

          // send me an exact copy of the customer download email
          emailApi({
            toEmail: TO_EMAIL,
            fromEmail: FROM_EMAIL,
            emailSubject: `(paypal) I sent a download link to ${data.payer_email} with subject "${CUSTOMER_SUBJECT}" and text included`,
            messageText: DOWNLOAD_INSTRUCTIONS_TEXT,
            messageHtml: DOWNLOAD_INSTRUCTIONS_HTML
          });

          // send the customer their download link
          emailApi({
            toEmail: data.payer_email,
            fromEmail: FROM_EMAIL,
            emailSubject: CUSTOMER_SUBJECT,
            messageText: DOWNLOAD_INSTRUCTIONS_TEXT,
            messageHtml: DOWNLOAD_INSTRUCTIONS_HTML
          });
        } else {

          // send me notification that the following customer
          // will not be receiving a download link
          emailApi({
            toEmail: TO_EMAIL,
            fromEmail: FROM_EMAIL,
            emailSubject: `I will not be sending a download message to ${data.payer_email}`,
            messageText: `I will not be sending a download message to ${data.payer_email} ${parseReqBody(data)}`,
            messageHtml: `I will not be sending a download message to ${data.payer_email} ${parseReqBody(data, true)}`
          });
        }
      }
    })
    .catch((err) => {
      console.error(`caught promise rejection: ${err}`);

      // send me an email if any promise rejected
      emailApi({
        toEmail: TO_EMAIL,
        fromEmail: FROM_EMAIL,
        emailSubject: SUBJECT_FAIL + err,
        messageText: parseReqBody(req.body),
        messageHtml: parseReqBody(req.body, true)
      });
    });
});

module.exports = router;
