module.exports = {
  parseReqBody
};

function parseReqBody(req, html) {

  // pass true for html email formatting
  var result = '';
  var separator = html === true ? '<br>' : '\n';
  for (var item in req) {
    result += (`${item}: ${req[item]}${separator}`);
  }
  return result;
}
