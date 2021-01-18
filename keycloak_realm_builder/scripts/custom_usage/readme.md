# Custom Usages of Ansible Playbook

### 1. Keycloak Initial Instance Setup for Testing Purpose:
Reuse the playbook to configure a brand new instance of keycloak with BCGov settings, i.e.: IDIR and GitHub IDP setup. As there some conflicting tasks between the original realm builder, custom script will be using a combination of local tasks and realm builder tasks.

### 2. Local realm provisioning:
Similar to realm-o-matic where the playbook creates the realm, IDP and admin users from configuration.

### 3. Setup OCP4 Cluster login KeyCloak flow:
Reuse provisioning playbook to setup realms specific for OCP4 login. See details [here](doc/ocp4-cluster-kc.md).

### 4. Setup K6 Test realm:
Reuse provisioning playbook to setup realms for K6 test cases. See details [here](doc/k6-setup-automation.md).

### 5. Manually adding new Identity Provider for existing realm:
Reuse provisioning playbook to create new IDP integration for existing realms. See details [here](doc/new-idp.md).

### 6. Delete a realm:
This will delete the realm and its IDP integrations (IDIR/BCeID/GitHub/etc.)

## Steps to Run:
1. setup keycloak service accounts
```shell
cp creds/sample.sso_vars.yml creds/sso_vars.yml
# Fill in credentials:
# - if running in prod SSO, make sure to enter the correct OTP
# - if SiteMinder integration is needed, make sure the instance URL is `https://<env>.oidc.gov.bc.ca`
# - if GitHub integration is needed, you will need to create a GitHub OAuth app first
```

2. realm configs
```shell
# for app realm:
cp inputs/sample-realm-content-app.json inputs/realm-content-app.json

# for IDP realms:
cp inputs/sample-realm-content-idp.json inputs/sample-realm-content-<idp_name>.json
```

3. update the tasks included in 
```shell
# confirm tasks in the follow play:
tasks/sso-prep.yaml
tasks/sso-provisioning.yml
```

4. run the playbook with different actions
```shell
# provision new realms:
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=new-realm

# config an empty keycloak instance with BCGov specifications:
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=config-keycloak

# setup realm and details for OCP4 auth settings:
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=ocp4-setup

# setup realm and details for K6 testing:
# - count = # of realms to be created
# - for each k6 realm, the realm ID will be suffixed with incremental index
# - please note that end of the play, there will console out and output .param file that you need to config k6 testing job
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=k6-setup -e count=3

# add new IDP for specific realm:
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=new-idp

# enable PRODUCTION BCeID for a realm:
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=enable-prod-bceid

# delete realms and IDP integrations:
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=delete-realm
# make sure delete-realm.yml step <Setup idp names> is configured correctly
```
