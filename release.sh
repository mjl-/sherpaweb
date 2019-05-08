#!/bin/sh
set -e

exec env GOOS=$GOOS GOARCH=$GOARCH \
NAME=$(basename $PWD) \
GITVERSION="$(git describe --tags | sed 's/^v//')" \
GITTAG="$(git describe --exact-match --tags 2>/dev/null)" \
GITBRANCH="$(git rev-parse --abbrev-ref HEAD)" \
GITCOMMITHASH=$(git rev-parse HEAD) \
GOVERSION=$(go version | cut -f3 -d' ') \
sh -c '
	set -e
	export CGO_ENABLED=0
	SUFFIX=""
	if test $GOOS = windows; then
		SUFFIX=.exe
	fi
	DEST=local/${NAME}-${GITVERSION:-x}-${GOOS:-x}-${GOARCH:-x}-${GOVERSION:-x}-${BUILDID:-0}${SUFFIX}
	echo go build -ldflags "-X main.vcsCommitHash=${GITCOMMITHASH} -X main.vcsTag=${GITTAG} -X main.vcsBranch=${GITBRANCH} -X main.version=${GITVERSION:-x}"
	go build -ldflags "-X main.vcsCommitHash=${GITCOMMITHASH} -X main.vcsTag=${GITTAG} -X main.vcsBranch=${GITBRANCH} -X main.version=${GITVERSION:-x}"
	mv $NAME${SUFFIX} $DEST
	sh -c "cat assets.zip >>$DEST"
	echo release: $NAME $GITVERSION $GOOS $GOARCH $GOVERSION $DEST
'
