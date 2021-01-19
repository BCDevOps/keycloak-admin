## Steps included for setting up realm for k6 testing:

### Prep steps:
- SSO instance admin credential will be needed to make API requests

### Setup for each k6 realm:
- create a new realm for k6
- create a public client for K6 auth requests - `k6`
- create a private client for API test - `api-test`
  - Service Account Role with realm admin access
  - obtain client credential
- create list of test users
  - keycloak local users
  - with preset password
- printout a list of the objects created and info needed for k6 test config
- also output oc param files to apply directly with k6 openshift templates
