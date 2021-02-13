echo "node_modules/butterchurn/package.json"
jq -r ".version" node_modules/butterchurn/package.json
echo "packages/webamp/node_modules/butterchurn/package.json"
jq -r ".version" packages/webamp/node_modules/butterchurn/package.json