#!/bin/bash
set -eo pipefail

aws --profile adobe apigatewayv2 get-integrations --api-id lqmig3v5eb > ints.json
echo "$(cat ints.json | jq '.Items | length') integrations. deleting..."

cat ints.json \
  | jq  '.Items[] | select(.IntegrationUri|test(":ci")) | .IntegrationId' \
  | xargs -I@ aws --region us-east-1 --profile adobe apigatewayv2 delete-integration --api-id lqmig3v5eb --integration-id @

aws --profile adobe apigatewayv2 get-integrations --api-id lqmig3v5eb > ints.json
echo "$(cat ints.json | jq '.Items | length') integrations remaining."
