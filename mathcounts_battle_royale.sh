#!/bin/sh
echo -n "Connect to the same WiFi as me and go to "
ip=$(hostname -I)
ip2=${ip%?}
echo "$ip2:3000\nStarting server..."
node index.js

