docker build -t emojiphone .
HASH=$(git rev-parse --short HEAD | tr -d '\n' )
docker tag emojiphone:latest 956918984222.dkr.ecr.us-east-2.amazonaws.com/emojiphone:$HASH
docker push 956918984222.dkr.ecr.us-east-2.amazonaws.com/emojiphone:$HASH

node scripts/editConfig.js $HASH
export TASK_VERSION=$(aws ecs register-task-definition --cli-input-json file://scripts/config/taskDefinition$HASH.json | jq --raw-output '.taskDefinition.revision')
echo "TASK_VERSION $TASK_VERSION"
aws ecs update-service --cluster emojiphonessh --service mojiphone-lb --task-definition emojiphoneec:$TASK_VERSION