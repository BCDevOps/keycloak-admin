# Keycloak Realm Creator:

## Input
This ansible playbook receives a GitHub Pull Request Labeling information, including the following:
- Full repo url and the branch
- Pull request link and number
- Name of the label being added (webhook triggers are filtered by only specific labels being added to the PR)
- Github access token
- (the variables are passed in as specified in ./run-playbook.sh)

## General Flow
1. Setup env vars required for GitHub PR content fetching
2. Fetch the new file from the PR, which contains the information to create a new realm
3. Depending on the label added to the PR:
  - If the trigger points to a `request-ready` labeling, start Realm-Creation-Flow
  - If the trigger points to a `bceid-approved` labeling, start Prod-BCeID-enabling-Flow
4. If any of the steps fail, throw a message and add a Failure label to the PR to trigger notification steps in [Realm-O-Matic](https://github.com/bcgov/realm-o-matic)

### Realm-Creation-Flow
There are three instances of Keycloak that we support, dev, test and prod. Whenever a realm request is to be processed, same realms will be created in three Keycloaks. That being said, the realm creation play will be run three times, and they all include the following steps:
1. Setup Keycloak api request
2. Fetch access token
3. Create new realm with the PR content filled in to realm templates
4. Update access token to include the new realm
5. Create Identity Provides for the realm
6. Create an admin user and assign to the user account specified in the request

After all three realms have been created, add a `realm_complete_label` to the PR

### Prod-BCeID-enabling-Flow
If BCeID identity provide is requested with the realm, it will be setup and enabled only in the dev and test instances. For production realm, the usage of BCeID needs extra approval. When the approval has been given, the PR (the represents the original realm request) will be assinged a `bceid-approved` label. That triggers this flow.
1. Setup Keycloak api request
2. Fetch access token
3. Create BCeID Identity Provides for the production realm
4. When flow completes, add a `bceid_complete_label` to the PR
