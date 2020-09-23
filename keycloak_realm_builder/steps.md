## Steps to create a new Realm for product team:

### Create realm:
(`kc-create-realm.sh`)
1. check if realm exists
2. if not, create realm
2.1 setup name and display name
2.2 set up a group (with default client `realm-management`'s roles)


### Disabling `Review Profile` on `First Broker Login`:
(`kc-disable-profile-review.sh`)
1. get `authenticationConfig` id for the execution
2. update it to false


### Link to IDP Realms, separately for each ID:
(`kc-link-realm.sh`)
1. get the IDP realm
2. create a client in the IDP realm with REDIRECT_URI that point to the new realm's broker endpoint
3. get the ID+secret pair from the client
4. create IDP in the new realm, with the client ID+secret
5. add mappers for the IDp


### Import admin user, and add user to the group:
(`kc-import-user.sh` & `kc-add-group-to-user.sh`)
1. find the user from the IDP realm, if not exist, then quit
2. get the user ID and add to the new realm, assign to the group
