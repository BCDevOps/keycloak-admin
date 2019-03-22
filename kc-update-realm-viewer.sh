#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource


set -Eeuo pipefail
#set -x

if [ "$1" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 dev|test|prod"
    exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "${SCRIPT_DIR}/setenv-$1.sh"
GROUP_ID='null'

while [ "${GROUP_ID}" == "null" ]; do
    GROUP_ID=$(./kc-curl.sh $1 -s -G '--data-urlencode' 'search=Realm Viewer' "$KEYCLOAK_URL/admin/realms/master/groups" | jq -rMc '[.[] | select(.name == "Realm Viewer")][0].id')
    if [ "${GROUP_ID}" == "null" ]; then
        echo "Creating 'Realm Viewer' group"
        ./kc-curl.sh $1 -X POST -sS -H 'Content-Type: application/json' -d '{"name": "Realm Viewer"}' "$KEYCLOAK_URL/admin/realms/master/groups"
    fi
done

./kc-import-user.sh $1 idir master idir nmailhot

./kc-curl.sh $1 -sS "$KEYCLOAK_URL/admin/realms/master/clients" | jq -rMc '.[] | select ( .clientId | endswith("-realm")) | .id' | while read id; do
    # List available roles for the client, filtering the ones we want, and then apply those to the group
    ./kc-curl.sh $1 -sS "$KEYCLOAK_URL/admin/realms/master/groups/${GROUP_ID}/role-mappings/clients/${id}/available" | jq '[.[] | select(.name == "view-realm" or .name == "view-clients" or .name == "view-users")]' | ./kc-curl.sh $1 -X POST -sS -H 'Content-Type: application/json' -d '@-' "$KEYCLOAK_URL/admin/realms/master/groups/${GROUP_ID}/role-mappings/clients/${id}"
done
