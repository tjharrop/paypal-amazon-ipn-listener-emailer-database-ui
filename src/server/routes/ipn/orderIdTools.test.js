/* global test expect describe */
import * as orderTools from './orderIdTools';

test('it properly splits an order id with defaults handling length > 3', () => {
  expect(orderTools.splitOrderId('123-345-678-789')).toBe('123-345-678');
});
test('it properly splits an order id with explicit length', () => {
  expect(orderTools.splitOrderId('123-345-678-789', undefined, 2)).toBe('123-345');
});
test('it returns an order id unchanged with with request for length > order id', () => {
  expect(orderTools.splitOrderId('123-345-678-789', undefined, 99)).toBe('123-345-678-789');
});
test('it properly splits an order id with defaults handling length > 3, and different delimiter', () => {
  expect(orderTools.splitOrderId('123*345*678*789', '*')).toBe('123*345*678');
});

test('it properly adds an order id', () => {
  let data = {};
  let orderId = '123-456-789-910';
  expect(orderTools.addOrderId(data, orderId)).toEqual({
    extractedOrderId: '123-456-789'
  });
});
test('it properly adds an order id, without overwriting original parameter', () => {
  let data = {
    original: 'should still be here'
  };
  let orderId = '123-456-789-910';
  expect(orderTools.addOrderId(data, orderId)).toEqual({
    extractedOrderId: '123-456-789',
    original: 'should still be here'
  });
});
test('it properly adds an order id, but will overwrite parameter with same key', () => {
  let data = {
    extractedOrderId: 'should still be here'
  };
  let orderId = '123-456-789-910';
  expect(orderTools.addOrderId(data, orderId)).toEqual({
    extractedOrderId: '123-456-789'
  });
});

describe('it properly handles normalizing order ids', () => {
  test('it will pass through data not matching any pattern', () => {
    expect(orderTools.normalizeOrderId({
      'not matching': 'anything'
    })).toEqual({
      'not matching': 'anything'
    });
  });
  test('it will extract an order number from the AmazonOrderReferenceId key', () => {
    expect(orderTools.normalizeOrderId({
      'AmazonOrderReferenceId': '123-456-789-910'
    })).toEqual({
      'AmazonOrderReferenceId': '123-456-789-910',
      'extractedOrderId': '123-456-789'
    });
  });
  test('it will extract an order number from the NotificationData.AmazonOrderReferenceId key', () => {
    expect(orderTools.normalizeOrderId({
      NotificationData: {
        'AmazonOrderReferenceId': '123-456-789-910'
      }
    })).toEqual({
      NotificationData: {
        'AmazonOrderReferenceId': '123-456-789-910',
      },
      'extractedOrderId': '123-456-789'
    });
  });
  test('it will extract an order number from the NotificationData.AmazonRefundId key', () => {
    expect(orderTools.normalizeOrderId({
      NotificationData: {
        'AmazonRefundId': '123-456-789-910'
      }
    })).toEqual({
      NotificationData: {
        'AmazonRefundId': '123-456-789-910',
      },
      'extractedOrderId': '123-456-789'
    });
  });
  test('it will extract an order number from the NotificationData.AmazonAuthorizationId key', () => {
    expect(orderTools.normalizeOrderId({
      NotificationData: {
        'AmazonAuthorizationId': '123-456-789-910'
      }
    })).toEqual({
      NotificationData: {
        'AmazonAuthorizationId': '123-456-789-910',
      },
      'extractedOrderId': '123-456-789'
    });
  });
  test('it will extract an order number from the NotificationData.AmazonCaptureId key', () => {
    expect(orderTools.normalizeOrderId({
      NotificationData: {
        'AmazonCaptureId': '123-456-789-910'
      }
    })).toEqual({
      NotificationData: {
        'AmazonCaptureId': '123-456-789-910',
      },
      'extractedOrderId': '123-456-789'
    });
  });
  test('it will extract an order number from the OrderReferenceDetails.AmazonOrderReferenceId key', () => {
    expect(orderTools.normalizeOrderId({
      OrderReferenceDetails: {
        'AmazonOrderReferenceId': '123-456-789-910'
      }
    })).toEqual({
      OrderReferenceDetails: {
        'AmazonOrderReferenceId': '123-456-789-910',
      },
      'extractedOrderId': '123-456-789'
    });
  });
});
