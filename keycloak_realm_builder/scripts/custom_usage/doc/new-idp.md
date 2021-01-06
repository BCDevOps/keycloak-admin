## Manually adding new Identity Provider for existing realm:

### Prep steps:
- SSO instance admin credential will be needed to make API requests
- realms existing in all three environments
- the target IDPs are one of the available BCGov IDPs
- **For Production BCeID**: only enable it when IDIM team has completed approval process, playbook contains prompt input

### configing:
```shell
# create the config from template:
cp inputs/sample-realm-content-app.json inputs/realm-content-app.json

# make sure realm ID matches!

# add the new IDP from available ones:
- "IDIR"
- "GitHub"
- "BCeID"

# you can ignore the other fields
```

### Steps included in the playbook:
- prompt check for Production BCeID integration
- create a new IDP for specified realm and integrate with the corresponding IDP broker realms
