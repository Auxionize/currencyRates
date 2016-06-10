'use strict';

/**
 * Fetch currency rate info from European Central Bank (ECB)
 */


const _ = require('lodash');
const DATA_URL = 'http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml';
const fetch = require('./ecb');

/**
 * @return Promise<Array.<RateItem>>
 */
module.exports = function (options) {
	_.defaults(options, {
		url: DATA_URL
	});

	return fetch(options);
}