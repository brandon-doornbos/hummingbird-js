#!/bin/bash

tmux new -d -s 'Hummingbird' -c /home/santaclausnl/NAS/STACK/Coding/Hummingbird nodemon -x './build.sh' --ignore './dist'