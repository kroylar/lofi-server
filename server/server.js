// Run this server with: node server.js

var filename = "master.json",
    port     = 8080,
    rx_host  = 'localhost',
    rx_port  = 8085,
    wsserv   = require('ws').Server,
    wss      = new wsserv({port: port}),
    fs       = require('fs'),
    ee       = require('event-emitter'),
    emitter  = ee({}), listener,
    csvParse = require('csv-parse'),
    YAML     = require('yamljs'),
    net      = require('net');

var watcher;

// Event handler for when the server recieves a connection
wss.on('connection', function connection(ws) {
  // Log all incoming messages to the console.
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  // When a client connects, log to console
  ws.on('open', function () {
    console.log("New client");
  });

  // When a client leaves, log to console.
  ws.on('close', function () {
    console.log("Client left.");
  });

  // Read the file and send its contents to all clients
  var rf = function() {
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) throw err;
      ws.send(data, function ack(error) {
        if (error) console.log(error);
      });
    });
  }

  // Send the current contents on a new connection
  rf();

  // Listens for the 'file-changed' event. Reads file and sends to clients.
  emitter.on('file-changed', function(filename) {
    rf();
  })
  
});

// Generate JSON file
var generateJSON = function(layout_file, map_file, json_file) {
  var master = [];
  var layout = YAML.load(layout_file);
  fs.readFile(map_file, 'utf8', function(err, data) {
    if (err) throw err;
    csvParse(data, {comment: '#'}, function (err, mapData) {
      mapData.forEach(function(lofi) {
        // lofi[0] = lofi ID
        // lofi[1] = location ID
        // lofi[2] = switch number
        master.push({
          "node_id": lofi[0],
          "switch_id": lofi[2],
          "location_number": lofi[1],
          "location": layout.possibleLocations[lofi[1] - 1][lofi[1]].name,
          "type": layout.possibleLocations[lofi[1] - 1][lofi[1]].type,
          "status": "unknown"
        });
      });
      fs.writeFile(json_file, JSON.stringify(master), function (err) {
        if (err) throw err;
        console.log('Saved JSON.');
      });

      // Watch the file, emit 'file-changed' event on change.
      // Contents might not have changed. Could just be time.
      // TODO Check for content difference
      watcher = fs.watch(filename, function (event, filename) {
      if (event == 'change') {
          emitter.emit('file-changed', filename);
      }
      });
    });
  });
};

generateJSON('../layout.conf', '../mapping.conf', filename);

// Initiate a connection to the LoFi Receiver
var client = net.connect(rx_port, rx_host, function() {
  console.log('Connected to LoFi Receiver.');
});

// Called when receiving packets from the lofi receiver
client.on('data', function(data) {
  var idx;

  var node_id;
  var switch_id;
  var sw_status;

//  console.log('Raw Data:\n' + data.toString('utf8'));
  idx = data.indexOf('NodeId:');
  node_id = parseInt(data.slice(idx+7, idx+10));
  idx = data.indexOf('SW');
  switch_id = parseInt(data.slice(idx+2,idx+3)) - 1;
  sw_status = ((data.slice(idx+8, idx+12)).indexOf('O') == 0) ? 'open' : 'closed';

  var master;

  fs.readFile(filename, 'utf8', function(err, data) {
    if(err)
      throw err;

    var update_json;
    update_json = 0;
    master = JSON.parse(data);
    master.forEach(function(loc) {
      if ((loc.node_id == node_id) && (loc.switch_id == switch_id) && (loc.status != sw_status)) {
        loc.status = sw_status;
        update_json = 1;
      }
    });
    if (update_json != 0) {
      fs.writeFile(filename, JSON.stringify(master), function(err) {
        if (err)
          throw err;
//        console.log('updated JSON');
      });
    }
  });
});

// vim: tabstop=2:shiftwidth=2:expandtab:
