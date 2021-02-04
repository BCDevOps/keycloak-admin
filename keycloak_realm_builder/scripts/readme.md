# Realm-o-matic Ansible Component:

This is the backend provisioner of Realm-o-Matic. When user create a request on Realm-o-Matic, a record will be created in DB (using a private GitHub repo for record tracking). This will send off a webhook to trigger this Ansible component. And based on different types of triggers, Realm-o-matic Ansible will carry out the provisioning tasks on dev,test and prod SSO instances.

There are two parts that work together: 
- Ansible Webhook: that receives a GitHub Pull Request payload from a private repo that tracks SSO realm request records from Realm-o-Matic
- Ansible playbook: that creates Keycloak Realms based on realm configs and templates

## ++ Part 1: Ansible Webhook ++

### Configuration
The webhook service takes in a `hooks.json` or `hooks.yml` file. This is a single file that lists all hook configurations and defines: 
- The hook ID
- The scripts to run
- The parameters to pass to the scripts from the webhook payload
- The filters required to either admit or deny the webhook

The configuration used in this instance is as follows:
```yaml
- id: webhook
  execute-command: /opt/run-playbook.sh
  command-working-directory: /opt
  response-message: I got the payload!
  pass-arguments-to-command:
  - source: payload
    name: pull_request.head.repo.html_url
  - source: payload
    name: pull_request.head.ref
  - source: payload
    name: number
  - source: payload
    name: pull_request.head.repo.owner.login
  - source: payload
    name: pull_request.url
  - source: payload
    name: pull_request.issue_url
  - source: payload
    name: label.name
  trigger-rule:
    and:
    - match:
        type: payload-hash-sha1
        secret: mysecret
        parameter:
          source: header
          name: X-Hub-Signature
    - match:
        type: value
        value: labeled
        parameter:
          source: payload
          name: action
    # Match either one of the following labels:
    - or:
      - match:
          type: value
          value: request-ready
          parameter:
            source: payload
            name: label.name
      - match:
          type: value
          value: bceid-approved
          parameter:
            source: payload
            name: label.name
```

Based on the above configuration, a GitHub webhook pointing to `https://<ansible_component_host>/hooks/webhook` will trigger actions.

The filter will look for the following:
- match the secret `mysecret`
- match a PR action as `labeled` and the label name should be:
  - `request-ready`: signal to start Realm-Creation-Flow (see details in Part 2)
  - `bceid-approved`: signal to start Prod-BCeID-enabling-Flow

When the script runs, we pass some data from the payload along into the ansible playbook as extra vars: 

```shell
#!/bin/bash
ansible-playbook playbook.yml -e repo_url=$1 -e branch=$2 -e pull_request_number=$3 \
-e repo_owner=$4 -e pull_request_url=$5 -e issue_url=$6 -e label_name=$7  \
-e gh_token=$TOKEN
```

### Container Configuration
This code leverages the ansible operator container since it has the necessary components to easily run ansible. 

### GitHub Integration
The Ansible playbook interacts with GitHub to place API calls. This requires a GitHub Access token mounted as a secret at `/opt/creds/token`.

### Acknowledgements 
- [webhook code](https://github.com/adnanh/webhook)


## ++ Part 2: Ansible playbook ++

### Input to the playbook
This ansible playbook receives a GitHub Pull Request Labeling information, including the following:
- Full repo url and the branch
- Pull request link and number
- Name of the label being added (webhook triggers are filtered by only specific labels being added to the PR)
- Github access token
- (the variables are passed in as specified in ./run-playbook.sh)

### General Flow of Creating Realms
1. Setup env vars required for GitHub PR content fetching
2. Fetch the new file from the PR, which contains the information to create a new realm
3. Depending on the label added to the PR:
  - If the trigger points to a `request-ready` labeling, start Realm-Creation-Flow
  - If the trigger points to a `bceid-approved` labeling, start Prod-BCeID-enabling-Flow
4. If any of the steps fail, throw a message and add a Failure label to the PR to trigger notification steps in [Realm-O-Matic](https://github.com/bcgov/realm-o-matic)

Please note that all KeyCloak requests are made to the `SSO Admin REST API`, details here: https://access.redhat.com/webassets/avalon/d/red-hat-single-sign-on/version-7.4/restapi/

#### Realm-Creation-Flow
There are three instances of Keycloak that we support, dev, test and prod. Whenever a realm request is to be processed, same realms will be created in three Keycloaks. That being said, the realm creation play will be run three times, and they all include the following steps:
1. Setup Keycloak api request
2. Fetch access token
3. Create new realm with the PR content filled in to realm templates
4. Update access token to include the new realm
5. Create Identity Provides for the realm
6. Create an admin user and assign to the user account specified in the request

After all three realms have been created, add a `realm_complete_label` to the PR

#### Prod-BCeID-enabling-Flow
If BCeID identity provide is requested with the realm, it will be setup and enabled only in the dev and test instances. For production realm, the usage of BCeID needs extra approval. When the approval has been given, the PR (the represents the original realm request) will be assinged a `bceid-approved` label. That triggers this flow.
1. Setup Keycloak api request
2. Fetch access token
3. Create BCeID Identity Provides for the production realm
4. When flow completes, add a `bceid_complete_label` to the PR
