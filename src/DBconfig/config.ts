import { DataSource } from 'typeorm';

require('dotenv').config();

const dbport =
	parseInt(process.env.DB_PORT as string) || 5432;
export const myDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: dbport,
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	entities: [`${__dirname}/../**/*.entity.{js,ts}`],
	logging: true,
	synchronize: true
});
