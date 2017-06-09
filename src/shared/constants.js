var firebase = require('firebase');

// copy from
// console.firebase.google.com/u/0/project/<your-project-name>/overview >
//   "Add Firebase to your web app"
const config = {
  apiKey: 'firebase-api-key',
  authDomain: '<your-app-name-here>.firebaseapp.com',
  databaseURL: 'https://<your-app-name-here>.firebaseio.com',
  projectId: '<your-app-name-here>',
  storageBucket: '<your-app-name-here>.appspot.com',
  messagingSenderId: '123456789'
};

module.exports = {

  // the from address you want attached to your e-mails
  // must match verified domain with postmark / aws ses
  defaultFromEmail: 'you@your-domain.com',

  // the email address you use to send yourself
  // confirmation / error notification e-mails
  defaultToEmail: 'you@gmail.com',

  Firebase: firebase.initializeApp(config)
};
