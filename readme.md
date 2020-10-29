# keycloak-admin
Thsi repo contains tools and resources for helping provision and manage Red Hat SSO/KeyCloak realms for the BCDevOps Platform. 

## keycloak_realm_builder
The keycloak realm builders is containerized application that will provision new realms based on the content supplied in a GitHub branch. This [readme](keycloak_realm_builder/readme.md) contains more details. 

## Shell Scripts
Manage KC resources using Shell scripts. See [readme](sh_scripts/readme.md) for more details.

## NodeJs based Keycloak admin actions
For better flexibility, we are using NodeJs based app to manage operational tasks. See [readme](realm-management/README.md) for more details.

## SSO Pod Log Query Tool
There are audit logs saved for all SSO keycloak pods. To be able to efficiently filter the logs based on information like realm ID, use the log query tool. See [readme](log-query-tool/README.md) for more details.