# keycloak-admin
Thsi repo contains tools and resources for helping provision and manage Red Hat SSO/KeyCloak realms for the BCDevOps Pathfinder Platform. 

## keycloak_realm_builder
The keycloak realm builders is containerized application that will provision new realms based on the content supplied in a GitHub branch. This [readme](keycloak_realm_builder/readme.md) contains more details. 

## Setting up
You will need to create an environment configuration file for each environemnt, in the format `setenv-<name>.sh` where `<name>` is either `dev`, `test`, or `prod`

Example:
```
KEYCLOAK_URL=https://sso-dev.pathfinder.gov.bc.ca/auth
KEYCLOAK_CLIENT_REALM=<realm where the client is>
KEYCLOAK_CLIENT_ID=<client id>
KEYCLOAK_CLIENT_SECRET=<client secret>
```

## clean-up-realms
The keycloak realm remover is an Ansible Playbook that deletes realm and its linked Identity Providers. This [readme](clean-up-realms/README.md) contains more details.
