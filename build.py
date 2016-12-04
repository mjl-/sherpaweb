#!/usr/bin/env python
# coding=utf-8

import sys, md5, re

def makehash(path):
	return md5.md5(open(path, 'rb').read()).hexdigest()[:12]

def revrepl(contents, dest):
	l = re.split('\\s(href|src)="([^"]+)\\?v=([a-zA-Z0-9]+)"', contents)
	r = ''
	while l:
		r += l.pop(0)
		if not l:
			break
		r += ' '+l.pop(0)+'="'
		path = l.pop(0)
		v = l.pop(0)
		v = makehash('%s/%s' % (dest, path))
		if v:
			path += '?v=%s' % v
		r += path
		r += '"'
	return r

def usage():
	print >>sys.stderr, 'usage: ./build.py version'
	sys.exit(1)

def main(prog, *args):
	if len(args) != 1:
		usage()

	html = open('index.html', 'rb').read()
	html = revrepl(html, 'assets')
	html = html.replace('VERSION', args[0])
	open('assets/index.html', 'wb').write(html)

if __name__ == '__main__':
	main(*sys.argv)
