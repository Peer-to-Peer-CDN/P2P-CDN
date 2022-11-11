tsc --project mediator/tsconfig.json --outDir out/mediator
cd peer
tsc --project tsconfig.json --outDir out
browserify out/peer/src/index.js --s cdn -p esmify > ../out/cdn.js
rm -rf out/
cd ..
