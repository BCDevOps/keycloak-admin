#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -Eeuo pipefail
#set -x

if [ "$1" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 tes|dev|prod <realm name> <group name> <username>[]"
    echo '$0 test -sX GET https://sso-test.pathfinder.gov.bc.ca/auth/admin/realms'
    echo '$0 test -sX GET https://sso-test.pathfinder.gov.bc.ca/auth/admin/realms/tfrs/users'
    exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "${SCRIPT_DIR}/setenv-$1.sh"
shift 1

TARGET_REALM="$1"
TARGET_GROUP="$2"
TARGET_USERNAME="$3"

TARGET_USERNAME_URL_ENCODED="${TARGET_USERNAME#*\\}"
#TARGET_USERNAME_URL_ENCODED="${TARGET_USERNAME//\\/%5C}"
TARGET_GROUP_URL_ENCODED="${TARGET_GROUP// /%20}"

TEMPLATES_DIR="${SCRIPT_DIR}/templates"
CACHE_DIR="${SCRIPT_DIR}/cache"

export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=admin-cli' | jq -r '.access_token')

curl -sSX GET -G -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/users" --data-urlencode "username=${TARGET_USERNAME_URL_ENCODED}" | jq "[.[] | select(.username == \"${TARGET_USERNAME//\\/\\\\}\")]" > $CACHE_DIR/users.target.json
curl -sSX GET -G -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/groups" --data-urlencode "search=${TARGET_GROUP}" > $CACHE_DIR/groups.target.json

TARGET_USER_ID="$(jq -r '.[0].id' $CACHE_DIR/users.target.json)"
TARGET_GROUP_ID="$(jq -r '.[0].id' $CACHE_DIR/groups.target.json)"

echo "Adding ${TARGET_USERNAME} (${TARGET_USER_ID}) to '${TARGET_GROUP}' (${TARGET_GROUP_ID})"
curl -sX PUT  -H 'Content-Type: application/x-www-form-urlencoded' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/users/${TARGET_USER_ID}/groups/${TARGET_GROUP_ID}"
