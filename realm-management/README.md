## NodeJs based Keycloak admin actions:
For better flexibility, we are using NodeJs based app to manage operational tasks.

### Current functions:
- list all realms
- list users for specific realm
- list all users
- list admin users for specific realm
- list all realm admin users
- pre-populate IDIR users form LDAP
- Integrate with new SSO Service name
- backup realm settings
- disable roles across all realms

### Setup:
Copy .env to different KC environments, such as `.env-test`. Fill in the env vars required in the .env file.

### Run:
```shell
# install dependencies:
npm install

# update index.js for actions needed

# to run in dev environment:
npm run kc-dev
```
