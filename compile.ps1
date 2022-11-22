echo "Windows version of compile script."
echo "If it does not work, run in PowerShell ISE."

echo "Step 1/4: Compiling mediator..."
cd mediator
tsc --project tsconfig.json --outDir out

echo "Step 2/4: Compiling peer..."
cd ..
cd peer
tsc --project tsconfig.json --outDir out/peer

echo "Step 3/4: Generating cdn.js..."
browserify out/peer/peer/src/index.js --s cdn -p esmify > cdn.js

echo "Step 4/4: Cleaning up files..."
Remove-Item out -Recurse -Force -Confirm:$false
cd..

echo "End of script reached."