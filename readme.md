# keycloak-admin
This repo contains tools and resources for helping provision and manage Red Hat SSO/KeyCloak realms for the BCDevOps Platform. 

## keycloak_realm_builder
The keycloak realm builder is a set of Ansible playbooks. Created to automated frequent operational tasks, such as provisioning new realms. This [readme](keycloak_realm_builder/scripts/custom_usage/readme.md) contains more details on how to use it.

## realm-management
This is a NodeJs based project. Designed for SSO admin users to easily query SSO resources, such as realms, users, roles and groups. See [readme](realm-management/README.md) for more details.

## sh_scripts
Manage KC resources using Shell scripts (deprecated). See [readme](sh_scripts/readme.md) for more details.

## log-query-tool
SSO Pod Log Query Tool. There are audit logs saved for all SSO keycloak pods. To be able to efficiently filter the logs based on information like realm ID, use the log query tool. See [readme](log-query-tool/README.md) for more details.

## postman
A postman collection for the admin API. Import the environment and the collection. Set the environment variables. Hit the /root/Authenticate request (populates the AuthToken variable). Now you have an easy GUI for querying the API and can set querystring variables, path variables, request body content, etc. 
