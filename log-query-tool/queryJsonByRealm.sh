#! /bin/bash
# VARIABLES:
# JSON_FILE_PATH <string> this is where the json files are stored

# DEPENDANCIES
# - jq
# the files aren't 100% json ready yet they are single line json formatted objects 
# but need to be comma seperated
REALM=$1

ALL_REALM_JSON=""

function filterJSONByRealm() {
  PATH_TO_FILE=$1
  REALM=$2
  ALL_REALM_JSON=$3

  QUERY="realmId=$REALM"
  REALM_JSON=$(cat $PATH_TO_FILE | jq -r --arg realmQuery "$QUERY" '[.[] | select(.message | test($realmQuery))]' )
  if [ "$REALM_JSON" != "[]" ]; then
    echo ${REALM_JSON}
  fi
}

echo "filtering JSON"
export -f filterJSONByRealm
ls $JSON_FILE_PATH | xargs -I {} bash -c 'filterJSONByRealm "$@"' _ $JSON_FILE_PATH/{} $REALM $ALL_REALM_JSON >> "$PWD/$REALM.json"

echo "filter complete"
ALL_REALM_JSON=$(cat $PWD/$REALM.json | jq -r -s 'flatten(1)')
echo "writing to $PWD/$REALM.json"
echo "$ALL_REALM_JSON" > "$PWD/$REALM.json"


