#!/bin/bash
set -eo pipefail

if [ -z "${HLX_AWS_ACCOUNT_ID}" ]; then
  echo "HLX_AWS_ACCOUNT_ID required"
  exit 1
fi
if [ -z "${HLX_AWS_API_ID}" ]; then
  echo "HLX_AWS_API_ID required"
  exit 1
fi
if [ -z "${HLX_AWS_REGION}" ]; then
  echo "HLX_AWS_REGION required"
  exit 1
fi

function_name="helix-deploy-proxy"
runtime="nodejs22.x"
role="arn:aws:iam::${HLX_AWS_ACCOUNT_ID}:role/helix-lambda-role"

createZip() {
  temp_dir=$(mktemp -d)
  cp $(dirname $0)/../template/aws-proxy-code.js ${temp_dir}/index.mjs
  cd $temp_dir
  zip -q code.zip index.mjs
  cd - > /dev/null
  echo $temp_dir
}

createFunction() {
  aws lambda create-function \
    --function-name "arn:aws:lambda:${HLX_AWS_REGION}:${HLX_AWS_ACCOUNT_ID}:function:${function_name}" \
    --runtime "${runtime}" \
    --handler "index.handler" \
    --role "${role}" \
    --description "Helix Deploy Proxy" \
    --timeout 60 \
    --package-type Zip \
    --zip-file "fileb://$1/code.zip"
}

createIntegration() {
  json=$(aws apigatewayv2 create-integration \
    --api-id ${HLX_AWS_API_ID} \
    --integration-type "AWS_PROXY" \
    --integration-uri "arn:aws:lambda:${HLX_AWS_REGION}:${HLX_AWS_ACCOUNT_ID}:function:helix-deploy-proxy" \
    --payload-format-version "2.0")
  echo $(echo $json | jq -r '.IntegrationId')
}

createInvokePermissions() {
  route=$1

  aws lambda add-permission \
    --statement-id run-${route}-1 \
    --action lambda:InvokeFunction \
    --function-name "arn:aws:lambda:${HLX_AWS_REGION}:${HLX_AWS_ACCOUNT_ID}:function:helix-deploy-proxy" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${HLX_AWS_REGION}:${HLX_AWS_ACCOUNT_ID}:${HLX_AWS_API_ID}/*/*/${route}/{action}/{version}"

  aws lambda add-permission \
    --statement-id run-${route}-2 \
    --action lambda:InvokeFunction \
    --function-name "arn:aws:lambda:${HLX_AWS_REGION}:${HLX_AWS_ACCOUNT_ID}:function:helix-deploy-proxy" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${HLX_AWS_REGION}:${HLX_AWS_ACCOUNT_ID}:${HLX_AWS_API_ID}/*/*/${route}/{action}/{version}/{path+}"
}

createRoutes() {
  route=$1
  integration=$2
  authorizer=$3

  if [ -z "${authorizer}" ]; then
    aws apigatewayv2 create-route \
      --api-id ${HLX_AWS_API_ID} \
      --no-api-key-required \
      --route-key "ANY /${route}/{action}/{version}" \
      --target "integrations/${integration}"
    aws apigatewayv2 create-route \
      --api-id ${HLX_AWS_API_ID} \
      --no-api-key-required \
      --route-key "ANY /${route}/{action}/{version}/{path+}" \
      --target "integrations/${integration}"
  else
    aws apigatewayv2 create-route \
      --api-id ${HLX_AWS_API_ID} \
      --no-api-key-required \
      --route-key "ANY /${route}/{action}/{version}" \
      --target "integrations/${integration}" \
      --authorization-type "CUSTOM" \
      --authorizer-id "${authorizer}"
    aws apigatewayv2 create-route \
      --api-id ${HLX_AWS_API_ID} \
      --no-api-key-required \
      --route-key "ANY /${route}/{action}/{version}/{path+}" \
      --target "integrations/${integration}" \
      --authorization-type "CUSTOM" \
      --authorizer-id "${authorizer}"
  fi
}

getAuthorizerId() {
  authorizer=$(aws apigatewayv2 get-authorizers \
    --api-id "${HLX_AWS_API_ID}" | jq -r '.Items[] | select(.Name=="helix-token-authorizer_v2") | .AuthorizerId')
  echo $authorizer
}

#
# Main
#

temp_dir=$(createZip)
trap "rm -rf $temp_dir" 0 2 3 15
createFunction $temp_dir

integration=$(createIntegration)
authorizer=$(getAuthorizerId)

createRoutes helix-services $integration
if [ ! -z "${authorizer}" ]; then
  createRoutes helix3 $integration $authorizer
fi

createInvokePermissions helix-services
if [ ! -z "${authorizer}" ]; then
  createInvokePermissions helix3
fi
