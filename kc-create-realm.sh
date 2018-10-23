#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -Eeuo pipefail
#set -x

if [ "$1" == "" ] || [ "$2" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 tes|dev|prod '<realm name>'"
    echo ''
    echo "e.g.:$0 'dev' 'tfrs'"
    echo "Creates a realm"
    echo ''
    exit 1
fi

source "setenv-$1.sh"


REALM_NAME="$2"

#exit 1


export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=admin-cli' | jq -r '.access_token')


 _curl(){
     curl -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$@"
 }

REALM_ID="$(_curl -sX GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME" -H "Accept: application/json" | jq -r '.id')"

if [ "${REALM_ID}" == "" ]; then
    echo "Creating '${REALM_NAME}' Realm"
    cat templates/new-realm.json | sed -e "s|#{NAME}|${REALM_NAME}|g" | _curl -sX POST -d '@-' -H 'Content-Type: application/json' "$KEYCLOAK_URL/admin/realms"
fi