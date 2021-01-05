'use strict';

const fs = require('fs-extra');
const { IDP_REF, KC_CONFIG, KC_TERMS } = require('../constants');

/**
 * List all realms
 * @param {kcAdmin} kcAdminClient with auth setup
 */
const getAllRealms = async (kcAdminClient) => {  
  try {    
    // github example:
    const allRealms = await kcAdminClient.realms.find();
    return allRealms;

  } catch (e) {
    throw e;
  }
};

/**
 * Get admin users for specific realm:
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {String} realmName target realm name
 * 
 */
const getRealmAdmins = async (kcAdminClient, realmName) => {
  try {
    let adminUsers = null;

    // get all realm groups:
    const allGroups = await kcAdminClient.groups.findOne({
      realm: realmName,
      name: KC_TERMS.ADMIN_GROUP_NAME,
    });
    
    if (allGroups) {
      // find BCGov default admin group:
      const adminGroupId = allGroups.map(g => {
        if (g.name === KC_TERMS.ADMIN_GROUP_NAME) return g.id;
      });

      // get the group members:
      adminUsers = await kcAdminClient.groups.listMembers({
        realm: realmName,
        id: adminGroupId,
      });
    } else {
      console.log(`No admin group in realm ${realmName}!`);
      return `No admin group in realm ${realmName}!`;
    }

    if (!adminUsers) {
      console.log(`No admin users found in realm ${realmName}!`);
      return `No admin users found in realm ${realmName}!`;
    }
    
    return adminUsers.map(u => ({username: u.username, email: u.email}));

  } catch (e) {
    throw e;
  }
};

/**
 * Get admin users for ALL realms:
 * @param {kcAdmin} kcAdminClient with auth setup
 * 
 */
const getAllRealmAdmins = async (kcAdminClient) => {
  try {
    const allRealms = await getAllRealms(kcAdminClient);

    const allAdminUsers = await allRealms.reduce(async (acc, r) => {
      const accAdminUsers = await acc;

      const adminUsers = await getRealmAdmins(kcAdminClient, r.id);
      const result = {
        realm: r.id,
        admins: adminUsers,
      };

      accAdminUsers.push(result);
      return accAdminUsers;

    }, Promise.resolve([]));

    return allAdminUsers;

  } catch (e) {
    throw e;
  }
};


/**
 * Get details settings for a realm:
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {String} realmName target realm name
 * 
 * realm config:
 * - realm: login-settings, token, email, theme
 * - realm-roles
 * - realm-groups
 * 
 * Clients:
 * - mappers
 * - client roles
 * - auth flow overwrite
 * - service account
 * 
 * IDPs:
 * - idp-mappers
 * - auth flows
 */
const getRealmSettings = async (kcAdminClient, realmName = KC_CONFIG.REALM.NAME) => {
  try {
    // 1. get realm info:
    const outputPath = `./output/${realmName}`;

    const targetRealm = await kcAdminClient.realms.findOne({
      realm: realmName,
    });

    await fs.outputJson(`${outputPath}/realm.json`, targetRealm);

    // 2. get realm-group:
    const realmGroups = await kcAdminClient.groups.find({
      realm: realmName,
    });
    await fs.outputJson(`${outputPath}/groups.json`, realmGroups);

    realmGroups.forEach(async g => {
      const groupRoles = await kcAdminClient.groups.listRoleMappings({
        realm: realmName,
        id: g.id,
      });
      const groupRealmRoles = await kcAdminClient.groups.listRealmRoleMappings({
        realm: realmName,
        id: g.id,
      });
      await fs.outputJson(`${outputPath}/groupRole/${g.name}.json`, {
        groupRoles: groupRoles,
        groupRealmRoles: groupRealmRoles,
      });
    });

    // 3. get realm-roles:
    const realmRoles = await kcAdminClient.roles.find();
    await fs.outputJson(`${outputPath}/roles.json`, realmRoles);

    // TODO: 4. get client roles!

  } catch (e) {
    throw e;
  }
};

/**
 * Get users from a realm:
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {String} realmName target realm name
 */
const getRealmUsers = async (kcAdminClient, realmName = KC_CONFIG.REALM.NAME) => {
  try {

    kcAdminClient.setConfig({
      realmName,
    });

    const users = await kcAdminClient.users.find({
      max: 1000000,
    });

    // format result:
    const userList = users.map(u => u.username);
    console.log(`There are ${users.length} users in realm ${realmName}`);
    return {
      count: users.length,
      users: userList,
    };

  } catch (e) {
    throw e;
  }
};

/**
 * Get users from ALL realms:
 * @param {kcAdmin} kcAdminClient with auth setup
 */
const getAllUsers = async (kcAdminClient) => {
  try {
    const allRealms = await getAllRealms(kcAdminClient);

    // accumulate users from each realms:
    const allUsers = await allRealms.reduce(async (acc, r) => {
      const userInRealm = await acc;
      const result = await getRealmUsers(kcAdminClient, r.realm);

      // format result:
      userInRealm.push({
        realm: r.realm,
        count: result.count,
        users: result.users,
      });
      return userInRealm;

    }, Promise.resolve([]));

    return allUsers;

  } catch (e) {
    throw e;
  }
};

module.exports = { getAllRealms, getRealmAdmins, getRealmSettings, getRealmUsers, getAllRealmAdmins, getAllUsers };
