# Custom Usages of Ansible Playbook

## Keycloak Initial Instance Setup for Testing Purpose:
Reuse the playbook to configure a brand new instance of keycloak with BCGov settings, i.e.: IDIR and GitHub IDP setup. As there some conflicting tasks between the original realm builder, custom script will be using a combination of local tasks and realm builder tasks.

## Local realm provisioning:
Similar to realm-o-matic where the playbook creates the realm, IDP and admin users from configuration.


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

# then fill in the realm specs
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

# config empty keycloak instance:
ansible-playbook keycloak_realm_builder/scripts/custom_usage/playbook.yml -e action=config-keycloak
```

