# keycloak realm builder
There are different playbook sets in this builder folder:
- Realm-o-matic Realm Creator: a containerized application to create new SSO realms based on GitHub payloads
- Custom usages: playbooks for common operational task that reuse the above playbook

## Realm-o-matic Realm Creator:
This containerized application will run on OpenShift / Kubernetes. This is the actual provisioner of Realm-o-Matic (see [here](https://github.com/bcgov/realm-o-matic))

There are two parts that work together: 
- Ansible Webhook that receives a GitHub Pull Request payload from a private repo that tracks SSO realm request records from Realm-o-Matic
- Ansible playbook that creates Keycloak Realms based on realm configs and templates
- see [details](scripts/readme.md)

## Custom usages:
To re-use the KeyCloak Ansible Playbook for provisioning tasks without GitHub webhooks and run locally with custom tasks, follow steps [here](scripts/custom_usage/readme.md).
