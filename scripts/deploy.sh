echo "docker build -t emojiphone ."
HASH=$(git rev-parse --short HEAD | tr -d '\n' )
echo "docker tag emojiphone:latest 956918984222.dkr.ecr.us-east-2.amazonaws.com/emojiphone:$HASH"
echo "docker push 956918984222.dkr.ecr.us-east-2.amazonaws.com/emojiphone:$HASH"

# CREATE_TASK_COMMAND=$(node scripts/editConfig.js $HASH)
# echo "$CREATE_TASK_COMMAND"
# export TASK_VERSION=$($CREATE_TASK_COMMAND | jq --raw-output '.taskDefinition.revision')
# aws ecs register-task-definition --family emojiphoneec --container-definitions "[{\"name\":\"emojiphone\",\"image\":\"956918984222.dkr.ecr.us-east-2.amazonaws.com/emojiphone:e60b5d4\",\"cpu\":0,\"memory\":498,\"links\":[],\"portMappings\":[{\"containerPort\":3000,\"hostPort\":80,\"protocol\":\"tcp\"}],\"essential\":true,\"entryPoint\":[],\"command\":[],\"environment\":[{\"name\":\"NODE_ENV\",\"value\":\"staging\"}],\"environmentFiles\":[],\"mountPoints\":[],\"volumesFrom\":[],\"secrets\":[],\"dnsServers\":[],\"dnsSearchDomains\":[],\"extraHosts\":[],\"dockerSecurityOptions\":[],\"dockerLabels\":{},\"ulimits\":[],\"systemControls\":[]}]" --execution-role-arn arn:aws:iam::956918984222:role/ecsTaskExecutionRole --requires-compatibilities EC2 --tags "[{\"key\":\"ecs:taskDefinition:createdFrom\",\"value\":\"ecs-console-v2\"}]"
echo 'aws ecs register-task-definition --family emojiphoneec --container-definitions "config/taskDefinition$HASH.json"  --execution-role-arn arn:aws:iam::956918984222:role/ecsTaskExecutionRole --requires-compatibilities EC2 --tags "[{\"key\":\"ecs:taskDefinition:createdFrom\",\"value\":\"ecs-console-v2\"}]"'
aws ecs register-task-definition --family emojiphoneec --container-definitions "config/taskDefinition$HASH.json"  --execution-role-arn arn:aws:iam::956918984222:role/ecsTaskExecutionRole --requires-compatibilities EC2 --tags "[{\"key\":\"ecs:taskDefinition:createdFrom\",\"value\":\"ecs-console-v2\"}]"
echo "aws ecs update-service --cluster emojiphonessh --service mojiphone-lb --task-definition emojiphoneec:$TASK_VERSION"