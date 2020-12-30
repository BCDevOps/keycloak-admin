## Steps included for setting up realm for k6 testing:

### Prep steps:
- SSO instance admin credential will be needed to make API requests

### Setup:
- create a new realm for k6
- create a public client for K6 auth requests - `k6`
- create a private client for API test - `api-test`
  - Service Account Role with realm admin access
  - obtain client credential
- create list of test users
  - keycloak local users
  - with preset password
- output list of the objects created and info needed for k6 test config
