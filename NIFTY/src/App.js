import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { UserContext } from "./UserContext";
import Admin from "layouts/Admin.js";
import "assets/css/material-dashboard-react.css?v=1.9.0";
// import { DesktopWindows } from "@material-ui/icons";
import { CricDreamTabs, setTab }from "CustomComponents/CricDreamTabs"
import SignIn from "views/Login/SignIn.js";
import SignUp from "views/Login/SignUp.js";
// import JoinGroup from "views/Group/JoinGroup.js"
import ForgotPassword from "views/Login/ForgotPassword.js";
import IdleTimer from 'react-idle-timer'
import axios from 'axios';

import {getCurrentuser, cdRefresh} from "views/functions"

const LOGINSTATE = {transientState: -1, unLoggedState: 0, loggedState: 1}


export function setLoggedState(num) {
  if (num > 0) {
    sessionStorage.getItem("menuValue", num);
  } else if (num < 0) {
    sessionStorage.setItem("uid", "");
  } else {
    sessionStorage.setItem("uid", "");
  }
}

const hist = createBrowserHistory();


function initCdParams() {
  let ipos = 0;
  if ((sessionStorage.getItem("tabpos") !== null) &&
  (sessionStorage.getItem("tabpos") !== "") ) {
    ipos = parseInt(sessionStorage.getItem("tabpos"));
    if (ipos >= process.env.REACT_APP_BASEPOS) sessionStorage.setItem("tabpos", ipos-process.env.REACT_APP_BASEPOS);
  } else
  sessionStorage.setItem("tabpos", 0);
  console.log(`ipos: ${ipos}   Tabpos ${sessionStorage.getItem("tabpos")}`)
}



function AppRouter() {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user, setUser]);
  // const [myLogout, setMyLogout] = useState(false);
  // const [isLogged, setIsLogged] = useState(false);
  var idleTimer = null;

  useEffect(() => {       
    const chkLogStatus = async () => {
      let status = false;
      if (getCurrentuser() > 0) {
        let resp = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/islogged/${sessionStorage.getItem("csuid")}`);
        // console.log(resp.data);
        if (resp.data.status) {
          status = true;
        } else {
          sessionStorage.setItem("uid", "");
          sessionStorage.setItem("csuid", "");
        }
      } else {
        sessionStorage.setItem("uid", "");
        sessionStorage.setItem("csuid", "");
      }
    }
    chkLogStatus();
}, []);


  function DispayTabs() {
    if (getCurrentuser() > 0)
      return (
      <div>
        <CricDreamTabs/>
        {/* <IdleTimer
        ref={ref => { idleTimer = ref }}
        timeout={1000 * 60 * 1}
        onActive={handleOnActive}
        // onIdle={handleOnIdle}
        onAction={handleOnAction}
        debounce={250}
      /> */}
      </div>
      )  
    else 
      return (<SignIn/>);
  }
      // if (sessionStorage.getItem("currentLogin") === "SIGNUP")
      //   return (<SignUp/>)
      // else if (sessionStorage.getItem("currentLogin") === "RESET")
      //   return (<ForgotPassword/>)
      // else


  // sessionStorage.clear()
  window.onbeforeunload = () => Router.refresh();
  console.log("in before unload");
  // sessionStorage.clear();
  // console.log("clearing local storage");
    initCdParams();

  // return (
    // <Router history={hist}> 
  //     <UserContext.Provider value={value}>
  //       {!user && <Redirect from="/" to="/signIn" />}
        // <Route path="/joingroup" component={JoinGroup} />
  //       <Route path="/admin" component={value ? Admin : SignIn} />
  //       <Redirect from="/" to="/signIn" />
  //     </UserContext.Provider>
    // </Router>
  // );


  
  async function handleOnActive (event) {
    console.log('user is active', event);
    // console.log('time remaining', idleTimer.getRemainingTime());
    //console.log(sessionStorage.getItem("uid"));
    // if (sessionStorage.getItem("uid").length > 0)
    //   await axios.get(`/user/heartbeat/${sessionStorage.getItem("uid")}`);
  }

  async function handleOnAction (event) {
    console.log(`Action from user ${sessionStorage.getItem("uid")}`);
    // if (sessionStorage.getItem("uid").length > 0)
    //   await axios.get(`/user/heartbeat/${sessionStorage.getItem("uid")}`);
  }


  async function handleOnIdle (event) {
    console.log('user is idle', event);
    console.log('last active', idleTimer.getLastActiveTime());
    // if (sessionStorage.getItem("uid").length > 0) {
    //   setMyLogout(true);
    //   await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/logout/${sessionStorage.getItem("uid")}`);
    // }
  }

  // console.log("in Main APP");
//  sessionStorage.setItem("uid", 4);
  // console.log(`isLOgged is ${isLogged}`);
return (
    <Router history={hist}> 
    <UserContext.Provider value={value}>
    </UserContext.Provider>
    <DispayTabs />
    </Router>
  );

}

export default AppRouter;
