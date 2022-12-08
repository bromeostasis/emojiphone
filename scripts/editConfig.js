'use strict';

const fs = require('fs');

const myArgs = process.argv.slice(2);
// console.log('myArgs: ', myArgs);

let rawdata = fs.readFileSync('scripts/config/taskDefinition.json'); // TODO: Localize?!
let taskDefinition = JSON.parse(rawdata);

taskDefinition.containerDefinitions[0].image = `956918984222.dkr.ecr.us-east-2.amazonaws.com/emojiphone:${myArgs[0]}`

// console.log(taskDefinition);

// const {
// 	family,
// 	containerDefinitions,
// 	executionRoleArn,
// 	requiresCompatibilities,
// 	tags
// } = taskDefinition

// console.log(`aws ecs register-task-definition --family ${family} --container-definitions "${JSON.stringify(containerDefinitions).replaceAll('"', '\\"')}" --execution-role-arn ${executionRoleArn} --requires-compatibilities ${requiresCompatibilities} --tags "${JSON.stringify(tags).replaceAll('"', '\\"')}"`)

fs.writeFileSync(`scripts/config/taskDefinition${myArgs[0]}.json`, JSON.stringify(taskDefinition))