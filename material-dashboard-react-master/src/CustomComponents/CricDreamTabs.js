import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import GroupIcon from '@material-ui/icons/Group';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu'; 
import {red, blue, green} from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import {cdRefresh, specialSetPos} from "views/functions.js"
/// cd items import
import Nifty from "views/Nifty/Nifty"
import Holiday from "views/Holiday/Holiday"
import Greek from "views/Greek/Greek"
import ContactUs from "views/CadSys/ContactUs"
import axios from 'axios';
import { setLoggedState } from 'App';
//import Profile from "views/Profile/Profile.js"
//import ChangePassword from "views/Login/ChangePassword.js"
//import About from "views/APL/About.js"
//import ContactUs from "views/APL/ContactUs.js"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    // marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
  icon : {
    color: '#FFFFFF',
    marginRight: theme.spacing(0),
    marginLeft: theme.spacing(0),
  },
  dashButton: {
    // marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  statButton: {
    //marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  teamButton: {
    marginRight: theme.spacing(0),
    marginLeft: theme.spacing(0),
  },


  title: {
    flexGrow: 1,
  },
  avatar: {
    margin: theme.spacing(0),
    // backgroundColor: theme.palette.secondary.main,
    // width: theme.spacing(10),
    // height: theme.spacing(10),
  
  },

}));

export function setTab(num) {
  //myTabPosition = num;
  console.log(`Menu pos ${num}`);
  localStorage.setItem("menuValue", num);
  cdRefresh();
}

export function CricDreamTabs() {
  const classes = useStyles();
  // for menu 
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  // for group menu
  const [grpAuth, setGrpAuth] = React.useState(true);
  const [grpAnchorEl, setGrpAnchorEl] = React.useState(null);
  const grpOpen = Boolean(grpAnchorEl);
  const [value, setValue] = React.useState(parseInt(localStorage.getItem("menuValue")));

  console.log(`in Tab function  ${localStorage.getItem("menuValue")}`);

  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleGrpMenu = (event) => {
    setGrpAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGrpClose = () => {
    setGrpAnchorEl(null);
  };

  function setMenuValue(num) {
    setValue(num);
    handleClose();
    localStorage.setItem("menuValue", num);
  }

  const handleNifty = () => { setMenuValue(1);  }
  const handleGreek = () => { setMenuValue(2);  }
  const handleHoliday = () => { setMenuValue(98);  }
  const handleContactUs = () => { setMenuValue(99);  }

  async function handleLogout() {
    console.log("in logout");
    handleClose();
    // await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/logout/${localStorage.getItem("uid")}`);
    await axios.get(`/user/logout/${localStorage.getItem("uid")}`);
    //localStorage.setItem("uid", "");
    //localStorage.setItem("menuValue", process.env.REACT_APP_DASHBOARD);
    setLoggedState(-1);  // in unlogged state
    //cdRefresh();  
  };


  function DisplayCdItems() {
    switch(value) {
      case 1: return <Nifty/>; 
      case 2: return <Greek/>; 
      case 98: return <Holiday/>; 
      case 99: return <ContactUs/>; 
      default: return  <div></div>;
    }
  }

  let mylogo = `${process.env.PUBLIC_URL}/CS3.ICO`;
  return (
    <div className={classes.root}>
      <AppBar position="static">
      <Toolbar>
        <Avatar variant="square" className={classes.avatar}  src={mylogo}/>
        <Button color="inherit" className={classes.dashButton} onClick={handleNifty}>Nifty</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleGreek}>Greek</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleHoliday}>Custom Days</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleContactUs}>Contact Us</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleLogout}>Logout</Button>
      </Toolbar>
      </AppBar>
      <DisplayCdItems/>
    </div>
  );
}