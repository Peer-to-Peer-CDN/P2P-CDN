# SA code - Locher - Benz
SA code: Adrian Locher & Jason Benz

## Dependency installation
```
cd common
npm install
cd ..

cd mediator
npm install
cd ..

cd peer
npm install
cd ..
```

## Execute locally
1. Install all dependencies
2. Execute compile script
    1. Windows: `.\compile.ps1`
    2. Unix: `.\compile.sh`
3. Run mediator
    1. Option 1: Create a run config in your IDE
    2. Option 2: `node .\mediator\out\mediator\src\index.js`
4. Open `seeder_preview.html` in your browser
5. Open `leecher_preview.html` in your browser

## Execute remotely
1. Run mediator on an external web server
2. Update serverUrl and serverPort in your `seeder_preview.html`
3. Update serverUrl and serverPort in your `leecher_preview.html`
4. Open `seeder_preview.html` in your browser
5. Open `leecher_preview.html` in your browser (may on another computer)