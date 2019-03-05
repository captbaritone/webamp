#!/bin/bash
echo ""
echo "Webamp install script by Chuf"
echo ""
echo ""
echo "Make sure you have superuser privileges before starting this script."
echo ""
read -p "Press enter to continue ..."
echo ""
echo ""
echo "Begin the installation!"
echo ""
echo ""
echo "Installing git"
echo ""
sudo apt-get install git -y
echo ""
echo "Now cloning into webamp directory from Github"
echo ""
git clone https://github.com/captbaritone/webamp.git
echo ""
echo "Installing some dependencies ..."
echo ""
sudo apt-get install gcc g++ make -y
echo ""
echo "Installing curl"
echo ""
sudo apt-get install curl -y
echo ""
echo "Installing yarn"
echo ""
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn -y
echo ""
echo "Installing node js" # must be version 8.x or 10.x - 11.x maybe works as well
echo ""
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "Install some more dependencies ..."
echo ""
sudo yarn global add webpack webpack-dev-server
sudo yarn global add --save-dev webpack-dev-server@1.9.0

sudo yarn global add -D webpack-cli
sudo yarn global add acorn
sudo yarn global add ajv

sudo chmod 0777 webamp
cd webamp

echo "Make some folders and give them all permissions" # needed for puppeteer module
sudo chmod 0777 *
mkdir node_modules
mkdir node_modules/puppeteer
mkdir node_modules/puppeteer/.local-chromium


sudo chmod 0766 '/usr/lib/node_modules'   


yarn global add puppeteer


echo ""
echo "Creating package.json file"
echo ""
echo "You can leave all the fields empty. Just 'enter' through all 8 options"
echo ""
yarn init

echo ""
echo "Installing webamp, this might take a while ..."
echo ""
sudo yarn


echo ""
echo "Installation script finished! To run Webamp, go into your webamp folder and run command 'yarn start'."
echo ""
read -n 1 -s -r -p "Press any key to exit ..."
echo ""
exit
