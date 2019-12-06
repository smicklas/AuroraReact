import React from 'react';

export class Header extends React.Component {
    render(){
        return(
        <div className="header">
            <h1> {this.props.header} </h1>
            <h2> {this.props.subheader} </h2>
        </div>
        )
    }
}