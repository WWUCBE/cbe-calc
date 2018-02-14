#!/bin/bash

# all the files we want in the zip file
list="./icon.png\
    ./index.html\
    ./resources/Western-logo-CBE.jpg\
    ./resources/treeHeader.jpg\
    ./resources/help.svg\
    ./manifest.json\
    ./css/css-toggle-switch-master/dist/toggle-switch.css\
    ./css/print.css\
    ./css/Fonts/AvenirLTStd-Light.otf\
    ./css/Fonts/AvenirLTStd-LightOblique.otf\
    ./css/Fonts/AvenirLTStd-Oblique.otf\
    ./css/Fonts/AvenirLTStd-Roman.otf\
    ./css/xeditable.css\
    ./css/style.css\
    ./js/xeditable.js\
    ./js/angularApp.js\
    ./js/content.js\
    ./js/menu.js\
    ./js/popup.js\
    ./js/calculator-backend.js"


zip CBECalculator.zip $list


