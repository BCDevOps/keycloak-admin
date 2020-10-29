
/**
 * RocketChat notification
 */

'use strict';

const axios = require('axios').default;

const roomId = process.env.RC_ROOM_ID | 'sso-migration';
const roomTopic = process.env.RC_ROOM_TOPIC | '';
const rcUser = process.env.RC_ADMIN_USER_ID;
const rcToken = process.env.RC_ADMIN_TOKEN;

const rcClient = axios.create({
  baseURL: process.env.RC_URL,
  timeout: 100000,
  headers: {
    'content-type': 'application/json',
    'X-User-Id': rcUser,
    'X-Auth-Token': rcToken,
  },
});

const exceptionalRealm = ['IDIR', 'github', 'bceid', 'master'];
const allRealms = await getAllRealms(kcAdminClient);
const result = allRealms.map(r => ({
  id: r.id,
  displayName: r.displayName,
}))

let count = 1;
result.forEach(async r => {
  if (!exceptionalRealm.includes(r.id)) {
    console.log(`${r.id} - ${r.displayName}`);
    count ++;
  }
  // post:
  const msg = `Realm: \`${r}\``;
  console.log(msg);
  await rcClient.post(`${process.env.RC_URL}/chat.postMessage`, {
    roomId: roomId,
    text: msg,
  });

});