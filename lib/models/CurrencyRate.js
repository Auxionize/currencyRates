/**
 * Created by yordan on 6/9/16.
 */
'use strict';

const co = require('co');
const base = 'EUR';

module.exports = function (sequelize) {
	let DataTypes = sequelize.Sequelize;

	let CurrencyRate = sequelize.define('CurrencyRate', {
		date: {
			type: DataTypes.DATE
		},
		baseCurrency: {
			type: DataTypes.STRING,
			allowNull: false
		},
		targetCurrency: {
			type: DataTypes.STRING,
			allowNull: false
		},
		rate: {
			type: DataTypes.DECIMAL(20, 10),
			allowNull: false
		}
	}, {
		instanceMethods: {},
		timestamps: true,
		classMethods: {
			//return last known rate for currency against baseCurrency
			getRate: function (currency, baseCurrency) {
				return co(function*() {
					baseCurrency = baseCurrency || base;

					let data = yield CurrencyRate.findOne({
						where: {
							targetCurrency: currency,
							baseCurrency: baseCurrency
						},
						order: ['date', 'DESC']
					});

					if (!data) {
						throw new Error("Unknown currency");
					}

					return data.rate;
				})
			},
			//convert VALUE number from currency FROM to currency TO, use last known rate
			convert: function (value, from, to, baseCurrency) {
				baseCurrency = baseCurrency || base;

				return co(function*() {

					if (from == to) {
						return value;
					}

					// find exactly currencies
					let rate = yield CurrencyRate.findOne({
						where: {
							baseCurrency: from,
							targetCurrency: to
						},
						order: [['date', 'DESC']]
					});

					if (rate) {
						return value * rate.rate;
					}

					rate = yield CurrencyRate.findOne({
						where: {
							baseCurrency: to,
							targetCurrency: from
						},
						order: [['date', 'DESC']]
					});

					if (rate) {
						return value / rate.rate;
					}

					//use crossed rates
					let fromCurrency = yield CurrencyRate.findOne({
						where: {
							baseCurrency: baseCurrency,
							targetCurrency: from},
						order: [ ['date', 'DESC'] ]
					});

					let toCurrency = yield CurrencyRate.findOne({
						where: {
							baseCurrency: baseCurrency,
							targetCurrency: to
						},
						order: [['date', 'DESC']]
					});

					if (!fromCurrency) {
						throw new Error(`Unknown currency ${from}`);
					}

					if (!toCurrency) {
						throw new Error(`Unknown currency ${to}`);
					}

					return (value*toCurrency.rate/fromCurrency.rate);

				});
			}
		},
		indexes: [{
			unique: true,
			fields: ['date', 'baseCurrency', 'targetCurrency']
		}]
	});

	CurrencyRate.baseCurrency = base;

	return CurrencyRate;
};

module.exports.baseCurrency = base;