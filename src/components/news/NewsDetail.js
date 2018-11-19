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
export default class NewsDetail extends Component {
	constructor(props) {
		super(props);
		this.store = this.props.store;
	}
	render() {
		const { item } = this.store.appState;
		return (
            <Container text style={{ marginTop: '5em' }}>
                <div className="page post">
                    <Link to="/news">← Back to News</Link>
                    {!!item &&
                        <article>
                            <h1>{item.title}</h1>
                            <p>{item.body}</p>
                        </article>}

                </div>
            </Container>    
		);
	}
}
