SHELL=/bin/bash -o pipefail
export GOFLAGS=-mod=vendor

run: backend frontend
	./sherpaweb

backend:
	-mkdir assets 2>/dev/null
	go build
	go vet
	go run vendor/golang.org/x/lint/golint/*.go
	go run vendor/github.com/mjl-/sherpadoc/cmd/sherpadoc/*.go Example >assets/example.json

frontend:
	-mkdir -p assets/web work/esgen work/js assets/web/1 2>/dev/null
	PATH=$(PATH):$(PWD)/build/node_modules/.bin NODE_PATH=$(NODE_PATH):$(PWD)/build/node_modules tsc | sed -E 's/^([^\(]+)\(([0-9]+),([0-9]+)\):/\1:\2:\3: /'
	PATH=$(PATH):$(PWD)/build/node_modules/.bin NODE_PATH=$(NODE_PATH):$(PWD)/build/node_modules rollup -c rollup.config.js
	cp work/js/sherpaweb.js assets/web/1/sherpaweb.js
	go run build/build.go
	cp index.html assets/web/

fmt:
	go fmt ./...
	build/node_modules/.bin/tsfmt -r

test:
	go run vendor/golang.org/x/lint/golint/*.go
	go test -cover

coverage:
	go test -coverprofile=coverage.out -test.outputdir . --
	go tool cover -html=coverage.out

clean:
	-go clean
	-rm -r sherpaweb assets.zip assets work 2>/dev/null

frontenddeps:
	-mkdir -p node_modules
	npm install @mjl-/tuit@0.0.4

setup:
	-mkdir -p build/node_modules/.bin
	(cd build && npm install --save-dev typescript@3.4.5 typescript-formatter@7.2.2 rollup@1.10.1 rollup-plugin-includepaths@0.2.3)
