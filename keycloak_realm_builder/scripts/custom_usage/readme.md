# Custom Usages of Ansible Playbook

### 1. Keycloak Initial Instance Setup for Testing Purpose:
Reuse the playbook to configure a brand new instance of keycloak with BCGov settings, i.e.: IDIR and GitHub IDP setup. As there some conflicting tasks between the original realm builder, custom script will be using a combination of local tasks and realm builder tasks.

### 2. Local realm provisioning:
Similar to realm-o-matic where the playbook creates the realm, IDP and admin users from configuration.

### 3. Setup OCP4 Cluster login KeyCloak flow:
Reuse provisioning playbook to setup realms specific for OCP4 login. See details [here](doc/ocp4-cluster-kc.md).


## Steps to Run:
1. setup keycloak service accounts
```shell
cp creds/sample.sso-vars.yml creds/sso-vars.yml
# and fill in credentials
```

2. realm configs
```shell
# for app realm:
cp inputs/sample-realm-content-app.json inputs/realm-content-app.json

# for IDP realms:
cp inputs/sample-realm-content-idp.json inputs/sample-realm-content-<idp_name>.json

# then fill in the realm specs.
# Please note that if SiteMinder integration is needed, make sure the instance URL is `https://<env>.oidc.gov.bc.ca`
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
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=k6-setup
```

***Please note that there are some manual steps for K6 setup:***
- assign the client role `realm-management/realm-admin` to the API client in `Service Account Roles`
- get the API client secret
- setup test users' password

(Currently there is no endpoint found for those tasks, to be updated later on)

