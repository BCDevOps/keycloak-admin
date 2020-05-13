'use strict';

const { KC_TERMS } = require('../constants');

/**
 * Delete a client role for all realms:
 * @param {String} roleName name of role to search for
 * @param {Boolean} is_delete delete or not
 * 
 * usage to check before deleting:
 * await deleteClientRole(KC_TERMS.IMPERSONATION_ROLE, false);
 * 
 */
const deleteClientRole = async (roleName, is_delete = false) => {
  try {

    const realms = await getAllRealms(kcAdminClient);

    for (const realm of realms) {
      const realmId = realm.id;
      console.log(realmId);

      // 1. find client:
      const client = await kcAdminClient.clients.findOne({
        realm: realmId,
        clientId: KC_TERMS.ADMIN_CLIENT_NAME,
      });
  
      // 2. make sure the client exists:
      if (client && client.length === 1) {
        const clientId = client[0].id;
        const clientName = client[0].clientId;
        console.log(`realmId: ${realmId} - clientName: ${clientName} - clientId: ${clientId}`);

        // 3. find the client role:
        const roles = await kcAdminClient.clients.findRole({
          realm: realmId,
          id: clientId,
          roleName: roleName,
        });
        if (roles) {
          console.log(`realmId: ${realmId} - roleName: ${roles.name} - roleId: ${roles.id}`);
          // 4. delete role when specified:
          if (is_delete) {
            await kcAdminClient.clients.delRole({
              realm: realmId,
              id: clientId,
              roleName: roleName,
            });
            console.log(`----------------role deleted!`);
          }
        } else {
          console.error('----------------no such Role!')
        }

      } else {
        // console.error(client.reduce(i => i.clientId));
        console.error('----------------no such client')
      }
    }

  } catch (e) {
    throw e;
  }
};
module.exports = { deleteClientRole };
