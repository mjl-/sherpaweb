run: backend frontend
	./sherpaweb

backend:
	CGO_ENABLED=0 go build
	CGO_ENABLED=0 go vet
	CGO_ENABLED=0 go run vendor/github.com/mjl-/sherpadoc/cmd/sherpadoc/*.go Example >embed/example.json

frontend:
	-mkdir -p embed/web work/esgen work/js embed/web/1 2>/dev/null
	PATH=$(PATH):$(PWD)/build/node_modules/.bin NODE_PATH=$(NODE_PATH):$(PWD)/build/node_modules tsc | sed -E 's/^([^\(]+)\(([0-9]+),([0-9]+)\):/\1:\2:\3: /'
	PATH=$(PATH):$(PWD)/build/node_modules/.bin NODE_PATH=$(NODE_PATH):$(PWD)/build/node_modules rollup -c rollup.config.js
	cp work/js/sherpaweb.js embed/web/1/sherpaweb.js
	CGO_ENABLED=0 go run build/build.go
	cp index.html embed/web/

fmt:
	go fmt ./...
	build/node_modules/.bin/tsfmt -r

test:
	CGO_ENABLED=0 go test -cover

coverage:
	CGO_ENABLED=0 go test -coverprofile=coverage.out -test.outputdir . --
	go tool cover -html=coverage.out

clean:
	-CGO_ENABLED=0 go clean
	-rm -r sherpaweb embed/web work 2>/dev/null

frontenddeps:
	-mkdir -p node_modules
	npm install @mjl-/tuit@0.0.4

setup:
	-mkdir -p build/node_modules/.bin
	(cd build && npm install --save-dev typescript@3.4.5 typescript-formatter@7.2.2 rollup@1.10.1 rollup-plugin-includepaths@0.2.3)
