var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var ipn = require('./routes/ipn/ipn');
var app = express();
var ejs = require('ejs');

// for parsing application/json
// setting higher limit in the case of encoded attachments
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(morgan('dev'));
app.use('/api/ipn', ipn);
app.use(express.static(path.resolve(__dirname, '../..', 'build')));
app.get('/*', function(req, res) {
  res.render(path.join(__dirname, '../..', '/build/index.html'));
});

module.exports = app;
