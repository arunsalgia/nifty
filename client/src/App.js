import React from 'react';
import './App.css';
import {
  //BrowserRouter as Router,
  Route 
} from "react-router-dom"
import Grid from "@material-ui/core/Grid";
import HomePage from "./pages/HomePage";
import SignUp from "./pages/sign-up/SignUp";
import SignIn from "./pages/sign-in/SignIn";
import Auction from "./pages/Auction/Auction"
import MyTeam from "./pages/MyTeam/MyTeam";
import Dashboard from "./pages/Dashboard/Dashboard";
import NavBar from "./NavBar";

function App() {
  return (
    <Router>
    <div className="App">
    <Grid
  container
  direction="column"
  justify="center"
  alignItems="center"
  spacing={4}
>
<Grid item xs={12}>
    <NavBar/>
    </Grid>
    <Grid item xs={12}>
    <div id="page-body">
     <Route path="/" component ={HomePage} exact/>
     <Route path="/auction" component ={Auction} exact/>
     <Route path="/signUp" component ={SignUp} exact/>
     <Route path="/signIn" component ={SignIn} exact/>
     <Route path="/myTeam" component ={MyTeam} exact/>
     <Route path="/Dashboard" component ={Dashboard} exact/>
    </div>
    </Grid>
    </Grid>
    </div>
    </Router>
  );
}

export default App;
