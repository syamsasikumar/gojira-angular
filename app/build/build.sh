rm -rf ../dist/*
r.js -o build/app.build.js
cd ../dist
mv scripts/libs/requirejs/require.js require.js
rm -rf scripts/libs/* build scripts/views scripts/models scripts/collections build.txt
mkdir scripts/libs/requirejs && mv require.js scripts/libs/requirejs/require.js
mv css/gojira.css gojira.css && rm -rf css/* && mv gojira.css css/gojira.css