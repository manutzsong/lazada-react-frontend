// This example is live editable
import React, { Component } from 'react';

import { Route} from 'react-router-dom';
import Landing from './screen/Landing';
import Auth from './screen/Auth';
import Success from './screen/Success';
import MainTransaction from './screen/MainTransaction';

class App extends Component {

  render() {
    if ( sessionStorage.getItem("accesstoken") ) {
      return (
        <div className="App">
                <Route path='/' exact component={MainTransaction}/> 
                <Route path='/app' exact component={MainTransaction}/>
                <Route path='/auth' exact component={Auth}/>
                <Route path='/success' exact component={Success}/>
        </div>
      );
    }
    else {
      return (
        <div className="App">
                <Route path='/' exact component={Landing}/> 
                <Route path='/app' exact component={Auth}/>
                <Route path='/auth' exact component={Auth}/>
                <Route path='/success' exact component={Success}/>
        </div>
      );
    }

    
  }
}

export default App;