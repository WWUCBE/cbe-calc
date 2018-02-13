#!/bin/bash

cd ..
python -m SimpleHTTPServer 8000 &
xdg-open http://localhost:8000/testscripts/automated-testing.html
