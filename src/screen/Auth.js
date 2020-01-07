import React from 'react';
import Button from '@material-ui/core/Button';
import queryString from 'query-string';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "",
    };
  }
  componentDidMount() {

  }

  checkCode = () => {

  }

  authMe = () => {
    const { addon, chrome_path, chromeToken } = queryString.parse(this.props.location.search);
    console.log(queryString.parse(this.props.location.search));
    let url = "https://manutzsong-laz.ddns.net/#/success";
    if (chrome_path && addon) {
      url = `https://manutzsong-laz.ddns.net/#/success?addon=true&chrome_path=${chrome_path}&chromeToken=${chromeToken}`;

    }
    else {
      
    }


    url = encodeURIComponent(url);
    window.location = `https://auth.lazada.com/oauth/authorize?response_type=code&redirect_uri=${url}&force_auth=true&client_id=114729`;
    // if (chromeToken) {
    //   if (addon && chrome_path) {
    //     console.log(chrome_path);
    //     url = `https://manutzsong-laz.ddns.net/#/success?addon=true&chrome_path=${chrome_path}&chromeToken=${chromeToken}`;
    //   }
    //   else {
    //     url = `https://manutzsong-laz.ddns.net/#/success?chromeToken=${chromeToken}`;
    //   }
    //   url = encodeURIComponent(url);
    //   window.location = `https://auth.lazada.com/oauth/authorize?response_type=code&redirect_uri=${url}&force_auth=true&client_id=114729`;
    // }
    // else {
    //   alert("NO ACCESS");
    // }



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
