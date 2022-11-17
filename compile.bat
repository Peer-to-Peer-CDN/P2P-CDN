cd mediator
tsc --project tsconfig.json --outDir out
echo "test2"
cd ..
echo ".."
cd peer
echo "peer"
tsc --project tsconfig.json --outDir out/peer
browserify out/peer/peer/src/index.js --s cdn -p esmify > cdn.js
Remove-Item out -Recurse -Force -Confirm:$false
cd ..
