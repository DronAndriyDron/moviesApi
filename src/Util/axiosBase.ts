import axios from 'axios';

require('dotenv').config();

export const $omdApi = axios.create({
	baseURL: process.env.OMD_API,
	params: {
		apiKey: process.env.PARAM_OMDAPI_API_KEY
	}
});
