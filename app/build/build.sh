rm -rf ../dist/*
r.js -o build/app.build.js
cd ../dist
mv scripts/libs/requirejs/require.js require.js
rm -rf scripts/libs/* build scripts/views scripts/models scripts/collections build.txt
mkdir scripts/libs/requirejs && mv require.js scripts/libs/requirejs/require.js
mv css/style.css style.css && rm -rf css/* && mv style.css css/style.css