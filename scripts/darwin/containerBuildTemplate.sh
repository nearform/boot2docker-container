#!/bin/bash
docker ps -a --no-trunc | grep 'Exit' | awk '{print $1}' |  xargs -I {} docker rm {}
docker images -notrunc| grep none | awk '{print $2}' | xargs -I {} docker rmi {}
docker build -t __NAMESPACE__/__TARGETNAME__-__BUILDNUMBER__ .


