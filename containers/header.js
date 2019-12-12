import React from 'react';

export class Header extends React.Component {
    constructor(props) {
        super(props);
      }
    
    render(){
        return(
        <div className = "header_container">
            <div className="header">
                <h1> {this.props.header} </h1>
                <h2> {this.props.subheader_1} </h2>
                <h2> {this.props.subheader_2}</h2>
            </div>
        </div>
        )
    }
}