
var util = require('util');
var net = require('net');
var Parser = require('jsonparse');

var Client = function {
  this.client = net.connect(options);
  this.callbacks = {};
  var p = new Parser();
  c.on('data', function(chunk) {
    p.write(chunk);
  });
  p.onValue = function(value) {
    if (!this.stack.length) handleCallback.call(this, value);
  };
};

Client.prototype.push = function(data, callback) {
  var callbackId = storeCallback.call(this, callback);
  this.client.write(JSON.stringify({
    method: 'push',
    data: data,
    callbackId: callbackId
  }));
};

var handleCallback = function(data) {
  var callback = this.callbacks[data.callbackId];
  delete this.callbacks[data.callbackId];
  callback(data.err, data.value);
};

var storeCallback = function(callback) {
  var id;
  do {
    id = Math.random()*999999;
  } while (!this.callbacks[id]);
  this.callbacks[id] = callback;
  return id;
};

module.exports = { 
  server: function(options) {
    var queues = {};
    function getQueue(id) {
      return queues[id] || (queues[id] = []);
    }
    function requestHandler(req, res) {
      var queue = getQueue(req.queueId); 
      var value = queue[req.method](req.data);
      res.write(JSON.stringify({callbackId: req.callbackId, value: value}));
    }

    net.createServer(function (c) {
      var p = new Parser();
      c.on('data', function(chunk) {
        p.write(chunk);
      });
      p.onValue = function(value) {
        if (!this.stack.length) requestHandler(value, c);
      };
    }.bind(this)).listen(options.port);
  },
  Client: Client
};
