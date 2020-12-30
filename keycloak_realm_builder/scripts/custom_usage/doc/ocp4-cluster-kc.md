## Setup OCP4 Cluster login KeyCloak flow:

### Prep steps:
- Configure GitHub organization to role mapper:
  - in `_github` realm, go to IDP and add a `Role Importer` mapper (if not exist yet) with prefix as `org:`
  - create realm roles for each target GitHub org with the format `org:<org_name>` (case sensitive)
  - and then, find the app realm client and create a new client mapper `User Realm Role`, with prefix as `github:` and claim role name as `roles`, type as string

### Realm config steps:
- create app realms (dev/test/prod) with `IDIR` and `GitHub` IDP
- Setup realm config with `allow duplicate email`
- Setup realm to use BCGov login theme

### GitHub IDP config steps:
Configure GitHub IDP to make use of the Organization mappers
- create realm roles for each target GitHub Org, e.g.: `github-org-bcdevops`
- in GitHub IDP and create a `Two Way Claim to Role` mapper
  - claim as `roles`
  - claim value as `github:org:<org_name>`
  - select the role created just now to map onto

### GitHub Auth flow setup:
Now that users will have the corresponding role in their local realm account, auth flow can filter by that
- Setup a Post Broker Login flow that filters GitHub org roles:
  - start with a new flow
  - have a sub execution of type `Required Role By Client`
  - config the execution with target client, role to filter on, and a URL to redirect to if user does not have the required role
- Setup First Broker Login flow for GitHub IDP:
  - take a copy of the original flow
  - disable the user review profile config execution, which helps to avoid unauthorized users to waste the time
  - also disable OTP sub flow to avoid triple factor auth
- Config GitHub IDP flows
  - override the first and post broker login flows in the IDP settings

### IDIR IDP setup:
- create IDIR IDP with standard config
- Optional: setup OTP for IDIR users as MFA (depends on if IDIR service provides MFA)
