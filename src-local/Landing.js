// This example is live editable
import React, { Component } from 'react';

import { Route, Link, withRouter } from 'react-router-dom';
import App from './screens/Main';
import Landing from './screens/Main';

class App extends Component {

  render() {

    return (
      <div className="App">
              <Route path='/' exact component={Landing}/> 
              <Route path='/app' exact component={App}/>
      </div>
    );
  }
}

export default App;