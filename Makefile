SHELL=/bin/bash -o pipefail

run: backend
	./sherpaweb

build/build: build/build.go
	(cd build && go build)

sherpadoc/sherpadoc: sherpadoc/main.go
	(cd sherpadoc && go build)

backend: build/build sherpadoc/sherpadoc
	./build/build `hg log -r . -T "{latesttag}{sub('^-0-.*', '', '-{latesttagdistance}-m{node|short}')}" | sed 's/^v//'`
	go build
	sherpadoc/sherpadoc Example >assets/example.json
	go vet

fmt:
	gofmt -w *.go

test:
	golint
	go test -cover

coverage:
	go test -coverprofile=coverage.out -test.outputdir . --
	go tool cover -html=coverage.out

release:
	-mkdir local 2>/dev/null
	-rm assets.zip 2>/dev/null
	(cd assets && zip -qr0 ../assets.zip .)
	env GOOS=darwin GOARCH=amd64 ./release.sh
	env GOOS=linux GOARCH=386 ./release.sh
	env GOOS=linux GOARCH=amd64 ./release.sh
	env GOOS=openbsd GOARCH=amd64 ./release.sh
	env GOOS=linux GOARCH=arm GOARM=6 ./release.sh
	env GOOS=linux GOARCH=arm64 ./release.sh
	env GOOS=windows GOARCH=amd64 ./release.sh

clean:
	-go clean
	-rm sherpaweb assets.zip assets/example.json sherpadoc/sherpadoc
