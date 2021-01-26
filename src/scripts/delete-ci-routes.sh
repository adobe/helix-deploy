#!/bin/bash
set -eo pipefail

aws apigatewayv2 get-routes --api-id lqmig3v5eb --profile adobe --region us-east-1 > routes.json
echo "$(cat routes.json | jq '.Items | length') routes. deleting..."
cat routes.json \
  | jq  '.Items[] | select(.RouteKey|test("/ci|pages_ci")) | .RouteId' \
  | xargs -I@ aws --region us-east-1 --profile adobe apigatewayv2 delete-route --api-id lqmig3v5eb --route-id @

aws apigatewayv2 get-routes --api-id lqmig3v5eb --profile adobe --region us-east-1 > routes.json
echo "done. $(cat routes.json | jq '.Items | length') routes."
