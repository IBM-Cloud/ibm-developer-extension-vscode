#!/bin/bash
if [[ ! -f /var/run/dbus/system_bus_socket ]]; then
  export DISPLAY=:99.0
  dbus-daemon --config-file /etc/dbus-1/system.d/dbus-policy.conf &
fi

exec "$@"
