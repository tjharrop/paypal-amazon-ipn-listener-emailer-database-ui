import React, { Component } from 'react';

export default class Loading extends Component {
  constructor (props) {
    super(props);
    this.state = {
      display: 'Loading'
    };
  }
  componentDidMount () {
    this.timer = setInterval( () => {
      let display = this.state.display;
      let updateDisplay = (display === 'Loading...') ? 'Loading' : display + '.';
      this.setState({display: updateDisplay});
    }, 200);
  }
  componentWillUnmount () {
    clearInterval(this.timer);
  }
  render () {
    return (
      <div>
        {this.state.display}
      </div>
    );
  }
}
