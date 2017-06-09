/* global test expect */
import { addTimeStamp } from './purchaserDatabase';

test('it adds a unix timestamp matching Amazon data object format', () => {
  expect(addTimeStamp({
    blahdeblah: 'special',
    OrderReferenceDetails: {
      CreationTimestamp: '2017-05-28T18:59:13.778Z'
    }
  }, 'OrderReferenceDetails', 'CreationTimestamp')).toEqual({
    blahdeblah: 'special',
    OrderReferenceDetails: {
      CreationTimestamp: '2017-05-28T18:59:13.778Z'
    },
    unix_timestamp: 1495997953778
  });
});
test('it adds a unix timestamp matching PayPal data object format', () => {
  expect(addTimeStamp({
    blahdeblah: 'special',
    payment_date: '07:35:08 Jun 01, 2017 PDT'
  }, 'payment_date')).toEqual({
    blahdeblah: 'special',
    payment_date: '07:35:08 Jun 01, 2017 PDT',
    unix_timestamp: 1496327708000
  });
});
