import { myDataSource } from './DBconfig/config';
import Router from './Routers';

const cors = require('cors');
const express = require('express');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

myDataSource
	.initialize()
	.then(() => {
		console.info('Data Source has been initialized!');
	})
	.catch(err => {
		console.error(
			'Error during Data Source initialization:',
			err
		);
	});

// create and setup express app
const app = express();

app.use(express.json());
app.use(cors());

app.use('/', Router);

app.listen(PORT);
console.info(`Running on http://${PORT}`);
