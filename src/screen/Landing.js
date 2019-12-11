import React from 'react';


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }
    componentDidMount() {
        if ( sessionStorage.getItem("accesstoken") && sessionStorage.getItem("userid") ) {
            this.props.history.push(`/app`);
        }
        else {
            this.props.history.push(`/auth`)
        }
    }



    render() {
        return <div>test</div>
    }
    
}
