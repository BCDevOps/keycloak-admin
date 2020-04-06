#!/bin/bash

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

# To use this script in CI Pipeline:
# 1. make sure you have a secret in openshift for the keycloak admin client account
# 2. setenv file with all the variables and call the script in pipeline

set -Eeuo pipefail
# set -x

if [ "$1" == "" ]
then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 dev|test|prod"
    echo ''
    echo "e.g.:$0 'dev'"
    echo "Creates a client"
    echo ''
    exit 1
elif [ "$1" == "test" -o "$1" ==  "prod"]
then
    echo "Skipping in test or prod environemnt"
    exit 0
fi

#Example of variables that must be set in setenv.sh:
source "setenv-$1.sh"
# Should inlcude the following variables:
#   KEYCLOAK_URL
#   REALM_NAME
#   CLIENT_NAME
#   KEYCLOAK_CLIENT_ID
#   KEYCLOAK_CLIENT_SECRET

# oc get secret for sso service account:
# OC_NAMESPACE is your project namespace on openshift, OC_SECRET_NAME is the name of secret containing:
#     1. KEYCLOAK_ADMIN_CLIENT_ID
#     2. KEYCLOAK_ADMIN_CLIENT_SECRET
# KEYCLOAK_CLIENT_ID=$(oc -n $OC_NAMESPACE get secret/$OC_SECRET_NAME --template={{.data.KEYCLOAK_CLIENT_ID}} | base64 --decode)
# KEYCLOAK_CLIENT_SECRET=$(oc -n $OC_NAMESPACE get secret/$OC_SECRET_NAME --template={{.data.KEYCLOAK_CLIENT_SECRET}} | base64 --decode)


#install jq if needed:
JQ=/tmp/jq
curl https://stedolan.github.io/jq/download/linux64/jq > $JQ && chmod +x $JQ
ls -la $JQ

# get auth token:
KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/auth/realms/$REALM_NAME/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' -d 'client_id=admin-cli'| $JQ -r '.access_token')

 _curl(){
     curl -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$@"
 }

# check if client exists:
CLIENT_ID=$(_curl -sX GET "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json" | $JQ -r --arg CLIENT "$CLIENT_NAME" '.[] | select(.clientId==$CLIENT) | .id')

# Create client if not yet exists:
if [ "${CLIENT_ID}" == "" ]; then
    echo "Creating $CLIENT_NAME client..."
    cat templates/new-client.json | sed -e "s|#{CLIENT_NAME}|${CLIENT_NAME}|g" | sed -e "s|#{REDIRECT_URI}|${REDIRECT_URI}|g" | _curl -sX POST -d '@-' -H 'Content-Type: application/json' "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients"
fi

# return the client-id:
echo "${CLIENT_ID}"
