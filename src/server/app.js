'use strict';

var express        = require('express'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    helloRoute     = require(__dirname + '/routes/hello-route'),
    path           = require('path'),
    app            = express(),
    PORT           = process.env.PORT || 3000;

function start(done) {
  if (!this.server) {
    var PUBLISH_PATH = path.resolve(__dirname + '/../../public');

    app.use(express.static(PUBLISH_PATH));
    app.use(bodyParser.urlencoded({'extended':'true'}));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());

    app.use('/api/hello', helloRoute);

    app.get('*', function(req, res) {
      res.sendFile(PUBLISH_PATH + '/index.html');
    });

    this.server = app.listen(PORT, function() {
      console.log('App listening on PORT ' + PORT);
      done && done();
    });
  }
}

function stop() {
  this.server.close();
}

module.exports = {
  start: start,
  stop: stop
};
