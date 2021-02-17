'use strict';

const dayjs = require('dayjs');
const fs = require('fs-extra');

/**
 * Produce a 12 month report of monthly unique users per realm
 * @param {kcAdmin} kcAdminClient with auth setup
 */
const activeMonthlyUsersReport = async (kcAdminClient) => {  
  let today = dayjs();

  let allRealms = (await kcAdminClient.realms.find());
  // not sure why these 4 realms fail with a 404
  allRealms = allRealms.filter(x => !['IDIR', 'github', 'bceid', 'tfrs'].includes(x.id));

  // set up the date range objects to find user data for
  const monthFormat = 'MMM YYYY';
  let dateRanges = [];
  for (let i = 0; i < 12; i++) {
    let month = dayjs().subtract(i, 'month');
    let range = {
      month: month.format(monthFormat),
      startDate: month.startOf('month').toDate(),
      endDate: month.endOf('month').toDate(),
      logins: undefined,
    };
    dateRanges.push(range);
  } 

  // // fill in the ranges with login data from API
  const promises = dateRanges.map(async dr => {
    return getUserCountsForDateRange(kcAdminClient, dr, allRealms);
  });
  let populatedDateRanges = [];
  for (const logins of promises) {
    populatedDateRanges.push(await logins);
  }

  let todayFormatted = today.format('YYYY-MM-DD');
  let reportContent = formatReport(dateRanges, allRealms);
  await fs.outputFile(`output/${process.env.KC_ENV}-activeMonthlyUsersReport-${todayFormatted}.csv`, reportContent);
}

/**
 * Get active monthly users within a date range for each known realm
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {Object} range a one month period to collect login data for
 * @param {Array} realms a list of realms to collect login data for
 */
const getUserCountsForDateRange = async (kcAdminClient, range, realms) => {  
    
    try {   

        const promises = realms.map(async r => {
          const events = await kcAdminClient.realms.findEvents({
            realm: r.id,
            dateFrom: range.startDate,
            dateTo: range.endDate,
            type: 'LOGIN',
          });

          const ids = new Set(events.map( x => x.userId));

          const result = {
            realm: r.displayName ? r.displayName : r.id,
            count: ids.size,
            ids: ids,
          };
    
          return result;

        });

        let allEvents = [];
        for (const events of promises) {
          allEvents.push(await events);
        }

        range.logins = allEvents;
        return range;

    } catch (e) {
      throw e;
    }
  };

  function formatReport(dateRanges, allRealms) {
    allRealms.sort(sortRealms);
    dateRanges.sort(sortDateRanges);

    const numRows = allRealms.length + 1; // + 1 for header row
    const numCols = dateRanges.length + 1; // + 1 for header column
    let spreadsheet = new Array(numRows);
    for (let row = 0; row < numRows; row++) {
      spreadsheet[row] = new Array(numCols);
    }
  
    // Fill header row
    spreadsheet[0][0] = '';
    for (let rangeNum = 0; rangeNum < dateRanges.length; rangeNum++) {
      spreadsheet[0][rangeNum + 1] = dateRanges[rangeNum].month;
    }

    // Fill header column
    for (let realmNum = 0; realmNum < allRealms.length; realmNum++) {
      let realm = allRealms[realmNum];
      let realmName = realm.displayName ? realm.displayName : realm.id;
      realmName = realmName.replace(',', '.'); // commas aren't good in CSV
      spreadsheet[realmNum + 1][0] = realmName;
    }

    // Fill data cells
    for (let row = 1; row < numRows; row++) {
      let realmName = spreadsheet[row][0];
      for (let col = 1; col < numCols; col++) {
        let dateRange = dateRanges[col - 1];
        let realm = dateRange.logins.find(element => element.realm.replace(',', '.') == realmName);
        spreadsheet[row][col] = realm.count;
      }
    }

    // Output to CSV
    let report = '';
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        report += spreadsheet[row][col] + ',';
      }
      report += '\n'
    }

    return report;
  }

  function sortRealms(a, b) {
    let aName = a.displayName ? a.displayName.toUpperCase() : a.id;
    let bName = b.displayName ? b.displayName.toUpperCase() : b.id;
    var orderBool = aName > bName;
    return orderBool ? 1 : -1;
  }

  function sortDateRanges(a, b) {
    var orderBool = a.startDate > b.startDate;
    return orderBool ? 1 : -1;
  }

module.exports = { activeMonthlyUsersReport };