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

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "${SCRIPT_DIR}/setenv-$1.sh"

TEMPLATES_DIR="${SCRIPT_DIR}/templates"
CACHE_DIR="${SCRIPT_DIR}/cache"

REALM_NAME="$2"

#exit 1

export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=admin-cli' | jq -r '.access_token')

echo "Disabling 'Review Profile' on 'First Broker Login' in '${REALM_NAME}' Realm"
CONFIG_ID="$(curl -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -sX GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/flows/first%20broker%20login/executions" | jq -r '.[] | select (.providerId == "idp-review-profile") | .authenticationConfig')"
curl -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -sX GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/config/${CONFIG_ID}" | jq '.config."update.profile.on.first.login" = "off"' | curl -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -sX PUT -d '@-' -H 'Content-Type: application/json' "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/config/${CONFIG_ID}"

