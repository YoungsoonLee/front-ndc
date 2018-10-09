import axios from 'axios';

export const getChargeItems = () => axios.get('/v1/billing/getChargeItems');
export const getPaymentToken = ({UID, itemid}) => axios.post('/v1/billing/getPaymentToken', {UID, itemid});