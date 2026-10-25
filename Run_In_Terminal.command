#!/bin/bash
cd "$(dirname "$0")"
echo "=========================================================="
echo " Starting Dijkstra Traffic Shortest Path Finder...        "
echo "=========================================================="

# Check if gcc is available
if which gcc >/dev/null 2>&1 && gcc dijkstra.c -o dijkstra 2>/dev/null; then
    ./dijkstra
else
    # Fallback to python3 runner (zero installation needed)
    /opt/anaconda3/bin/python3 terminal_runner.py 2>/dev/null || python3 terminal_runner.py
fi
