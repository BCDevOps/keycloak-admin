## SSO Service Name Migration
`rh-sso-admin` automated the SSO internal changes needed to enable a new service name with BCGov IDPs.

### Preparation:
1. take a manual backup of SSO DB, in case where we need to roll back:
  ```shell
  oc rsh <backup_container_pod>
  [backup pod]
    ./backup.sh -l
    # take a backup now
    ./backup.sh -1
    exit

    # test restore with a new DB instance
    ./backup.sh -v all

  # ========= If things go wrong =========
  # 1. community notification
  # 2. remove SSO route
  # 3. scale down SSO deployment
  # 4. restore the database
  #./backup.sh -r <db_service_name>:5432/<sso_db_name>
  ```
2. create the new route and point to the same service


### Enable the new SSO service name:
```shell
# 1. create environment files and fill in
cp .env.sample .env.<env>
# - service account username and password are from oc secret `sso-app-admin-secret`
# - SiteMinder configs available from XML

# 2. create output folder
mkdir output

# NOTE: after executing the scripts, a full list of backup configurations will be generated as following
./output/migration-result-<env>
├── app-idps # all IDP configurations from app realms
|
├── clients # all client configurations from IDP Agent realms
|
└── idps # IDIR and BCeID IDP configurations and mappers

# 3. install npm dependencies:
npm install

# 4. double check before executing the changes:
npm run kc-<env> verify
# - this will output lists of all objects that will be updated
# - this will take a backup of all objects in ./output/verify-result-<env> folder

# 5. execute the changes:
npm run kc-<env> execute
# - you will be promoted with a set of questions before proceeding
# - changes will be applied!
# - all changed objects will be backed up in ./output/migration-result-<env> folder

# 6. test out the updates with both original and new service name:
# - application integration (NOTE: user might need to clear cache)
# - KeyCloak console login to IDP realms
# - etc.
```
