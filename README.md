# aNib

aNib stands for Another Node.js IRC Bot and I am writing it  mostly for fun, but also to give myself a reason to mess around more with Node.js.

## Installation

In order to use aNib you need a valid node.js, npm, and git installation.

First, lets grab the latest files: 

    git clone https://github.com/WRMilling/aNib.git

Then, change into the aNib directory and complete the installation of dependencies:

    cd ./aNib
    npm install

## Configuration

There is only one file which needs to be configured, config.js. There is a sample config file in the root, so lets use it: 

    cp ./config.js.sample ./config.js
    vim ./config.js

Note: Replace vim in the above command for the  editor of your choice. Once config.js is fully setup and saved, we can run the bot. 

## Plugins

Plugins which perform a server wide action are automatically loaded from the plugins folder if they are valid. If they have channel actions then they need to be defined in the channelPlugins array inside the config.js file for each channel you would like plugin to be active in. 

There are currently two default pluins which are written as simple examples of the plugin format. They are helloworld.js and diceroll.js. To activate them, just include the exact spelling of their file name, excluding the extension, in the channelPlugins array: 

    channelPlugins: ['helloworld', 'diceroll']

## Running

Runnin the bot is simple, you can use any of the major starting methods provided by node.js including: 

    npm start

or

    node server.js

## License

This project is MIT licensed, the full text of which can be found here: [MIT License](https://github.com/WRMilling/aNib/blob/master/LICENSE).
