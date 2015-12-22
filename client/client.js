// Browserify command to build client.js:
//     browserify -t [ babelify --presets [ react ] ] client.js -o bundle.js
var server    = 'localhost',
    port      = '8080',
    WebSocket = require('ws'),
    ws        = new WebSocket('ws://' + server + ':' + port),
    React     = require('react'),
    ReactDOM  = require('react-dom'),
    Table     = require('react-bootstrap').Table,
    ee        = require('event-emitter'),
    emitter   = ee({}), listener;


var test = "";
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

// Our one and only React component. It handles spitting out the raw message
// data to the user.
var RawData = React.createClass({
  // This initial empty state is necessary. Without declaring som initial state
  // for data, the render function would fail.
  getInitialState: function () {
    return {data: []};
  },
  // This is called when the component is created for the first time. Here we
  // declare a 'new-message' event handler. Whenever this function intercepts
  // a 'new-message' event, it calls 'this.handleNewMessage'
  componentDidMount: function() {
    emitter.on('new-message', this.handleNewMessage);
  },
  // Here we set the state variable 'this.state.data' to contain 'message.data'.
  // If we wanted any of the message metadata, we could use that too.
  // When the state changes, React will re-render this component.
  handleNewMessage: function (message) {
    this.setState({data: message.data});
  },
  // This is called once when the component is removed. We turn off the event
  // handler since we don't want the event system to try and invoke
  // 'this.handleNewMessage' (since this component won't exist anymore).
  componentWillUnmount: function() {
    emitter.off('new-message', this.handleNewMessage);
  },
  // This is how React renders the component. In this case, the raw data is
  // rendered inside of <pre> tags. This is using the JSX syntax.
  render: function() {
    return <pre>{this.state.data}</pre>;
  }
});

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
      // Set the CSS Bootstrap class based on the status of the lofi
      var statusClass = "";
      if (lofi.status == "unknown") {
        statusClass = "warning";
        // Makes sure that the should_be property exists in the JSON and that the status isn't an
        // allowed value.
      } else if (lofi.hasOwnProperty("should_be") && lofi.should_be.indexOf(lofi.status) === -1) {
        statusClass = "danger";
      }
      return (
          <tr key={lofi.lofi_number} className={statusClass}>
          <td>{lofi.lofi_number}</td>
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

