# keycloak-admin
Thsi repo contains tools and resources for helping provision and manage Red Hat SSO/KeyCloak realms for the BCDevOps Platform. 

## keycloak_realm_builder
The keycloak realm builder is a set of Ansible playbooks to provision new realms based on the content supplied in a GitHub branch. This [readme](keycloak_realm_builder/readme.md) contains more details.

## clean-up-realms
Ansible Playbook to delete a realm and it's IDP integrations. See [readme](clean-up-realms/README.md) for more details.

## realm-management
This is a NodeJs based project. Designed for SSO instance admin user to easily management SSO resources, such as realms, users, roles and groups. See [readme](realm-management/README.md) for more details.

## sh_scripts
Manage KC resources using Shell scripts (deprecated). See [readme](sh_scripts/readme.md) for more details.

## log-query-tool
SSO Pod Log Query Tool. There are audit logs saved for all SSO keycloak pods. To be able to efficiently filter the logs based on information like realm ID, use the log query tool. See [readme](log-query-tool/README.md) for more details.
