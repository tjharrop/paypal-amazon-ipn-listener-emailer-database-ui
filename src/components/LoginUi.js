import React, { Component } from 'react';
import * as firebase from 'firebase';

export default class Login extends Component {
  componentDidMount () {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);

  }
  render () {
    return (
      <div>
        Loading google authorization module...
      </div>
    );
  }
}
