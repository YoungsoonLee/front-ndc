import { observable, action } from "mobx";
import axios from "axios";

import storage from '../lib/storage';
import * as BillingAPI from '../lib/api/billing';

// store at billing
export default class BillingState {
    @observable chagrgeItems;
    @observable errorFlash;
    @observable successFlash;
    @observable historyMode;

    constructor() {
        this.chagrgeItems = [];
        this.errorFlash = null;
        this.successFlash = null;
        this.historyMode = 'charge';
    }

    @action setHistoryMode(mode) {
        this.historyMode = mode;
    }

    @action setChagrgeItems(items) {
        this.chagrgeItems = items;
    }


    @action setSuccessFlashMessage(msg) {
        this.successFlash = msg;
    }

    @action setErrorFlashMessage(msg) {
        this.errorFlash = msg;
    }

    async fetchChagrgeItems() {
        let data = null;
        try{
            data = await BillingAPI.getChargeItems();
        }catch(err){
            //this.errorFlash = err.response.data.message;
            this.setErrorFlashMessage(err.response.data.message);
        }

        if(data) {
            //console.log(data.data.data);
            // itemId, itemName, itemPrice
            this.setChagrgeItems(data.data.data);
        }else{
            //this.errorFlash = 'Something wrong to get payment items. try agin.';
            this.setErrorFlashMessage('Something wrong to get payment items. try agin.');
        }
    }
 
    async openPay(UID, itemid, history, appState) {
        //-------
        var complete = false;
        var waiting = false;
        var failed = false;
        var invoice;

        var success_url = 'http://localhost:3000/payment/history'

        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = '//static.xsolla.com/embed/paystation/1.0.7/widget.min.js';

        s.addEventListener(
            'load',
            function(e) {
                XPayStationWidget.on('close', function() {
                    //complete
                    //if (complete) window.location.href = success_url //+'?trx_id='+transactionId;
                    if (complete) history.push('/payment/history'); //+'?trx_id='+transactionId;
                    if (failed) window.location.href = '';
                });

                XPayStationWidget.on(
                    'status-invoice status-delivering status-troubled status-done',
                    function(event, data) {
                        console.log(arguments[0].type);
                        
                        if (arguments[0].type == 'status-done') {
                            complete = true;
                            //transactionId = data.paymentInfo.invoice; //set invoce to transactionId
                        }

                        if (arguments[0].type == 'status-delivering')
                            waiting = true;
                        if (arguments[0].type == 'status-troubled') failed = true;
                    }
                );
            },
            false
        );

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(s);

        //--------
        //console.log(user_id, item_id);

        //check inputs
        if( (!UID) || (!itemid) ) {
            //this.errorFlash = 'You should sign in first.'
            //go to login
            history.push('/login');
        }else{
            var options = {
                access_token: '',
                lightbox: {
                    spinnerColor: '#cccccc',
                    closeByClick: false,
                    closeByKeyboard: false
                },
                sandbox: false
            };
    
            let paymentToken = null;
            try{
                paymentToken = await BillingAPI.getPaymentToken({UID, itemid});
            }catch(err) {
                //this.errorFlash = err.response.data.message;
                this.setErrorFlashMessage(err.response.data.message);
            }

            appState.setLoading('off');
    
            if(!paymentToken) {
                //this.errorFlash = 'something wrong. please try again.'
                this.this.setErrorFlashMessage('something wrong. please try again.');
            }else{
                console.log(paymentToken.data.data);

                options.access_token = paymentToken.data.data.token;
    
                if (paymentToken.data.data.mode === 'sandbox') {
                    options.sandbox = true;
                }

                console.log("xsolla mode is sandbox? ", options.sandbox);

                XPayStationWidget.init(options);
    
                document.getElementById('buyXsolla').click();
            }
        }
    }

    // this is to payment history.
    async fetchPaymentHistory(appState, history) {
        //console.log('billingState');
        await appState.checkAuth(); // TODO: ??

        if(!appState.authenticated) {
            this.setErrorFlashMessage('Need login first');
            //go to login
            history.push('/login');

        }else{
            //console.log('fetchHistory');

            if(this.historyMode === 'charge') {
                var table = new Tabulator("#tabulator-1", {
                    height:511, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    layout:"fitColumns", //fit columns to width of table (optional)
                    responsiveLayout:true,
                    placeholder:"No Data Available", //display message to user on empty table
                    columns:[ //Define Table Columns
                        {title:"No", formatter:"rownum", align:"center", width:100},
                        {title:"Date", field:"transaction_at", align:"left", formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                return moment(value).format('YYYY-MM-DD HH:mm:ss')
                            }
                        },
                        {title:"Transaction Id", field:"pxid", align:"left"},
                        {title:"Item Name", field:"item_name"},
                        {title:"Price", field:"price",align:"left", formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                return numeral(value).format('$ 0,0.0');
                            }
                        },
                        {title:'Amount of <i aria-hidden="true" class="diamond icon"></i>', field:"amount",align:"left" , formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                //return '<i class="fa fa-diamond" aria-hidden="true"></i> '+numeral(value).format('0,0');
                                return '<i aria-hidden="true" class="diamond icon"></i> '+numeral(value).format('0,0');
                            }
                        },
                    ],
                    /*
                    rowClick:function(e, row){ //trigger an alert message when the row is clicked
                        alert("Row " + row.getData().id + " Clicked!!!!");
                    },
                    */
                });

                //table.setData('http://localhost:8080/v1/billing/getChargeHistory/'+appState.loggedInUserInfo.UID, {}, "POST");
                table.setData('https://api-ndc.herokuapp.com/v1/billing/getChargeHistory/'+appState.loggedInUserInfo.UID, {}, "POST");
                
                //$("#tabulator-1").tabulator("setData", 'http://localhost:8080/v1/billing/getChargeHistory/'+appState.loggedInUserInfo.UID,"POST");

                /*
                $("#tabulator-1").tabulator({});
                $("#tabulator-1").tabulator("destroy");

                $("#tabulator-1").tabulator({
                    layout:"fitColumns",
                    height:511, // set height of table, this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    responsiveLayout:true,
                    //pagination:"local",
                    //paginationSize:20,
                    //movableColumns:true,
                    placeholder:"No Data Available", //display message to user on empty table
                    columns:[ //Define Table Columns
                        //{title:"No", field:"no" , width:100},
                        {title:"No", formatter:"rownum", align:"center", width:100},
                        {title:"Date", field:"transaction_at", align:"left", formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                return moment(value).format('YYYY-MM-DD HH:mm:ss')
                            }
                        },
                        {title:"Transaction Id", field:"pid", align:"left"},
                        {title:"Item Name", field:"item_name"},
                        {title:"Price", field:"price",align:"left", formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                return numeral(value).format('$ 0,0.0');
                            }
                        },
                        {title:'Amount of <i aria-hidden="true" class="diamond icon"></i>', field:"amount",align:"left" , formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                //return '<i class="fa fa-diamond" aria-hidden="true"></i> '+numeral(value).format('0,0');
                                return '<i aria-hidden="true" class="diamond icon"></i> '+numeral(value).format('0,0');
                            }
                        },
                    ],
                });

                $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/billing/getChargeHistory/'+appState.loggedInUserInfo._id);
                $("#tabulator-1").tabulator("redraw", true);
                */
            }else{
                var table = new Tabulator("#tabulator-1", {
                    height:511, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    layout:"fitColumns", //fit columns to width of table (optional)
                    responsiveLayout:true,
                    placeholder:"No Data Available", //display message to user on empty table
                    columns:[ //Define Table Columns
                        {title:"No", formatter:"rownum", align:"center", width:150},
                        {title:"Date", field:"used_at", align:"left", formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                return moment(value).format('YYYY-MM-DD HH:mm:ss')
                            }
                        },
                        {title:"Used Id", field:"id", align:"left"},
                        {title:"Item Name", field:"external_itemname"},
                        {title:'Amount of <i aria-hidden="true" class="diamond icon"></i>', field:"amount",align:"left" , formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                //return '<i class="fa fa-diamond" aria-hidden="true"></i> '+numeral(value).format('0,0');
                                return '<i aria-hidden="true" class="diamond icon"></i> '+numeral(value).format('0,0');
                            }
                        },
                    ],
                    /*
                    rowClick:function(e, row){ //trigger an alert message when the row is clicked
                        alert("Row " + row.getData().id + " Clicked!!!!");
                    },
                    */
                });

                //table.setData('http://localhost:8080/v1/billing/getUsedHistory/'+appState.loggedInUserInfo.UID, {}, "POST");
                table.setData('https://api-ndc.herokuapp.com/v1/billing/getUsedHistory/'+appState.loggedInUserInfo.UID, {}, "POST");

                /*
                $("#tabulator-1").tabulator({});
                $("#tabulator-1").tabulator("destroy");
                //$("#tabulator-1").remove();

                $("#tabulator-1").tabulator({
                    layout:"fitColumns",
                    height:511, // set height of table, this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    responsiveLayout:true,
                    //pagination:"local",
                    //paginationSize:20,
                    //movableColumns:true,
                    placeholder:"No Data Available", //display message to user on empty table
                    columns:[ //Define Table Columns
                        //{title:"No", field:"no" , width:100},
                        {title:"No", formatter:"rownum", align:"center", width:150},
                        {title:"Date", field:"used_at", align:"left", formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                return moment(value).format('YYYY-MM-DD HH:mm:ss')
                            }
                        },
                        {title:"Used Id", field:"deduct_id", align:"left"},
                        {title:"Item Name", field:"item_name"},
                        {title:'Amount of <i aria-hidden="true" class="diamond icon"></i>', field:"item_amount",align:"left" , formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                //return '<i class="fa fa-diamond" aria-hidden="true"></i> '+numeral(value).format('0,0');
                                return '<i aria-hidden="true" class="diamond icon"></i> '+numeral(value).format('0,0');
                            }
                        },
                    ],
                });

                $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/billing/getDeductHistory/'+appState.loggedInUserInfo._id);
                $("#tabulator-1").tabulator("redraw", true);
                */
            }
        }
    }

    // test buy item
    async testBuyItem(appState, billingState, external_id, item_id, item_name, amount, history) {
        
        let cookieInfo = null;
        cookieInfo = storage.get('___GOM___');

        console.log(external_id, item_id, item_name, amount, cookieInfo);
        
        var iAmount = 0;
        iAmount = iAmount+parseInt(amount);

        if ( cookieInfo ) {
            let data = null;
            try{
                //data = await BillingAPI.getHash({token: cookieInfo.token, service_id: 'S1538718691252088000', external_id: external_id, item_id: item_id, item_name: item_name, item_amount: amount});
                axios
                .post('/v1/billing/getDeductHash', { service_id: 'S1538718691252088000', external_txid: external_id, external_itemid: item_id, external_itemname: item_name, iAmount}, {headers: {Authorization: cookieInfo.token}})
                .then(function (response) {
                    // handle success
                    //console.log("rr: ", response);
                    //hash = response.data.data
                    //data = BillingAPI.testBuyItem({token: cookieInfo.token, service_id: "S1538718691252088000", external_id: external_id, item_id: item_id, item_name: item_name, item_amount: amount, hash: response.data.data});
                    axios
                    .post('/v1/billing/buyItem', { service_id: 'S1538718691252088000', external_txid: external_id, external_itemid: item_id, external_itemname: item_name, iAmount, hash: response.data.data}, {headers: {Authorization: cookieInfo.token}})
                    .then(function (response) {
                        console.log("result: ", response, response.data.code);
                        appState.setLoading('off');
                        if (response.data.code == "ok") {
                            billingState.setHistoryMode('used');
                            //this.historyMode = 'used';
                            history.push('/payment/history');
                        }else{
                            // error
                        }
                    }).catch(function (error){
                        appState.setLoading('off');
                        console.log("buyitem error: ", error.response); //error.response.data.message
                        billingState.setErrorFlashMessage(error.response.data.message);
                    
                    });
                    
                }).catch(function(error){
                    console.log("getDeductHash error: ", errror);
                });
            }catch(e){
                //await this.setInitLoggedInUserInfo();
                console.log('error testBuyItem: ', e);
            }

            //console.log(data.data.data);
            /*
            try{
                data = await BillingAPI.testBuyItem({token: cookieInfo.token, service_id: 'S1538718691252088000', external_id: external_id, item_id: item_id, item_name: item_name, item_amount: amount, hash: data.data.data});
            }catch(e){
                //await this.setInitLoggedInUserInfo();
                console.log('error testBuyItem: ', e);
            }

            console.log(data);
            */
            
        }else{
            // go to login
        }

        
    }

    //test
    async TestGetProfile(appState) {
        appState.setInitUserInfo();
        await appState.authenticate();

        console.log('test getProfile: ', appState.loggedInUserInfo._id);

    }
}
