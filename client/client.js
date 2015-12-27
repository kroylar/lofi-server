// Browserify command to build client.js:
//     browserify -t [ babelify --presets [ react ] ] client.js -o bundle.js
var server    = 'rpi7',
    port      = '8080',
    WebSocket = require('ws'),
    ws        = new WebSocket('ws://' + server + ':' + port),
    React     = require('react'),
    ReactDOM  = require('react-dom'),
    Table     = require('react-bootstrap').Table,
    ee        = require('event-emitter'),
    emitter   = ee({}), listener;


var statuses = ["open", "closed", "unknown"];

var setStatus = function (id, status) {
  if (typeof id === "undefined" && statuses.indexOf(status)) {
    return false;
  }
  var svgDoc = document.getElementById("layout");
  if (svgDoc) {
    svgDoc = svgDoc.contentDocument;
    var loc = svgDoc.getElementById("loc-"+id);
    if (loc) {
      // Check for existing statuses
      loc.classList.forEach(function (classItem) {
        // If the class is in the statuses array, remove that class
        if (statuses.indexOf(classItem) !== -1) {
          loc.classList.remove(classItem);
        }
      });
      loc.classList.add(status);
    }
  }
};

// Websockets event handlers
// Send a simple message when the client connects
ws.onopen = function open() {
  ws.send('I connected.');
};

// Handle receiving a new message
ws.onmessage = function(data, flags) {
  // Emit a 'new-message' event so that the React class can intercept it
  // and update
  emitter.emit('new-message', data);
  test = data;
};

var StatusList = React.createClass({
  getInitialState: function () {
    return {data: []};
  },
  componentDidMount: function() {
    emitter.on('new-message', this.handleNewMessage);
  },
  handleNewMessage: function (message) {
    this.setState({data: JSON.parse(message.data)});
  },
  componentWillUnmount: function() {
    emitter.off('new-message', this.handleNewMessage);
  },
  render: function() {
    // If we don't have the data back from the server yet,
    // don't render anything
    if (typeof this.state.data === "undefined" || this.state.data.length == 0) {
      return <span></span>;
    }
    var listElements = this.state.data.map(function(lofi) {
      // Set the status for the map
      setStatus(lofi.location_number, lofi.status);
      // Set the CSS Bootstrap class based on the status of the lofi
      var statusClass = "";
      if (lofi.status == "unknown") {
        statusClass = "warning";
      } else if (lofi.status == "open") {
        statusClass = "danger";
      } else if (lofi.status == "closed") {
        statusClass = "success";
      }
      return (
          <tr key={lofi.node_id + 's' + lofi.switch_id} className={statusClass}>
          <td>{lofi.node_id}</td>
          <td>{lofi.location}</td>
          <td>{lofi.status}</td>
        </tr>
      );
    });
    return (
      <Table striped bordered condensed className="statusList">
        <thead>
          <tr>
            <th>LoFi #</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {listElements}
        </tbody>
      </Table>
    );
  }
});


// Putting together our component and telling React to render it as DOM.
// We are saying to React, "Render RawData inside the element with ID 'example'."
ReactDOM.render(
  <StatusList />,
  document.getElementById('example')
);

