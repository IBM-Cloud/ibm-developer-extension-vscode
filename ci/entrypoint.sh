#!/bin/bash
export DBUS_SESSION_BUS_ADDRESS=$(dbus-daemon --config-file=/usr/share/dbus-1/system.conf --print-address)

exec "$@"
