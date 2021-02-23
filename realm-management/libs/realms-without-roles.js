'use strict';

/**
 * Produce a report of number of roles per realm
 * @param {kcAdmin} kcAdminClient with auth setup
 */
const realmRolesReport = async (kcAdminClient) => {  
  console.log('**** Realm Roles Report ****\n');

  let allRealms = (await kcAdminClient.realms.find());
  allRealms = allRealms.filter(x => !['IDIR', 'github', 'bceid', 'tfrs'].includes(x.id));

  let realmRoleInfos = allRealms.map( realm => {
    return {
      realm: realm.id,
      realmName: realm.displayName,
      allRoles: [],
      defaultRoles: realm.defaultRoles,
      nonDefaultRoles: [],
    };
  });

  const promises = realmRoleInfos.map(async roleInfo => {
    let allRoles = await kcAdminClient.roles.find( { realm: roleInfo.realm } );
    roleInfo.allRoles = allRoles.map( r => r.name );
    roleInfo.nonDefaultRoles = roleInfo.allRoles.filter(n => !roleInfo.defaultRoles.includes(n));
  });

  await Promise.all(promises);

  console.log(`total # of realms: ${realmRoleInfos.length}`);

  let realmsWithoutRoles = realmRoleInfos.filter( rri => rri.nonDefaultRoles.length == 0 );
  console.log(`total # of realms without realm-level roles: ${realmsWithoutRoles.length}`);
  let realmNames = realmsWithoutRoles.map( r => r.realmName ? r.realmName : r.realm ).sort();
  for (const rwr of realmNames) {
    console.log(`${rwr}`)
  }

}

module.exports = { realmRolesReport };