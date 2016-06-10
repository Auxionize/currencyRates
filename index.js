/**
 * Created by yordan on 6/9/16.
 */
'use strict';

module.exports = function(sequelize) {
	let CurrencyRate = require('./lib/models/CurrencyRate')(sequelize);
	let CurrencyService = require('./lib/service');

	CurrencyService.init(CurrencyRate);

	return {CurrencyRate, CurrencyService};
};