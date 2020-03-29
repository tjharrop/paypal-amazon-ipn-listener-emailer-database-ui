var firebase = require('firebase');

// copy from
// console.firebase.google.com/u/0/project/<your-project-name>/overview >
//   "Add Firebase to your web app"
const config = {
  apiKey: "AIzaSyClRSQIgzya0Kus9IqrGYFXFUbJnu2ZMMA",
  authDomain: "hospothreads.firebaseapp.com",
  databaseURL: "https://hospothreads.firebaseio.com",
  projectId: "hospothreads",
  storageBucket: "hospothreads.appspot.com",
  messagingSenderId: "481540750415",
  appId: "1:481540750415:web:824b715a0d0b4d63a2be3a",
  measurementId: "G-PE355J781R"
};

module.exports = {

  // the from address you want attached to your e-mails
  // must match verified domain with postmark / aws ses
  defaultFromEmail: 'vouchers@hospothreads.com',

  // the email address you use to send yourself
  // confirmation / error notification e-mails
  defaultToEmail: 'tj@hospothreads.com',

  Firebase: firebase.initializeApp(config)
};
