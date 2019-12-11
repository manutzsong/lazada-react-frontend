import React from 'react';

import axios from 'axios';
import Button from '@material-ui/core/Button';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code : "",
        };
    }
    componentDidMount() {
      
    }

    checkCode = () => {

    }

    authMe = () => {
      let url = "https://manutzsong-laz.ddns.net/#/success";
      url = encodeURIComponent(url);
      window.location = `https://auth.lazada.com/oauth/authorize?response_type=code&redirect_uri=${url}&force_auth=true&client_id=114729`;
      
    }


    render() {
        return (<div className="container d-flex vh-100 justify-content-center">
        <div className="align-self-center align-items-center d-flex">
          <div>
            <Button variant="contained" color="primary" onClick={() => this.authMe()}>
              Authorize Application
            </Button>
          </div>
        </div>
      </div>);
    }
}
