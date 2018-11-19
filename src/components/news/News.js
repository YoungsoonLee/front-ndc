import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Dimmer, Loader, Segment, Card, Icon, Button, Image, Message } from 'semantic-ui-react'

import Protected from "../Protected";
import DataWrapper from "../DataWrapper";

@Protected
@DataWrapper
@withRouter
@inject("store")
@observer
class News extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.store;
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

        const { items } = this.store.appState;

        return (
            <Container text style={{ marginTop: '5em' }}>
                <div className="page posts">
                    <h1>News</h1>
                    <p className="subheader">
                        These are just dummy texts.
                    </p>
                    <hr />
                    <ul>
                        {items && items.length
                            ? items.slice(6, 12).map(post => {
                                    return (
                                        <li key={post.id}>
                                            <Link
                                                to={`${this.props.match.path}/${post.id}`}
                                            >
                                                <h1>{post.title}</h1>
                                            </Link>
                                            <p>{post.body.substring(0, 120)}</p>
                                        </li>
                                    );
                                })
                            : "Loading..."}
                    </ul>
                </div>
            </Container>
        );
    }
}


export default News;