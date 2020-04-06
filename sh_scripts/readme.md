## Setting up
You will need to create an environment configuration file for each environment, in the format `setenv-<name>.sh` where `<name>` is either `dev`, `test`, or `prod`

Example:
```
KEYCLOAK_URL=https://sso-dev.pathfinder.gov.bc.ca/auth
KEYCLOAK_CLIENT_REALM=<realm where the client is>
KEYCLOAK_CLIENT_ID=<client id>
KEYCLOAK_CLIENT_SECRET=<client secret>
```