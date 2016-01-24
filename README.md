# lofi-server - LoFi status server and client webpage

The server monitors a file for changes to LoFi node statuses. It also listens for client connections. It will send any changes to all connected clients and it will send a complete status report to all new clients.

The webpage is the client. It will initiate a connection to the server and listen for any changes.

## Build

### Dependencies

The following dependencies must be installed on your system.

* [Node.JS](https://nodejs.org/en/)
* [npm](https://www.npmjs.com)
* [browserify](http://browserify.org/)

All other dependencies should be taken care of by our package.json file and npm.  Do the following to pull them all in and build bundle.js.

```
npm install
```

### Client

The client is written in JSX so it first needs to be compiled into javascipt. It will be built as part of the previous step, but if changes are made it can be recomplied with:

```
npm install
```

## Serving the Client

The files in client/web/ need to be served by an http server.

## Starting the Server

The server communicates with the lof_rx program via tcp port 8085 on the localhost. The output of lofi_rx can be redirected to a port using netcat.

```
sudo lofi_rx -l | nc -l -k -p 8085
```

The server can be started using:

```
npm start
```

