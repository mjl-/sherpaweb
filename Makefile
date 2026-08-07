run: backend frontend
	./sherpaweb

backend:
	CGO_ENABLED=0 go build
	CGO_ENABLED=0 go vet
	CGO_ENABLED=0 go run vendor/github.com/mjl-/sherpadoc/cmd/sherpadoc/*.go Example >embed/example.json

frontend:
	-mkdir -p work/esgen work/js embed/web/1 2>/dev/null
	./node_modules/.bin/tsc | sed -E 's/^([^\(]+)\(([0-9]+),([0-9]+)\):/\1:\2:\3: /'
	./node_modules/.bin/esbuild work/esgen/main.js --bundle --outfile=embed/web/1/sherpaweb.js
	CGO_ENABLED=0 go run build/build.go

fmt:
	go fmt ./...

test:
	CGO_ENABLED=0 go test -cover

coverage:
	CGO_ENABLED=0 go test -coverprofile=coverage.out -test.outputdir . --
	go tool cover -html=coverage.out

clean:
	-CGO_ENABLED=0 go clean
	-rm -r sherpaweb work 2>/dev/null

frontenddeps:
	-mkdir -p node_modules/.bin
	npm install --ignore-scripts --save-exact @mjl-/tuit@0.0.4
	npm install --ignore-scripts --save-exact --save-dev esbuild@0.28.1 typescript@7.0.2
