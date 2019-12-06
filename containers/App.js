import React, {Component} from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import './App.less';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
          header: "Welcome to AuroraCast",
          subheader: "Please enable your location to retrieve data."
        };
    }
    render () {
        return (
        <div className = "App">
            <Header header = {this.state.header} subheader = {this.state.subheader}/>
            <Footer />
        </div>
        );
    }
}