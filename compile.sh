cd mediator
tsc --project tsconfig.json --outDir out
cd ..
cd peer
tsc --project tsconfig.json --outDir out/peer
browserify out/peer/peer/src/index.js --s cdn -p esmify > cdn.js
rm -rf out
cd ..
