module.exports = {
  normalizeOrderId,
  addOrderId,
  splitOrderId
};

function normalizeOrderId(data, orderOnly) {

  var orderNumber;
  if (data.AmazonOrderReferenceId) {
    orderNumber = data.AmazonOrderReferenceId;
  } else if (data.NotificationData && data.NotificationData.AmazonOrderReferenceId) {
    orderNumber = data.NotificationData.AmazonOrderReferenceId;
  } else if (data.NotificationData && data.NotificationData.AmazonRefundId) {
    orderNumber = data.NotificationData.AmazonRefundId;
  } else if (data.NotificationData && data.NotificationData.AmazonAuthorizationId) {
    orderNumber = data.NotificationData.AmazonAuthorizationId;
  } else if (data.NotificationData && data.NotificationData.AmazonCaptureId) {
    orderNumber = data.NotificationData.AmazonCaptureId;
  } else if (data.OrderReferenceDetails && data.OrderReferenceDetails.AmazonOrderReferenceId) {
    orderNumber = data.OrderReferenceDetails.AmazonOrderReferenceId;
  } else {
    return data;
  }


  if (orderOnly) {
    return splitOrderId(orderNumber);
  } else {
    return addOrderId(data, orderNumber);
  }
}

function addOrderId(data, orderId) {
  return Object.assign({}, data, {
    extractedOrderId: splitOrderId(orderId)
  });
}

function splitOrderId(data, delimiter = '-', len = 3) {
  if (data.split(delimiter).length > len) {
    data = data.split(delimiter);
    data = data.slice(0, len).join(delimiter);
  }
  return data;
}
