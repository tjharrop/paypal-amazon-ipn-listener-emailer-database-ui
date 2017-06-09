var admin = require('firebase-admin');
const flat = require('flat');

var serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Get a database reference
var db = admin.database();

module.exports = {
  check: function check(data) {

    return new Promise(function (resolve, reject) {
      var ref = db.ref(`purchases/${data.txn_id}`);

      // Attach an asynchronous callback to read the data at our purchase reference
      ref.once('value', function (snapshot) {
        var existingRecord = snapshot.val();
        if (existingRecord) console.log(`record already exists for id ${existingRecord.txn_id} as status ${existingRecord.payment_status}`);

        // if record exists and completed
        if (existingRecord && existingRecord.payment_status === 'Completed') {

          // do not continue promise chain
          reject('record already exists and completed');
        } else {
          console.log(`order that needs to be updated, transaction id: ${data.txn_id}`);
          resolve(data);
        }
      }, function (error) {
        if (error) {
          console.log('The db read failed: ' + error.code);
          reject(error);
        }
      });
    });
  },
  update: function update(data) {

    return new Promise(function (resolve, reject) {

      // add unix timestamp for sorting
      data = addTimeStamp(data, 'payment_date');
      var ref = db.ref('purchases');
      var key = `${data.txn_id}`;
      ref.child(key).update(data, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },
  checkAmazon: function checkAmazon(data) {
    return new Promise(function (resolve, reject) {
      var ref = db.ref(`purchases/${data.extractedOrderId}`);

      // Attach an asynchronous callback to read the data at our purchase reference
      ref.once('value', function (snapshot) {
        var existingRecord = snapshot.val();
        if (existingRecord) console.log(`record already exists for id ${existingRecord.extractedOrderId}`);

        console.log(`order that needs to be updated, transaction id: ${data.extractedOrderId}`);
        resolve(data);
        // }
      }, function (error) {
        if (error) {
          console.log('The db read failed: ' + error.code);
          reject(error);
        }
      });
    });
  },
  updateAmazon: function updateAmazon(data) {
    return new Promise(function (resolve, reject) {

      // add unix timestamp for sorting
      if (data.NotificationData && data.NotificationData.CreationTimestamp) {
        data = addTimeStamp(data, 'NotificationData', 'CreationTimestamp');
      } else if (data.OrderReferenceDetails && data.OrderReferenceDetails.CreationTimestamp) {
        data = addTimeStamp(data, 'OrderReferenceDetails', 'CreationTimestamp');
      } else {
        console.log('timestamp key not found in: ', flat(data));
      }

      var ref = db.ref('purchases');
      var key = `${data.extractedOrderId}`;

      // flatten json. can't use '.' as delimiter with firebase
      ref.child(key).update(flat(data, {
        delimiter: '~'
      }), function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },

  // exporting method for testing
  addTimeStamp
};

// generalized for PayPal or Amazon IPN data format
function addTimeStamp(data, ...param) {
  if (param.length > 1) {
    return Object.assign({}, data, {
      unix_timestamp: Date.parse(data[param[0]][param[1]])
    });
  } else {
    return Object.assign({}, data, {
      unix_timestamp: Date.parse(data[param])
    });
  }
}
