#!/bin/bash
set -e

(rm assets.zip; cd assets && zip -r0 ../assets.zip .)
VERSION=$(hg log -r . -T "{latesttag}{sub('^-1-.*', '', '-{latesttagdistance}-m{node|short}')}" | sed 's/^v//')
./build.py $VERSION
sherpadoc Example >assets/example.json
VERSION=$VERSION GOOS=linux GOARCH=amd64 GOVERSION=$(go version | cut -f3 -d' ') sh -c 'go build -ldflags "-X main.version=${VERSION}" && cat assets.zip >>sherpaweb && mv sherpaweb local/sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION && gzip -9 local/sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION'
VERSION=$VERSION GOOS=darwin GOARCH=amd64 GOVERSION=$(go version | cut -f3 -d' ') sh -c 'go build -ldflags "-X main.version=${VERSION}" && cat assets.zip >>sherpaweb && mv sherpaweb local/sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION && gzip -9 local/sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION'
VERSION=$VERSION GOOS=windows GOARCH=amd64 GOVERSION=$(go version | cut -f3 -d' ') sh -c 'go build -ldflags "-X main.version=${VERSION}" && cat assets.zip >>sherpaweb.exe && mv sherpaweb.exe local/sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION.exe && (cd local && zip -9 sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION.zip sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION.exe && rm sherpaweb-$VERSION-$GOOS-$GOARCH-$GOVERSION.exe)'

