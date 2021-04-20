import React, { useState, useContext, useEffect } from 'react';
// import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Modal from 'react-modal';
// import Link from '@material-ui/core/Link';
// import { Switch, Route } from 'react-router-dom';
// import Dialog from '@material-ui/core/Dialog';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import SignUp from "./SignUp.js";
import ForgotPassword from "./ForgotPassword.js";
import { useHistory } from "react-router-dom";
// import { UserContext } from "../../UserContext";
import axios from "axios";
import {blue, red } from '@material-ui/core/colors';
// import { DesktopWindows } from '@material-ui/icons';
import { cdRefresh, specialSetPos, encrypt } from "views/functions.js"
import {setTab} from "CustomComponents/CricDreamTabs.js"
import { CadSysLogo } from 'CustomComponents/CustomComponents.js';
import {setLoggedState} from "App.js"
import { BlankArea } from 'CustomComponents/CustomComponents.js';

const useStyles = makeStyles((theme) => ({
  title: {
    color: blue[700],
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
  },
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
  modalbutton: {
    margin: theme.spacing(2, 2, 2),
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

const modelStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    marginBottom          : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

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
    if (window.sessionStorage.getItem("logout")) {
      sessionStorage.clear();
    }
  });

  function handleForgot() {
    console.log("Call forgot password here")
    // history.push('/admin/emailpassword');
    sessionStorage.setItem("currentLogin", "RESET");
    cdRefresh();
  }

  function handleRegister() {
    console.log("Call for register here");
    // history.push("/admin/register")
    sessionStorage.setItem("currentLogin", "SIGNUP");
    cdRefresh();
  }

    //var subtitle;
    const [modalIsOpen,setIsOpen] = React.useState(false);
    function openModal() {
      setIsOpen(true);
    }
   
    function afterOpenModal() {
      // references are now sync'd and can be accessed.
      //subtitle.style.color = '#f00';
    }
   
    function closeModal(){
      setIsOpen(false);
    }
  
  function LoginSuccess(data) {
    sessionStorage.setItem("uid", data.userRec.uid)
    sessionStorage.setItem("displayName", data.userRec.displayName);
    sessionStorage.setItem("userName", data.userRec.userName);
    sessionStorage.setItem("userPlan", data.userRec.userPlan);
    sessionStorage.setItem("csuid", data.csuid);
    console.log(window.sessionStorage.getItem("csuid"));
    console.log(window.sessionStorage.getItem("uid"));
    setTab(parseInt(process.env.REACT_APP_DEFAULTAB));
    setLoggedState(1)
  }


  const handleClick = async () => {
    let response = ""
    try { 
      let encpassword = encrypt(password);
      // console.log("about to  sed acios");
      let myUrl=`${process.env.REACT_APP_AXIOS_BASEPATH}/user/login/${userName}/${encpassword}`;
      // console.log(myUrl);
      response = await axios.get(myUrl); 
      setErrorMessage("");
      if (response.status === 200) {
        console.log(response.data);
        LoginSuccess(response.data);
      } 
    } catch (err) {
      // console.log(err.status);
      console.log(err.response.status);
      if (err.response.status === 602) {
        openModal();  
        setErrorMessage("User Already logged in.");
      } else {
        setErrorMessage("Invalid Username / Password");
        console.log(err);
      }
    }
  };

  async function handleConfirmReLogin() {
    closeModal();
    let response = ""
    try { 
      let encpassword = encrypt(password);
      let myUrl=`${process.env.REACT_APP_AXIOS_BASEPATH}/user/confirmlogin/${userName}/${encpassword}`;
      response = await axios.get(myUrl); 
      setErrorMessage("");
      if (response.status === 200) {
        console.log(response.data);
        LoginSuccess(response.data);
      } 
    } catch (err) {
      // console.log(err.status);
      console.log(err.response.status);
      setErrorMessage("Already logged in.");
      // setErrorMessage("Invalid Username / Password");
      console.log(err);
    }
  }

  function ReConfirm() {
    return (
    <form>
      <Typography id="modalTitle" className={classes.title} align="center">Alreday logged in</Typography>
      <BlankArea />
      <Typography id="modalDescription" align="center">Confirm Logout old connection?</Typography>
      <BlankArea />
      <div align="center">
        <Button key="newHoliday" variant="contained" color="primary" size="small"
            className={classes.modalbutton} onClick={handleConfirmReLogin}>Confirm
        </Button>
        <Button key={"cancelHoilday"} variant="contained" color="primary" size="small"
          className={classes.modalbutton} onClick={closeModal}>Cancel
        </Button>
        {/* <button>the modal</button>
        <button onClick={closeModal}>close</button> */}
      </div>
    </form>  
    )}
  
  
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
          <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={modelStyles}
            contentLabel="Example Modal"
            aria-labelledby="modalTitle"
            aria-describedby="modalDescription"
          >
            <ReConfirm />
          </Modal>
        </div>
      </Container>
  );
}
