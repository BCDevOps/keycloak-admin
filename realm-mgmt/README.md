# Keycloak realm management scripts

*Disclaimer: These scripts have only been tested on MacOS with node v11.1.0 and npm 6.4.1.*

These keycloak realm management scripts are written in node.js. Install the required dependency packages by running `npm install`.

## IDIR user import scripts

#### Import IDIR user GUIDs from LDAP
The `import-idir-users.js` script queries LDAP for a list of user's GUID given their IDIR username. To run this script first create a `users.json` file in this directory following the format in the template file. Run the script with `npm run import` and enter your IDIR username and password in the prompts.

#### Create users and attach roles
The `create-idir-users.js` script creates new user's in keycloak with the user's IDIR GUID. It will subsequently attach the given client roles to a user. To run this script ensure the `users.json` file has the `idir_user_guid` parameter for every user that is to be created. Each user should also have a `roles` property which is a string array of desired roles for the user. Run the script with `npm run create` and follow the prompts.
