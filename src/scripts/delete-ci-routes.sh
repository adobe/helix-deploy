#!/bin/bash
set -eo pipefail

if [ -z "${HLX_AWS_API_ID}" ]; then
  echo "HLX_AWS_API_ID required"
  exit 1
fi

aws apigatewayv2 get-routes --api-id ${HLX_AWS_API_ID} --profile adobe --region us-east-1 > routes.json
echo "$(cat routes.json | jq '.Items | length') routes. deleting..."
cat routes.json \
  | jq  '.Items[] | select(.RouteKey|test("/ci|pages_ci")) | .RouteId' \
  | xargs -I@ aws --region us-east-1 --profile adobe apigatewayv2 delete-route --api-id ${HLX_AWS_API_ID} --route-id @

aws apigatewayv2 get-routes --api-id ${HLX_AWS_API_ID} --profile adobe --region us-east-1 > routes.json
echo "done. $(cat routes.json | jq '.Items | length') routes."
