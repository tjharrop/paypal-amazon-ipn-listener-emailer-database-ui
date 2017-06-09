import React, {Component} from 'react';
import { Firebase } from '../../shared/constants';
export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      purchases: []
    };
  }
  componentDidMount() {

    var purchases = Firebase.database().ref('purchases').limitToLast(10).orderByChild('unix_timestamp');
    purchases.on('value', (snapshot) => {
      this.setState({purchases: []});
      snapshot.forEach((childSnapshot) => {
        this.setState({
          purchases: [childSnapshot.val()].concat(this.state.purchases)
        });
      });
    });
  }
  componentWillUnmount() {
    var purchases = Firebase.database().ref('purchases');
    purchases.off('value');
  }
  render() {
    const PaymentDetail = (props) => {
      var result = [];
      for (var item in props.purchase) {
        result.push([item, props.purchase[item]]);
      }

      // blacklist the following keys:
      const blacklist = {

        // paypal
        payment_gross: true,
        mc_currency: true,
        business: true,
        protection_eligibility: true,
        verify_sign: true,
        payer_status: true,
        quantity: true,
        receiver_email: true,
        payer_id: true,
        receiver_id: true,
        item_number: true,
        charset: true,
        notify_version: true,
        ipn_track_id: true,
        cmd: true,

        // amazonpay
        'OrderReferenceDetails~ExpirationTimestamp': true,
        'OrderReferenceDetails~IdList~member': true,
        'OrderReferenceDetails~OrderReferenceStatus~LastUpdateTimestamp': true,
        'OrderReferenceDetails~PlatformId': true,



      };

      let style = {
        backgroundColor: 'grey',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '10px',
        color: 'white'
      };

      return (
        <div style={style}>

          {result.filter((item) => {
            return !blacklist[item[0]];
          }).map((item, i) => {
            return <div key={i}>
              <div>{`${item[0]}: ${item[1]}`}</div>
            </div>;
          })}
          {props.children}
        </div>
      );
    };

    return (
      <div className='container'>
        <div>
          purchases:{< hr />}
        </div>
        <div>
          {this.state.purchases.length
            ? this.state.purchases.map((purchase, i) => <PaymentDetail purchase={purchase} key={i}></PaymentDetail>)
            : null}
        </div>
      </div>
    );
  }
}
