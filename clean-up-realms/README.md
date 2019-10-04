## Removing a realm in BCGOV KeyCloak

This Ansible Playbook will remove realms in all `dev`, `test` and `prod` KeyCloak instances from BCGOV. When a realm is deleted, the clients for Identity Provider (IDP) will also be removed. By default, the IDP clients include IDIR, BCeID and GitHub.

1. Provide credentials in the `sso_vars.yml`
2. Provide realm information in `clean-playbook.yml`
3. Run `ansible-playbook clean-playbook.yml  -e realm_name=<the name of the realm>` to kick off the task
