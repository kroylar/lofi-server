# lofi-server - LoFi status server and client webpage

The server monitors a file for changes to LoFi node statuses. It also listens for client connections. It will send any changes to all connected clients and it will send a complete status report to all new clients.

The webpage is the client. It will initiate a connection to the server and listen for any changes.

## Build

### Dependencies

The following two dependencies must be installed on your system.

* [Node.JS](https://nodejs.org/en/)
* [npm](https://www.npmjs.com)

All other dependencies should be taken care of by our package.json file and npm.  Do the following to pull them all in.


```
npm install
```

### Client

The client is written in JSX so it first needs to be compiled into JS. The included build script will do the job.

```
cd client
sh build.sh
```

## Install

The generated client/bundle.js and the included client/index.html and client/main.css need to be served by an http server.


## Starting the Server

```
cd server
node server.js
```
