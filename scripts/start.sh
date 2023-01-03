#!/bin/sh
cd react-client/
echo "$NODE_ENV"
# if this is not the "staging" aka production environment,
# don't use our production variables locally
# (any run of "npm run-scripts build" usually assumes production)
if test "$NODE_ENV" != "staging"; then
    mv .env.production .env.production.bak
    mv .env.development .env

	npm run-script build

    mv .env.production.bak .env.production 
    mv .env .env.development
else
	npm run-script build
fi
cd ..
npm start