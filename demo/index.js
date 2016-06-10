/**
 * Created by yordan on 6/10/16.
 */
'use strict';

// set environment and config =========================================
process.env.NODE_ENV = 'development';
process.env.NODE_CONFIG_DIR = './';

let config = require('config');


let Sequelize = require('sequelize');
let sequelize = new Sequelize(
	config.get('DB.NAME'),
	config.get('DB.USER'),
	config.get('DB.PASSWORD'),
	{
		host: config.get('DB.HOST'),
		dialect: config.get('DB.DIALECT')
	}
);

let currency = require('../index')(sequelize);

// Create table if not exists
currency.CurrencyRate.sync();

// try to fetch data
currency.CurrencyService.fetch().then(r => { console.log('Currency Rates Updated' ,r); });