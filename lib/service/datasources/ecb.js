'use strict';

/**
 * Fetch currency rate info from European Central Bank (ECB)
 */

const _ = require('lodash');
const http = require('http');
const xml2js = require('xml2js');

const DATA_URL = 'http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

/**
 * Promisifyed version of http.get()
 *
 * @param {string} url
 * @returns {Promise}
 */
function getAsync(url) {
	return new Promise(function (fulfill, reject) {
		/*
		 * Accumulate incoming stream in a string. Not the best solution, but will do.
		 */
		let body = '';
		http.get(url, function (incoming) {
			incoming.on('data', chunk => body += chunk);
			incoming.on('end', () => fulfill(body));
		}).on('error', reject);
	});
}

/**
 * Asyncronously parse XML string
 *
 * @param {string} xmlString
 * @returns {Promise} for a plain Javascript object
 */
function parseAsync(xmlString) {
	// Parse xml to js object
	return new Promise(function (fulfill, reject) {
		xml2js.parseString(xmlString, function (err, result) {
			if (err) reject(err); else fulfill(result);
		});
	});
}

/**
 * Convert
 * @param obj
 * @returns {*}
 */
function convert(obj, options) {
	let baseCurrency = 'EUR';

	return obj['gesmes:Envelope'].Cube[0].Cube.map(function (Cube) {
		let date = new Date(Cube.$.time),
			rates = Cube.Cube;

		return rates
			.filter(rate => !options.currencies.length || options.currencies.indexOf(rate.$.currency) >= 0)
			.map(rate => ({
				baseCurrency: baseCurrency,
				targetCurrency: rate.$.currency,
				rate: rate.$.rate,
				date: date
			}));

	});
}

/**
 * @return Promise<Array.<RateItem>>
 */
module.exports = function fetch(options) {
	_.defaults(options, {
		url: DATA_URL,
		currencies: null
	});

	return getAsync(options.url).then(parseAsync).then(function (obj) {
		return convert(obj, options);
	}).then(_.flatten);
};