#!/bin/sh

if [ $# -lt 1 ]; then
  echo "Usage:"
  echo "./init.sh APPNAME"
  exit 1
fi

set -x
cd `dirname $0`/../..
APPNAME=$1

for file in "package.json\
  manifest.yml\
  bower.json\
  src/client/index.html\
  src/client/js/app.js\
  src/client/js/route.js\
  src/client/js/controllers/hello-ctrl.js\
  test/unit/client/hello-ctrl-spec.js"
do 
  sed -i "" "s/myapp/$APPNAME/g" $file
done

set +x
