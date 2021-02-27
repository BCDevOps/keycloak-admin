# Log Query Tool

This tool helps debug our audit logs. The log files are gigantic. Usually we need to debug at the realm level and so what this tool will do is convert the logs into JSON format and filter based on the realm name. 

## Available Scripts

- `rsyncLogs.sh`: This will oc rsync the log files to your local workstation in a `tmp` directory. The last line of output is the location of the log files on your local workstation.

- `queryJsonByRealm.sh`: Will read through the JSON files in the temp directory from `convertToJson.sh` and run a `jq` query to filter out by `realmId`

## How to use
1. log into your oc namespace and rysnc log files over `LOG_PATH=<path to audit logs in pod> DC_LABEL=<pod deployConfig label> ./rsyncLogs.sh`

3. query JSON by realm. `LOG_PATH=<path to json files> ./queryJsonByRealm.sh <realmId>`


With a oneshot you could try:

```sh
  LOG_PATH=$(LOG_PATH=<path to audit logs in pod> DC_LABEL=<pod deployConfig label> ./rsyncLogs.sh | tail -n 1) \
  ./queryJsonByRealm.sh <realmId>
```
 eg
```sh
  # ensure you are logged into the appropriate openshift namespace
  LOG_PATH=$(LOG_PATH=/var/log/eap DC_LABEL=deploymentconfig=foo ./rsyncLogs.sh | tail -n 1) \
  ./queryJsonByRealm.sh mattdamon
```
## Further Queries

Now that you have a realm specific audit log. You can leverage jq to get more info:

- filtering by client: `LOG_PATH=... ./queryJsonByRealm.sh <realmid> | jq '.[] | select(.message | test(clientId=...))'
