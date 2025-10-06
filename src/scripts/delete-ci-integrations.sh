#!/bin/bash
set -eo pipefail

if [ -z "${HLX_AWS_API_ID}" ]; then
  echo "HLX_AWS_API_ID required"
  exit 1
fi

aws --profile adobe apigatewayv2 get-integrations --api-id ${HLX_AWS_API_ID} > ints.json
echo "$(cat ints.json | jq '.Items | length') integrations. deleting..."

cat ints.json \
  | jq  '.Items[].IntegrationId' \
  | xargs -I@ aws --region us-east-1 --profile adobe apigatewayv2 delete-integration --api-id ${HLX_AWS_API_ID} --integration-id @

aws --profile adobe apigatewayv2 get-integrations --api-id ${HLX_AWS_API_ID} > ints.json
echo "$(cat ints.json | jq '.Items | length') integrations remaining."
