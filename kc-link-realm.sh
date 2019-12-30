#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -Eeuo pipefail
#set -x

if [ "$1" == "" ] || [ "$2" == "" ] || [ "$3" == "" ] || [ "$4" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 tes|dev|prod '<from this realm>' '<to this realm>' '<idp name>'"
    echo ''
    echo "e.g.:$0 'idir' 'tfrs' idir"
    echo "Creates a Identity Provider in the 'master' realm linked to the 'idir' realm"
    echo ''
    exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "${SCRIPT_DIR}/setenv-$1.sh"

TEMPLATES_DIR="${SCRIPT_DIR}/templates"
CACHE_DIR="${SCRIPT_DIR}/cache"

#Example of variables that must be set in setenv.sh. CAREFUL: DO NOT commit setenv.sh!!!
#KEYCLOAK_URL=https://sso-dev.pathfinder.gov.bc.ca/auth
#KEYCLOAK_CLIENT_ID=remote-admin-client
#KEYCLOAK_CLIENT_SECRET=

SOURCE_REALM="$2"
TARGET_REALM="$3"
IDP_ID="$4"


#echo "TARGET_REALM:${TARGET_REALM}"
#echo "IDP_ID:${IDP_ID}"

#exit 1

export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d "client_id=$KEYCLOAK_CLIENT_ID" | jq -r '.access_token')


mkdir -p cache
curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"  -o $CACHE_DIR/realm.$SOURCE_REALM.json
curl -sX GET "$KEYCLOAK_URL/admin/realms/$TARGET_REALM" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"  -o $CACHE_DIR/realm.$TARGET_REALM.json
curl -sX GET "$KEYCLOAK_URL/realms/$SOURCE_REALM/.well-known/openid-configuration" -o $CACHE_DIR/realm.$SOURCE_REALM.oidc.well-known.json
curl -sX GET "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -o $CACHE_DIR/realm.$TARGET_REALM.idp.json

#exit 1
#set -x
IDP_NAME="$(jq -rj '.displayName' "$CACHE_DIR/realm.${SOURCE_REALM}.json")"
CLIENT_ID="$KEYCLOAK_URL/realms/$TARGET_REALM"

curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients?clientId=${CLIENT_ID}" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -o $CACHE_DIR/client.previous.json


if [ "$(jq -r '. | length' $CACHE_DIR/client.previous.json)" != "0" ]; then
    CLIENT_KC_ID=$(jq -r '.[].id' $CACHE_DIR/client.previous.json)
    echo "Deleting '${CLIENT_ID}' (${CLIENT_KC_ID}) client from '${SOURCE_REALM}'"
    curl -sX DELETE "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients/${CLIENT_KC_ID}" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"
fi

echo "Creating client '${CLIENT_ID}' in '${SOURCE_REALM}'"
cat $TEMPLATES_DIR/$SOURCE_REALM/client.oidc.broker.json | sed -e "s|#{CLIENT_ID}|${CLIENT_ID}|g" | sed -e "s|#{REDIRECT_URI}|$KEYCLOAK_URL/realms/$TARGET_REALM/broker/$IDP_ID/endpoint*|g" > $CACHE_DIR/curl-body.txt
curl -sSX POST -d "@$CACHE_DIR/curl-body.txt" -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients"

echo "Retrieving client '${CLIENT_ID}' from '${SOURCE_REALM}'"
curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients?clientId=${CLIENT_ID}" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -o $CACHE_DIR/client.current.json
CLIENT_KC_ID=$(jq -r '.[].id' $CACHE_DIR/client.current.json)

echo "Retrieving client secret '${CLIENT_ID}' (${CLIENT_KC_ID}) from '${SOURCE_REALM}''"
CLIENT_SECRET=$(curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients/${CLIENT_KC_ID}/client-secret" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" | jq -r '.value')

#set -x
echo "Deleting IdP '$IDP_ID' from '$TARGET_REALM'"
#Avoid orphan mappers
jq -j "select(.identityProviderMappers) | .identityProviderMappers[] | select(.identityProviderAlias == \"${IDP_ID}\") | .id | tostring + \"\u0000\"" $CACHE_DIR/realm.$TARGET_REALM.json | xargs -0 -n1 -I '{}' curl -sX DELETE -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances/$IDP_ID/mappers/{}"
curl -sX DELETE "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances/$IDP_ID" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"
#set +x

echo "Creating '${IDP_ID}' IdP in '${TARGET_REALM}'"
cat $TEMPLATES_DIR/$SOURCE_REALM/idp.keycloak-oidc.json | sed -e "s|#{KEYCLOAK_URL}|${KEYCLOAK_URL}|g"| sed -e "s|#{SOURCE_REALM}|${SOURCE_REALM}|g" | sed -e "s|#{ALIAS}|${IDP_ID}|g"  | sed -e "s|#{DISPLAY_NAME}|${IDP_NAME}|g" | sed -e "s|#{CLIENT_ID}|${CLIENT_ID}|g"| sed -e "s|#{CLIENT_SECRET}|${CLIENT_SECRET}|g" | curl -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances"

#echo 'Adding IdP Mappers'
#set -x
find $TEMPLATES_DIR/$SOURCE_REALM/idp-mappers -type f | while read mapper; do
    echo "Adding '${mapper}' IdP Mapper"
    sed -e "s|#{IDP_ALIAS}|${IDP_ID}|g" "${mapper}" | curl -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances/$IDP_ID/mappers"
done
