import React, { useState, useMemo } from "react";
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

function isUserLogged() {
  console.log(`User is ${localStorage.getItem("uid")}`)
  if ((localStorage.getItem("uid") === "") || 
      (localStorage.getItem("uid") === "0") ||
      (localStorage.getItem("uid") === null))
    return false;
  else
    return true;
}

function AppRouter() {

  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);


  function DispayTabs() {
    // console.log(localStorage.getItem("uid"));
    // console.log(`Status is ${isUserLogged()}`)
    if (isUserLogged())
      return (<CricDreamTabs/>)  
    else {
      if (localStorage.getItem("currentLogin") === "SIGNUP")
        return (<SignUp/>)
      else if (localStorage.getItem("currentLogin") === "RESET")
        return (<ForgotPassword/>)
      else
        return (<SignIn/>)
    }
  }
  // localStorage.clear()
  window.onbeforeunload = () => Router.refresh();
  console.log("in before unload");
  // localStorage.clear();
  // console.log("clearing local storage");
    initCdParams();
    //console.log("GTP "+window.location.pathname.toLowerCase());
    // let mypath = window.location.pathname.split("/");
    // if (checkJoinGroup(mypath)) {
    //   //console.log("join group found");
    //   localStorage.setItem("tabpos", 105);
    //   //history.push("/")
    // } 

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

return (
      <Router history={hist}> 
      <UserContext.Provider value={value}>
      </UserContext.Provider>
      <DispayTabs />
      </Router>
  );

}

export default AppRouter;
