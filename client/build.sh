#!/bin/bash

browserify -t [ babelify --presets [ react ] ] client.js -o bundle.js
