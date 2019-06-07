#!/bin/sh
echo -n "Connect to the same WiFi as me and go to "
ip=$(hostname -I)
ip2=${ip%?}
ip3=`echo "$ip2" | awk '{print $1;}'`
echo "$ip3:3000\nStarting server..."
node index.js

