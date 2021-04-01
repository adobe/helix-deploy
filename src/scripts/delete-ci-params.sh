#!/bin/bash
set -eo pipefail

while true; do
  aws --profile adobe ssm describe-parameters --max-items 10 --parameter-filters "Key=Name,Option=Contains,Values=/pages_ci" > params.json
  echo "fetched $(cat params.json | jq '.Parameters | length') params. deleting..."
  if jq -e '.Parameters| length == 0' params.json > /dev/null; then
    echo 'done'
    exit
  fi
  jq .Parameters[].Name params.json | xargs aws --profile adobe ssm delete-parameters --names
done
