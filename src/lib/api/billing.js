import axios from 'axios';

export const getChargeItems = () => axios.get('/v1/billing/getChargeItems');

//export const getPaymentToken = ({UID, itemid}) => axios.post('/v1/billing/getPaymentToken', {UID, itemid});
export const getPaymentToken = ({token, itemid}) => axios.post('/v1/billing/getPaymentToken', {itemid}, {headers: {Authorization: "Bearer "+token}});

export const getHash = ({token, service_id, external_id, item_id, item_name, item_amount}) => axios.post('/v1/billing/getDeductHash', { service_id, external_id, item_id, item_name, item_amount}, {headers: {Authorization: "Bearer "+token}});

export const testBuyItem = ({token, service_id, external_id, item_id, item_name, item_amount, hash}) => axios.post('/v1/billing/buyItem', { external_id, service_id, item_id, item_name, item_amount, hash}, {headers: {Authorization: "Bearer "+token}});