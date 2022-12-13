'use strict';

const fs = require('fs');

const scriptArgs = process.argv.slice(2);

let rawdata = fs.readFileSync('scripts/config/taskDefinition.json'); // TODO: Localize?!
let taskDefinition = JSON.parse(rawdata);

taskDefinition.containerDefinitions[0].image = `956918984222.dkr.ecr.us-east-2.amazonaws.com/emojiphone:${scriptArgs[0]}`

fs.writeFileSync(`scripts/config/taskDefinition${scriptArgs[0]}.json`, JSON.stringify(taskDefinition))