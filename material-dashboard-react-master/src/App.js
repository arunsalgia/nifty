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
var currLoginState = LOGINSTATE.transientState;
var currLoginState = LOGINSTATE.transientState;


function getCurrent() {
  let myCurr = LOGINSTATE.transientState;
  if (localStorage.getItem("currLoginState") !== undefined)
    myCurr = parseInt(localStorage.getItem("currLoginState"));
  return myCurr;
}

function setCurrent(newState) {
  let myCurr = getCurrent();
  localStorage.setItem("currLoginState", newState);
  if (myCurr !== newState)
    cdRefresh();
  return
}

export function setLoggedState(num) {
  //myTabPosition = num;
  if (num > 0) {
    currLoginState = LOGINSTATE.loggedState;
    localStorage.getItem("menuValue", num);
  } else if (num < 0) {
    currLoginState = LOGINSTATE.unLoggedState;
    localStorage.setItem("uid", "");
  } else {
    currLoginState = LOGINSTATE.transientState;
    localStorage.setItem("uid", "");
  }
  setCurrent(currLoginState);
}

const hist = createBrowserHistory();

// function checkJoinGroup(pathArray) {
//   let sts = false;
//   if ((pathArray[1].toLowerCase() === "joingroup") && (pathArray.length === 3) && (pathArray[2].length > 0)) {
//     localStorage.setItem("joinGroupCode", pathArray[2]);
//     sts = true;
//   }
//   return sts;
// }

function initCdParams() {
  // localStorage.setItem("joinGroupCode", "");
  let ipos = 0;
  if ((localStorage.getItem("tabpos") !== null) &&
  (localStorage.getItem("tabpos") !== "") ) {
    ipos = parseInt(localStorage.getItem("tabpos"));
    if (ipos >= process.env.REACT_APP_BASEPOS) localStorage.setItem("tabpos", ipos-process.env.REACT_APP_BASEPOS);
  } else
    localStorage.setItem("tabpos", 0);
  console.log(`ipos: ${ipos}   Tabpos ${localStorage.getItem("tabpos")}`)
}



function AppRouter() {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user, setUser]);
  const [myLogout, setMyLogout] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  var idleTimer = null;

  useEffect(() => {       
    const chkLogStatus = async () => {
      let status = false;
      let newLoginState = getCurrent();
      // console.log(`original state is ${newLoginState}`);
      if (getCurrentuser() > 0) {
        let resp = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/islogged/${localStorage.getItem("uid")}`);
        // console.log(`islogged response`);
        // console.log(resp);
        if (resp.data.status) {
          status = true;
          newLoginState = LOGINSTATE.loggedState;
        } else {
          localStorage.setItem("uid", "");
          newLoginState = LOGINSTATE.unLoggedState;
        }
      } else {
        localStorage.setItem("uid", "");
        newLoginState = LOGINSTATE.unLoggedState;
      }
      // console.log(`islogged status ${status}`)
      // console.log(`modified state is ${newLoginState}`)
      setIsLogged(status);
      setCurrent(newLoginState);
    }
    // console.log(`Menu value is ${localStorage.getItem("menuValue")}`);
    // console.log(`Gid is ${localStorage.getItem("uid")}  just before checking is logged`);
    chkLogStatus();
}, []);


  function DispayTabs() {
    if (getCurrent() === LOGINSTATE.loggedState)
      return (
      <div>
        <CricDreamTabs/>
        <IdleTimer
        ref={ref => { idleTimer = ref }}
        timeout={1000 * 60 * 1}
        onActive={handleOnActive}
        // onIdle={handleOnIdle}
        onAction={handleOnAction}
        debounce={250}
      />
      </div>
      )  
    else if (getCurrent() === LOGINSTATE.unLoggedState)
      return (<SignIn/>);
    else
        return(<div><h3>Transcient state</h3></div>);
  }
      // if (localStorage.getItem("currentLogin") === "SIGNUP")
      //   return (<SignUp/>)
      // else if (localStorage.getItem("currentLogin") === "RESET")
      //   return (<ForgotPassword/>)
      // else


  // localStorage.clear()
  window.onbeforeunload = () => Router.refresh();
  console.log("in before unload");
  // localStorage.clear();
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
    //console.log('user is active', event);
    // console.log('time remaining', idleTimer.getRemainingTime());
    //console.log(localStorage.getItem("uid"));
    // if (localStorage.getItem("uid").length > 0)
    //   await axios.get(`/user/heartbeat/${localStorage.getItem("uid")}`);
  }

  async function handleOnAction (event) {
    //console.log(localStorage.getItem("uid"));
    // if (localStorage.getItem("uid").length > 0)
    //   await axios.get(`/user/heartbeat/${localStorage.getItem("uid")}`);
  }


  async function handleOnIdle (event) {
    console.log('user is idle', event);
    console.log('last active', idleTimer.getLastActiveTime());
    if (localStorage.getItem("uid").length > 0) {
      setMyLogout(true);
      await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/logout/${localStorage.getItem("uid")}`);
    }
  }

  console.log("in Main APP");
//  localStorage.setItem("uid", 4);
  console.log(`isLOgged is ${isLogged}`);
return (
    <Router history={hist}> 
    <UserContext.Provider value={value}>
    </UserContext.Provider>
    <DispayTabs />
    </Router>
  );

}

export default AppRouter;
