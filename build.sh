#!/bin/sh

for f in $(find src)
do
    echo $f
    # todo file by file map to dist dir
done

bun run build

cp src/index.html dist/
cp src/favicon.png dist/

python -m http.server -d dist/
