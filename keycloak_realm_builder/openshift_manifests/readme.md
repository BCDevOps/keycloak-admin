## Scripted OCP Installation

You can use the oc templates to create the Realm-o-Matic-Ansible component.

### Build
```shell
# switch to tools namespace
oc project <namespace>-tools

# edit properties file:
# - tools.properties

# build:
oc process --ignore-unknown-parameters=true \
-f openshift_manifests/templates/build.yml \
--param-file=openshift_manifests/tools.properties | oc apply -f -

# verify image stream created
oc get is | grep -i realm-o-matic-ansible
```

### Deploy

Deploy the ansible component with oc templates and config for each env.

```shell
# switch to deployment namespace:
oc project <namespace>-<env>

# edit properties file:
# - <env>.properties

# import image to deployment namespace:
oc tag <namespace>-tools/realm-o-matic-ansible:<version> realm-o-matic-ansible:<version>

# create secret and configmaps:
oc process --ignore-unknown-parameters=true \
-f openshift_manifests/templates/prep.yaml \
--param-file=openshift_manifests/dev.properties | oc apply -f -

# deploy:
oc process --ignore-unknown-parameters=true \
-f openshift_manifests/templates/deployment.yml \
--param-file=openshift_manifests/dev.properties | oc apply -f -

# get all components:
oc get all -l app=realm-o-matic-ansible
```
