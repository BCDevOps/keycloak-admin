# keycloak-admin
Thsi repo contains tools and resources for helping provision and manage Red Hat SSO/KeyCloak realms for the BCDevOps Platform. 

## keycloak_realm_builder
The keycloak realm builders is containerized application that will provision new realms based on the content supplied in a GitHub branch. This [readme](keycloak_realm_builder/readme.md) contains more details. 

## Shell Scripts
Manage KC resources using Shell scripts. Read [readme](sh_scripts/readme.md) for more details.

## NodeJs based Keycloak admin actions:
For better flexibility, switch from shell scripts to a NodeJs based app.

### Setup:
Copy .env to different KC environments, such as `.env-test`. Fill in the env vars required in the .env file.

### Run:
```shell
# install dependencies:
npm install

# to run in dev environment:
npm run kc-dev
```
