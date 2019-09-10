// @ts-nocheck
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Hello from './ts/compoment/Hello.tsx';

class App extends React.Component {
  render = () => {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Hello} />
        </Switch>
      </Router>
    );
  }
}

export default App;
