import React, { useState, useContext, useEffect } from 'react';
// import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
// import Link from '@material-ui/core/Link';
// import { Switch, Route } from 'react-router-dom';
// import Dialog from '@material-ui/core/Dialog';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import SignUp from "../Login/SignUp.js";
import ForgotPassword from "./ForgotPassword.js";
import { useHistory } from "react-router-dom";
// import { UserContext } from "../../UserContext";
import axios from "axios";
import red from '@material-ui/core/colors/red';
// import { DesktopWindows } from '@material-ui/icons';
import { cdRefresh, specialSetPos, encrypt } from "views/functions.js"
import {setTab} from "CustomComponents/CricDreamTabs.js"
import { CadSysLogo } from 'CustomComponents/CustomComponents.js';
import {setLoggedState} from "App.js"

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  error:  {
      // right: 0,
      fontSize: '12px',
      color: red[700],
      // position: 'absolute',
      alignItems: 'center',
      marginTop: '0px',
  },
}));

const handleSubmit = e => {
  e.preventDefault();
};

export default function SignIn() {
  const classes = useStyles();
  const history = useHistory();
  const [userName, setUserName] = useState();
  const [password, setPassword] = useState();
  // const [showPage, setShowPage] = useState(true);
  // const [open, setOpen] = useState(true)
  // const { setUser } = useContext(UserContext);
  const [ errorMessage, setErrorMessage ] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("logout")) {
      localStorage.clear();
    }
    //----localStorage.setItem
    // if (window.localStorage.getItem("uid")) {
    //   // setUser({ uid: window.localStorage.getItem("uid"), admin: window.localStorage.getItem("admin") })
    //   // history.push("/admin")
    // } else {
    //   // setShowPage(true)
    // }
  });

  function handleForgot() {
    console.log("Call forgot password here")
    // history.push('/admin/emailpassword');
    localStorage.setItem("currentLogin", "RESET");
    cdRefresh();
  }

  function handleRegister() {
    console.log("Call for register here");
    // history.push("/admin/register")
    localStorage.setItem("currentLogin", "SIGNUP");
    cdRefresh();
  }

  const handleClick = async () => {
    let response = ""
    try { 
      let encpassword = encrypt(password);
      console.log("about to  sed acios");
      let myUrl=`${process.env.REACT_APP_AXIOS_BASEPATH}/user/login/${userName}/${encpassword}`;
      console.log(myUrl);
      response = await axios.get(myUrl); 
      setErrorMessage("");
      if (response.status === 200) {
        console.log(response.data);
        // SAMPLE OUTPUT
        // {"uid":"8","gid":2,"displayName":"Salgia Super Stars",
        // "groupName":"Happy Home Society Grp 2","tournament":"ENGAUST20","ismember":true,"admin":true}
        window.localStorage.setItem("uid", response.data.userRec.uid)
        window.localStorage.setItem("displayName", response.data.userRec.displayName);
        window.localStorage.setItem("userName", response.data.userRec.userName);
        window.localStorage.setItem("userPlan", response.data.userRec.userPlan);
        window.localStorage.setItem("csuid", response.data.csuid);
        console.log(window.localStorage.getItem("csuid"));
        console.log(window.localStorage.getItem("uid"));
        setTab(1);  // show NIFTY be default
        setLoggedState(1)
      }
    } catch (err) {
      setErrorMessage("Invalid Username / Password");
      console.log(err);
    }
  };

  
  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <CadSysLogo />        
          <Typography component="h1" variant="h5">
            Sign in
        </Typography>
          <form className={classes.form} onSubmit={handleSubmit} noValidate>
            <TextField
              autoComplete="fname"
              name="userName"
              variant="outlined"
              required
              fullWidth
              id="userName"
              label="User Name"
              autoFocus
              onChange={(event) => setUserName(event.target.value)}
            />
            <h3></h3>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <div>
            <Typography className={classes.error} align="left">{errorMessage}</Typography>
            </div>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleClick}
            >
              Sign In
          </Button>
          {/* <Typography className={classes.root}>
              Forgot password: 
              <Link href="#" onClick={handleForgot} variant="body2">
              Click here
            </Link>
          </Typography>
          <Typography className={classes.root}>
              New to CricDream: 
              <Link href="#" onClick={handleRegister} variant="body2">
              Register
            </Link>
          </Typography> */}
          </form>
        </div>
      </Container>
  );
}
