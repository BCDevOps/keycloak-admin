const kcAdmin = require('keycloak-admin').default;
const prompts = require('prompts');
const {
  updateIdpAppClient,
  updateAppRealmIdp,
  updateAgentIdpConfigs,
} = require('./libs/service-name-migration-utils');
// const { getAllRealms, getRealmAdmins, getRealmSettings } = require('./libs/get-realms');
const {
 KC_CONFIG, IDP_TERMS, KC_MIGRATION_ROUTES, MODE 
} = require('./constants');

const main = async () => {
  try {
    // setup kc admin instance:
    const kcAdminClient = new kcAdmin(KC_CONFIG.REQUEST);
    await kcAdminClient.auth(KC_CONFIG.AUTH);

    // ====================================== SSO Service Name Migration =========================
    // 0. double check before running!

    const newRoute = KC_MIGRATION_ROUTES.NEW;
    const oldRoute = KC_MIGRATION_ROUTES.OLD;
    const questions = [
      {
        type: 'text',
        name: 'confirm',
        message:
          '================== Please note that you are running EXECUTION mode, are you sure to proceed? (CtrlC to exit if not)==================',
      },
      {
        type: 'text',
        name: 'env',
        message: `We are in ${MODE.ENV} environment now, have you taken a DB backup?`,
      },
      {
        type: 'text',
        name: 'about',
        message: `We are switching ${oldRoute} to ${newRoute}`,
      },
    ];

    if (MODE.EXECUTE_CHANGE) {
      await prompts(questions);
    }

    // 1. get all IDP realms, IDPs, and clients:

    const allIdpClients = await IDP_TERMS.reduce(async (acc, r) => {
      const clientList = await acc;
      const idpRealmId = r.REALM;
      // const idpRealm = await kcAdminClient.realms.findOne({
      //   realm: idpRealmId,
      // });
      const idpClients = await kcAdminClient.clients.find({
        realm: idpRealmId,
      });
      // const idpAlias = idpRealm.identityProviders
      //   ? idpRealm.identityProviders.map((idp) => idp.alias)
      //   : [];
      const idpClientIds = idpClients ? idpClients.map((client) => client.clientId) : [];
      // Output for checking:
      // console.log(`--- \nIDP realm: ${idpRealm.id}`);
      // console.info(`IDP setup: ${idpAlias}`);
      // console.log('Clients:');
      // console.info(idpClientIds);

      // get all clients for APP realms:
      const appRealmClients = idpClientIds.filter((c) => c.includes('https'));
      clientList.push({
        realm: r.ALIAS,
        clients: appRealmClients,
      });
      return clientList;
    }, Promise.resolve([]));

    if (!MODE.EXECUTE_CHANGE) {
      console.log('------------- all clients from IDP realms:');
      console.log(allIdpClients);
    }

    // -------------------------------------------------------------------------------------------
    // 2. get all APP realms (other than IDP realms), and the IDPs in each realm:

    const allRealms = await kcAdminClient.realms.find();
    const idpRealmNames = IDP_TERMS.map((r) => r.REALM);
    const appRealms = allRealms.reduce((acc, r) => {
      if (!idpRealmNames.includes(r.realm)) {
        const idpAlias = r.identityProviders ? r.identityProviders.map((idp) => idp.alias) : [];

        acc.push({
          realm: r.realm,
          idps: idpAlias,
        });
      }
      return acc;
    }, []);

    if (!MODE.EXECUTE_CHANGE) {
      console.log('------------- all APP realms with IDP list:');
      console.log(appRealms);
    }

    // -------------------------------------------------------------------------------------------
    // 3. compare if IDP clients and app realms matches

    // - Set statistic:
    let clientsCount = 0;
    let idpsCount = 0;
    const clientsCountArray = [];
    const idpsCountArray = [];

    // Filter out the IDP integration which does not belong to BCGov default ones
    // Format: <idp_alias>/<app_realm_name>
    // Form a list of all clients for each IDP realm:
    allIdpClients.forEach((i) => {
      i.clients.forEach((c) => {
        clientsCount += 1;
        clientsCountArray.push(`${i.realm}/${c.split('/').pop()}`);
      });
    });
    // Form a list of all app realms and corresponding IDP usage:
    appRealms.forEach((r) => {
      r.idps.forEach((i) => {
        idpsCount += 1;
        idpsCountArray.push(`${i}/${r.realm}`);
      });
    });

    // - Display extra items that should not be updated:
    console.log(`idpsCount: ${idpsCount}, clientsCount: ${clientsCount}`);
    const extraClients = clientsCountArray.filter((x) => !idpsCountArray.includes(x));
    const extraIDPs = idpsCountArray.filter((x) => !clientsCountArray.includes(x));
    console.log('extraClients');
    console.log(extraClients);
    console.log('extraIDPs');
    console.log(extraIDPs);

    // -------------------------------------------------------------------------------------------
    // 4. update url in IDP realms' clients for all APP realms

    console.log('------------- Update url in IDP realms clients for all APP realms:');
    await Promise.all(
      allIdpClients.map(async (r) => {
        const idpRealm = r.realm;
        const allClients = r.clients;

        // Execute in series for each client: (rate limit)
        // eslint-disable-next-line no-restricted-syntax
        for (const clientId of allClients) {
          console.log(`IDP: ${idpRealm} - Client ID: ${clientId}`);
          // for each client:
          // eslint-disable-next-line no-await-in-loop
          await updateIdpAppClient(clientId, idpRealm, kcAdminClient, newRoute, oldRoute);
        }
      }),
    );

    // -------------------------------------------------------------------------------------------
    // 5. update IDP settings for each APP realm

    console.log('------------- Update IDP settings for each APP realm:');
    // Execute in series for each app realm: (rate limit)
    // eslint-disable-next-line no-restricted-syntax
    for (const appRealm of appRealms) {
      const appRealmName = appRealm.realm;
      const idps = IDP_TERMS.map((i) => i.ALIAS);
      const appRealmIdps = appRealm.idps.filter((idp) => idps.includes(idp));

      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        appRealmIdps.map(async (appRealmIdp) => {
          console.log(`realm: ${appRealmName} - IDP: ${appRealmIdp}`);
          // for each appRealmIdp:
          // If the IDP config is not using BCGov specific auth options, skip the update!
          if (extraIDPs.includes(`${appRealmIdp}/${appRealmName}`)) {
            console.log(
              `----This IDP is NOT a BCGov option, skip! realm: ${appRealmName} - IDP: ${appRealmIdp}`,
            );
          } else {
            console.log('----proceed!');
            await updateAppRealmIdp(appRealmName, appRealmIdp, kcAdminClient, newRoute, oldRoute);
          }
        }),
      );
    }

    // -------------------------------------------------------------------------------------------
    // 6. update IDP realm IDP settings
    // 6.1 Github IDP: update GitHub OAuth settings
    // 6.2 SiteMinder IDPs:
    // take SM federation services input, update SAML configuration and IDP mappers

    console.log('------------- Update each IDPs and mappers:');
    // Execute in series for each IDP: (rate limit)
    // eslint-disable-next-line no-restricted-syntax
    for (const idp of IDP_TERMS) {
      const idpRef = {
        alias: idp.ALIAS,
        realm: idp.REALM,
      };

      if (idp.ALIAS === 'github') {
        // Update GitHub OAuth app:
        // const idpConfig = await kcAdminClient.identityProviders.findOne(idpRef);
        console.log(`IDP: ${idp.ALIAS} --- manually!`);
        // TODO: automate GitHub calls
      } else {
        // Update IDP realm IDP settings
        console.log(`IDP: ${idp.ALIAS}`);
        // eslint-disable-next-line no-await-in-loop
        await updateAgentIdpConfigs(kcAdminClient, idpRef);
      }
    }

    // -------------------------------------------------------------------------------------------

    // 7. Rollback
    // TODO: use the backup configurations taken from the run, and reapply via keycloak client
    // ====================================== Migration ^^^ ==============================

    // Override client configuration for all further requests:
    // kcAdminClient.setConfig({
    //   realmName: KC_CONFIG.REALM.NAME,
    // });

    // Backup realm settings:
    // await getRealmSettings(kcAdminClient, KC_CONFIG.REALM.NAME);

    // Disable impersonation role:
    // await deleteClientRole(KC_TERMS.IMPERSONATION_ROLE, false);
  } catch (err) {
    throw Error(err);
  }
};
main();
