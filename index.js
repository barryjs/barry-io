var barry = require('barry');
var send = require('send');
var parse = require('url').parse;

exports.listen = function (server, opts) {
  opts = opts || {};

  opts.path = opts.path || "/barry";
  if ("undefined" === typeof opts.static) opts.static = true;

  var socketio = require('socket.io');
  var io = socketio.listen(server, opts.io || {});

  if (opts.static) {
    var url = opts.path + '/barry.js';
    var evs = server.listeners('request').slice(0);
    server.removeAllListeners('request');
    server.on('request', function(req, res) {
      if (0 == req.url.indexOf(url)) {
        var path = parse(req.url).pathname.split('/').slice(-1);
        send(req, path)
          .root(__dirname + '/node_modules/barry/build/js')
          .index(false)
          .pipe(res);
      } else {
        for (var i = 0; i < evs.length; i++) {
          evs[i].call(server, req, res);
        }
      }
    });
  }

  var ep = new barry.Server(io.sockets);

  return ep;
};
