require('dotenv').config();
const jwt = require('jsonwebtoken');

export const generateId = (
	
) => {
	const unicId = '' + Date.now();
	return unicId.substring(
        unicId.length - 7,
        unicId.length
    );
};