#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -Eeuo pipefail
#set -x

if [ "$1" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 tes|dev|prod"
    echo '$0 test -sX GET https://sso-test.pathfinder.gov.bc.ca/auth/admin/realms'
    echo '$0 test -sX GET https://sso-test.pathfinder.gov.bc.ca/auth/admin/realms/tfrs/users'
    exit 1
fi

source "setenv-$1.sh"
shift 1


#exit 1


export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d "client_id=${KEYCLOAK_CLIENT_ID}" | jq -r '.access_token')

#echo "KEYCLOAK_URL=$KEYCLOAK_URL/admin/realms"
#echo "KEYCLOAK_ACCESS_TOKEN=$KEYCLOAK_ACCESS_TOKEN"
exec curl -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$@"

