#!/bin/bash

cd ..
python -m SimpleHTTPServer &
xdg-open http://localhost:8000/testscripts/automated-testing.html