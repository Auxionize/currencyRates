'use strict';

/**
 * This module does two things:
 *
 * 1. Fetch rates from external source
 * 2. Store result in DB model CurrencyRate
 */

/**
 * typedef {object} RateItem
 * @property {Date} date at which the rate is
 * @property {string} baseCurrency 3-letter currency code
 * @property {string} targetCurrency 3-letter currency code
 * @property {number} rate 1 baseCurrency = rate targetCurrency
 */

const _ = require('lodash');
const defaultOptions = {
	dataSource: 'ecb',
	currencies: ['EUR', 'USD', 'BGN', 'MYR']
};
let CurrencyRate;

function mapAsync(arr, mapperAsync) {
	let promise = Promise.resolve(), result = [];

	arr.forEach(item => {
		promise = promise.then(() => mapperAsync(item).then(r => result.push(r)));
	});

	return promise.then(() => result);
}

if(require.main === module) {
	const argv = require('yargs').argv;

	let options = _.defaults({
		dataSource: argv.datasource
	}, defaultOptions);

	console.log(`Fetching currency rates (${options.currencies.join(', ')}) from ${options.dataSource} ...`);

	module.exports.fetch(options).then(function (rates) {
		console.log('Done.', JSON.stringify(rates, null, '\t'));
	});
}

module.exports = {
	init: function(model) {
		CurrencyRate = model;
	},
	fetch: function(options) {
		options = _.defaults({}, options, defaultOptions);

		const dataSource = require(`./datasources/${options.dataSource}`);

		let p = Promise.resolve();
		return p.then(function () {
			return dataSource({
				currencies: options.currencies
			}).then(function (rates) {
				return mapAsync(rates, CurrencyRate.upsert.bind(CurrencyRate));
			});
		});
	}
};