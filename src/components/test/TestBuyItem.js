import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Dimmer, Loader, Form, Button, Message } from 'semantic-ui-react'

import Protected from "../Protected";

@Protected
@withRouter
@inject("store")
@observer
class TestBuyItem extends Component {

    state = { external_id: '1', item_id: '1', itemName: 'test-item', amount: 100 };

    constructor(props) {
        super(props);
        this.store = this.props.store;
    }


    handleInputItemName = (e, {value}) => {
        this.setState({ itemName: value });
    }

    handleInputAmount = (e, {value}) => {
        this.setState({ amount: value });
    }

    handleInputExternalId = (e, {value}) => {
        this.setState({ external_id: value });
    }

    handleInputItemId = (e, {value}) => {
        this.setState({ item_id: value });
    }

    handleBuyItem(e) {
        e.preventDefault();
        if (this.state.itemName == '') {
            // error
        }else {
            this.store.appState.setLoading('on');
            const { history } = this.props;
            //this.store.updatePassword(this.store.userInfo.password, this.state.confirmPassword,history);
            this.store.billingState.testBuyItem(this.store.appState, this.store.billingState, this.state.external_id, this.state.item_id, this.state.itemName, this.state.amount, history);

        }   
    }


    render() {
        
        //const { error, errorFlash, successFlash } = this.store.billingState;
        const { error, errorFlash, successFlash} = this.store.billingState;
        const { loading } = this.store.appState;

        //const { loading } = this.store.appState;
        var ErrorView = null;
        /* 
        ErrorView = (
            <Message error visible size='tiny'>{error}</Message>
        );
        */

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
                <div className="page posts">
                    
                    <p className="subheader">
                        Buy Game Item for Test ...
                    </p>
                    <hr />
                    <Form className='attached fluid segment' style={{ maxWidth: 600 }}>
                        <Form.Input label='External ID' name='externalId' placeholder='External ID' type='text' value={this.state.external_id} onChange={this.handleInputExternalId}/>
                        <Form.Input label='Item ID' name='itemId' placeholder='Item ID' type='text' value={this.state.item_id} onChange={this.handleInputItemId}/>
                        <Form.Input label='Item Name' name='itemName' placeholder='item name' type='text' value={this.state.itemName} onChange={this.handleInputItemName}/>
                        <Form.Input label='Amount' name='amount' placeholder='item amount' type='text' value={this.state.amount} onChange={this.handleInputAmount}/>
                        <div>
                        { errorFlashView }
                        { successFlashView }
                    </div>
                        <br/>
                        { loading === 'on' ? loaderView : null  }
                        <Button color='blue' onClick={this.handleBuyItem.bind(this)}>Buy Game Item for Test</Button>
                    </Form>
                </div>
            </Container>
        );
    }
}


export default TestBuyItem;