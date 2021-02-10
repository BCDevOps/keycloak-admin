# NodeJs based Keycloak admin actions:
For better flexibility, we are using NodeJs based app to manage operational tasks.

Leverages a NPM package for KeyCloak Admin actions, see details here: https://www.npmjs.com/package/keycloak-admin

## Current functions:
- list all realms
- list users for specific realm
- list all users
- list admin users for specific realm
- list all realm admin users
- pre-populate IDIR users form LDAP
- Integrate with new SSO Service name
- backup realm settings
- disable roles across all realms

## Setup and Run:
```shell
# 1. Create env file for each SSO environment and fill in:
cp .env-sample .env-<environment>

# Environment would be:
# - sbox for sandbox test run
# - dev
# - test
# - prod


# 2. Install dependencies:
npm install

# 3. Update index.js for actions needed

# 4. Run in <environment> environment:
npm run kc-<environment>

# depends on the function output, would be console logs or file in ./output folder
```
