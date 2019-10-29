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

#Example of variables that must be set in setenv.sh. CAREFUL: DO NOT commit setenv.sh!!!
#KEYCLOAK_URL=https://sso-dev.pathfinder.gov.bc.ca/auth
#KEYCLOAK_CLIENT_ID=remote-admin-client
#KEYCLOAK_CLIENT_SECRET=
#REALM_NAME=

source "setenv-$1.sh"

ENV_NAME="$1"

export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=remote-admin-client' | jq -r '.access_token')

mkdir -p output

echo "Start fetching users in realm $REALM_NAME"
curl -sX GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?max=1000" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"  -o "output/users.${ENV_NAME}-${REALM_NAME}.json"
# checking in empty email user:
# jq -r '.[] | select(.email == "" or .email == null) | [.username, .email]' "output/users.${ENV_NAME}-${REALM_NAME}.json" > "output/users.${ENV_NAME}-${REALM_NAME}.empty-email.txt"
