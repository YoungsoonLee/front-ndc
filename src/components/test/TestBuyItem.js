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

    state = { itemName: '', amount: 0 };

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


    handleBuyItem(e) {
        e.preventDefault();
        const { history } = this.props;
        //this.store.updatePassword(this.store.userInfo.password, this.state.confirmPassword,history);
    }

    render() {
        
        //const { error, errorFlash, successFlash } = this.store.billingState;
        const { error, errorFlash, successFlash, profileEmail, profileDisplayname, profileProvider, userInfo, loading } = this.store;

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
                        Buy Game Item for Test
                    </p>
                    <hr />
                    <Form className='attached fluid segment' style={{ maxWidth: 600 }}>
                        <Form.Input label='Item Name' name='itemName' placeholder='item name' type='text' value={this.state.itemName} onChange={this.handleInputItemName}/>
                        <Form.Input label='Amount' name='amount' placeholder='item name' type='text' value={this.state.amount} onChange={this.handleInputAmount}/>
                        <div>
                            { error !== null ? ErrorView : null }
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