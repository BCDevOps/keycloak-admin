#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -Eeuo pipefail
#set -x

if [ "$1" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 tes|dev|prod <source realm name> <target realm> <idp> <username>"
    echo '$0 test -sX GET https://sso-test.pathfinder.gov.bc.ca/auth/admin/realms'
    echo '$0 test -sX GET https://sso-test.pathfinder.gov.bc.ca/auth/admin/realms/tfrs/users'
    exit 1
fi

source "setenv-$1.sh"
shift 1

SOURCE_REALM="$1"
TARGET_REALM="$2"
TARGET_IDP="$3"
USERNAME="$4"

#exit 1

export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=admin-cli' | jq -r '.access_token')

#echo "KEYCLOAK_URL=$KEYCLOAK_URL/admin/realms"

curl -sX GET -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${SOURCE_REALM}/users?username=${USERNAME}" > cache/users.source.json


if [ "$(jq -r '. | length' cache/users.source.json)" != "1" ]; then
    echo "More than one users found with the username '${USERNAME}' in '${SOURCE_REALM}' realm"
    exit 1
fi

SOURCE_USER_ID="$(jq -r '.[0].id' cache/users.source.json)"
SOURCE_USER_NAME="$(jq -r '.[0].username' cache/users.source.json)"

curl -sX GET -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/users?username=${USERNAME}" > cache/users.target.json

TARGET_USER_MATCH_COUNT="$(jq -r '. | length' cache/users.target.json)"

if [ "${TARGET_USER_MATCH_COUNT}" -gt "1" ]; then
    echo "More than one users found with the username '${USERNAME}' in '${TARGET_REALM}' realm"
    exit 1
fi

if [ "${TARGET_USER_MATCH_COUNT}" -eq "0" ]; then
    USERNAME_TEMPLATE='${ALIAS}\${CLAIM.preferred_username}'
    TARGET_USERNAME="$(echo "${USERNAME_TEMPLATE}" | sed "s|\${ALIAS}|${TARGET_IDP}|g"  | sed "s|\${CLAIM.preferred_username}|${USERNAME}|g")"
    TARGET_USERNAME_ESCAPTED="$(echo "${TARGET_USERNAME}" | sed "s|\\\\|\\\\\\\\|g")"
    echo "Creating user '${TARGET_USERNAME_ESCAPTED}' in '${TARGET_REALM}'"
    jq ".[0] | del(.id)| del(.createdTimestamp) | del(.attributes) | del (.access) | del(.federatedIdentities) | .username = \"${TARGET_USERNAME_ESCAPTED}\" | .federatedIdentities = []" cache/users.source.json | curl -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/users"
    curl -sX GET -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/users?username=${USERNAME}" > cache/users.target.json
fi

TARGET_USER_ID="$(jq -r '.[0].id' cache/users.target.json)"
TARGET_USER_NAME="$(jq -r '.[0].username' cache/users.target.json)"

#curl -sSvX GET -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/users/${TARGET_USER_ID}/federated-identity/${TARGET_IDP}"

echo "Linking ${SOURCE_USER_NAME} to '${TARGET_USER_NAME}' (${TARGET_USER_ID})"
echo "{\"userId\":\"${SOURCE_USER_ID}\", \"userName\":\"${SOURCE_USER_NAME}\"}" > cache/user.federated-identity.json
curl -sX POST -d '@cache/user.federated-identity.json' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/${TARGET_REALM}/users/${TARGET_USER_ID}/federated-identity/${TARGET_IDP}"

#/{realm}/users/{id}/federated-identity

#del (.id) | del (.createdTimestamp)
#.username
