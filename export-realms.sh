#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -e
if [ "$1" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 test|dev|prod '<from this realm>' '<to this realm>'"
    echo ''
    echo "e.g.:$0 'idir' 'master'"
    echo "Creates a Identity Provider in the 'master' realm linked to the 'idir' realm"
    echo ''
    exit 1
fi

source "setenv-$1.sh"

#Example of variables that must be set in setenv.sh. CAREFUL: DO NOT commit setenv.sh!!!
#KEYCLOAK_URL=https://sso-dev.pathfinder.gov.bc.ca/auth
#KEYCLOAK_CLIENT_ID=remote-admin-client
#KEYCLOAK_CLIENT_SECRET=



ENV_NAME="$1"

export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=admin-cli' | jq -r '.access_token')


mkdir -p output
curl -sX GET "$KEYCLOAK_URL/admin/realms" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"  -o "output/realms.${ENV_NAME}.json"
jq -r '.[] | [.id, .identityProviders[]?.alias] | @csv' "output/realms.${ENV_NAME}.json" > "output/realms.${ENV_NAME}.txt"