import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Dimmer, Loader, Segment, Card, Icon, Button, Image, Message } from 'semantic-ui-react'

//import Protected from "../wrapper/Protected";
import ChargeDataWrapper from '../wrapper/ChargeDataWrapper';
import Script from 'react-load-script'

//@Protected
@ChargeDataWrapper
@withRouter
@inject("store")
@observer
class Payment extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.store;
        //this.store.appState.checkAuth();
        //console.log(this.store.appState.authenticated);
    }

    /*
    componentDidMount(){
        console.log(this.store.appState.authenticated);
		if (this.store.appState.authenticated != true) {
			const {history} = this.props;
			this.store.billingState.setSuccessFlashMessage('You need login.');
			history.push('/');
        }  
    }
    */

    handleOpenPay= (e, { value }) => {
        e.preventDefault();
		{/* add the rest of the function here */}
        this.store.appState.setLoading('on');

        const {history} = this.props;
        //uid, itemid, history
        var UID = this.store.appState.loggedInUserInfo.UID;
        this.store.billingState.openPay(UID, value, history, this.store.appState)
    }

    render() {
        const { history } = this.props;
        const { chagrgeItems, errorFlash, successFlash } = this.store.billingState;
        const { loggedInUserInfo, loading } = this.store.appState;

        var successFlashView = null;
        if(successFlash) {
            successFlashView = (
                <Message success visible size='tiny'>{successFlash}</Message>
            );
        }

        var errorFlashView = null;
        if(errorFlash) {
            errorFlashView = (
                <Message error visible size='tiny'>{errorFlash}</Message>
            );
        }

        const loaderView = (
            <Dimmer active inverted>
                <Loader size='huge'></Loader>
            </Dimmer>
        )

        return (
            <Container text style={{ marginTop: '5em' }}>
                { loading === 'on' ? loaderView : null  }
                {successFlashView}
                {errorFlashView}
                <Card.Group itemsPerRow={3} >
                    {chagrgeItems.slice(0, chagrgeItems.length).map(item => 
                        <Card key={item.itemid} >
                            <Card.Content>
                                <Icon name='diamond'/>
                                <Card.Header>
                                    {item.item_name}
                                </Card.Header>
                                <Card.Meta>
                                    <Icon name='dollar'/>{item.price}
                                </Card.Meta>
                                <Card.Description>
                                    <strong>{item.amopunt}</strong>
                                    {item.item_description}
                                </Card.Description>
                            </Card.Content>
                            <Card.Content extra>
                                <div className='ui two buttons'>
                                    <Button basic color='green' value={item.itemid} onClick={this.handleOpenPay.bind(this)}>BUY</Button>
                                </div>
                            </Card.Content>
                        </Card>
                    )} 
                </Card.Group>

                <button data-xpaystation-widget-open id="buyXsolla" hidden="hidden">Buy Credits</button>
                <Script url="https://static.xsolla.com/embed/paystation/1.0.7/widget.min.js"/>
            </Container>
        );
    }
}


export default Payment;