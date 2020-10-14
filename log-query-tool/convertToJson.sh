#! /bin/bash
# VARIABLES:
# FILE_PATH <string> this is where the logs are stored
TEMP_DIR=$(mktemp -d)
echo "$TEMP_DIR TEMP DIR"

# DEPENDANCIES
# - jq
# the files aren't 100% json ready yet they are single line json formatted objects 
# but need to be comma seperated
function convertToJSON() {
  PATH_TO_FILE=$1
  TEMP_DIR=$2
  FILE_NAME=$3
  # overwrite file
  echo "adding a comma to each log output"
  CONTENT_WITH_COMMAS=$(cat $PATH_TO_FILE | sed -e 's/$/,/')
  # remove trailing comma and convert to json 
  ALMOST_JSON=$(echo $CONTENT_WITH_COMMAS)
  echo "removing trailing comma for $PATH_TO_FILE"
  ALMOST_JSON=${ALMOST_JSON%?}
  echo "writing $TEMP_DIR/$FILE_NAME.json"
  JSON_FILENAME="$TEMP_DIR/$FILE_NAME.json"

  echo [ > $JSON_FILENAME
  echo $ALMOST_JSON >> $JSON_FILENAME
  echo ']' >> $JSON_FILENAME
  echo "finished writing to $JSON_FILENAME"
}

echo "JSON converted for files"
export -f convertToJSON
ls $FILE_PATH | xargs -I {} bash -c 'convertToJSON "$@"' _ $FILE_PATH/{} $TEMP_DIR {}

echo "REMOVING LOG FILES IN $FILE_PATH"

rm -rf $FILE_PATH

echo "JSON Files can be found in: "
echo $TEMP_DIR


