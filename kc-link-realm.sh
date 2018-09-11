#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -e
if [ "$1" == "" ] || [ "$2" == "" ] || [ "$3" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 tes|dev|prod '<from this realm>' '<to this realm>'"
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



SOURCE_REALM="$2"
TARGET_REALM="$3"
IDP_ID="$4"


echo "TARGET_REALM:${TARGET_REALM}"
echo "IDP_ID:${IDP_ID}"

#exit 1

export KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=admin-cli' | jq -r '.access_token')


mkdir -p cache
curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"  -o cache/realm.$SOURCE_REALM.json
curl -sX GET "$KEYCLOAK_URL/admin/realms/$TARGET_REALM" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"  -o cache/realm.$TARGET_REALM.json
curl -sX GET "$KEYCLOAK_URL/realms/$SOURCE_REALM/.well-known/openid-configuration" -o cache/realm.$SOURCE_REALM.oidc.well-known.json
curl -sX GET "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -o cache/realm.$TARGET_REALM.idp.json

#exit 1


IDP_NAME="$(jq -rj '.displayName' "cache/realm.${SOURCE_REALM}.json")"
CLIENT_ID="$KEYCLOAK_URL/realms/$TARGET_REALM"

curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients?clientId=${CLIENT_ID}" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -o cache/client.previous.json
CLIENT_KC_ID=$(jq -r '.[].id' cache/client.previous.json)

echo 'Deleting Client'
curl -sX DELETE "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients/${CLIENT_KC_ID}" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"

echo 'Creating Client'
cat templates/$SOURCE_REALM/client.oidc.broker.json | sed -e "s|#{CLIENT_ID}|${CLIENT_ID}|g" | sed -e "s|#{REDIRECT_URI}|$KEYCLOAK_URL/realms/$TARGET_REALM/broker/$IDP_ID/endpoint*|g" | curl -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients"

echo 'Retrieving Client'
curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients?clientId=${CLIENT_ID}" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -o cache/client.current.json
CLIENT_KC_ID=$(jq -r '.[].id' cache/client.current.json)

echo 'Retrieving Client Secret'
CLIENT_SECRET=$(curl -sX GET "$KEYCLOAK_URL/admin/realms/$SOURCE_REALM/clients/${CLIENT_KC_ID}/client-secret" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" | jq -r '.value')

#set -x
echo "Deleting IdP '$IDP_ID' from '$TARGET_REALM'"
#Avoid orphan mappers
jq -j "select(.identityProviderMappers) | .identityProviderMappers[] | select(.identityProviderAlias == \"${IDP_ID}\") | .id | tostring + \"\u0000\"" cache/realm.$TARGET_REALM.json | xargs -0 -n1 -I '{}' curl -sX DELETE -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances/$IDP_ID/mappers/{}"
curl -sX DELETE "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances/$IDP_ID" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN"
#set +x

echo 'Creating IdP'
cat templates/$SOURCE_REALM/idp.keycloak-oidc.json | sed -e "s|#{KEYCLOAK_URL}|${KEYCLOAK_URL}|g"| sed -e "s|#{SOURCE_REALM}|${SOURCE_REALM}|g" | sed -e "s|#{ALIAS}|${IDP_ID}|g"  | sed -e "s|#{DISPLAY_NAME}|${IDP_NAME}|g" | sed -e "s|#{CLIENT_ID}|${CLIENT_ID}|g"| sed -e "s|#{CLIENT_SECRET}|${CLIENT_SECRET}|g" | curl -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances"

echo 'Adding IdP Mappers'
#set -x
find templates/$SOURCE_REALM/idp-mappers -type f | while read mapper; do
    sed -e "s|#{IDP_ALIAS}|${IDP_ID}|g" "${mapper}" | curl -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/admin/realms/$TARGET_REALM/identity-provider/instances/$IDP_ID/mappers"
done
