import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
// import { Swipeable } from "react-swipeable";
// import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
// import IconButton from '@material-ui/core/IconButton';
// import MenuIcon from '@material-ui/icons/Menu';
// import GroupIcon from '@material-ui/icons/Group';
import Button from '@material-ui/core/Button'; 
// import AccountCircle from '@material-ui/icons/AccountCircle';
// import Switch from '@material-ui/core/Switch';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu'; 
import {red, blue, deepOrange} from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import {cdRefresh, specialSetPos} from "views/functions.js"
/// cd items import
import Dashboard from "views/Dashboard/Dashboard"
import Nifty from "views/Nifty/Nifty"
import Holiday from "views/Holiday/Holiday"
import Greek from "views/Greek/Greek"
import ContactUs from "views/CadSys/ContactUs"
import Profile from "views/Login/Profile";
import ChangePassword from "views/Login/ChangePassword"

import axios from 'axios';
import { setLoggedState } from 'App';

const RIGHT = "-1";
const LEFT = "+1";

const IMG_WIDTH = "342px";
const IMG_HEIGHT = "249px";

const buttonStyles = {
  height: IMG_HEIGHT,
  color: "#eeeeee",
  fontSize: "2em",
  backgroundColor: "rgba(230,230,230,.2)",
  border: "0",
  cursor: "pointer"
};
const buttonLeft = { ...buttonStyles, float: "left" };
const buttonRight = { ...buttonStyles, float: "right" };
  
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
  avatar1: {
    margin: theme.spacing(0),
    backgroundColor: deepOrange[500],
    color: theme.palette.getContrastText(deepOrange[500]), 
    // width: theme.spacing(10),
    // height: theme.spacing(10),  
  },
}));

export function setTab(num) {
  //myTabPosition = num;
  console.log(`Menu pos ${num}`);
  sessionStorage.setItem("menuValue", num);
  cdRefresh();
}

export function CricDreamTabs() {
  const classes = useStyles();
  // for menu 
  // const [auth, setAuth] = React.useState(true);
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [userAnchorEl, setUserAnchorEl] = React.useState(null);
  const userOpen = Boolean(userAnchorEl);
  const handleUserMenu = (event) => {
    setUserAnchorEl(event.currentTarget);
  };
  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  // for group menu
  // const [grpAuth, setGrpAuth] = React.useState(true);
  const [value, setValue] = React.useState(parseInt(sessionStorage.getItem("menuValue")));

  
  // console.log(`in Tab function  ${sessionStorage.getItem("menuValue")}`);

  // const handleChange = (event) => {
  //   setAuth(event.target.checked);
  // };





  function setMenuValue(num) {
    setValue(num);
    handleClose();
    sessionStorage.setItem("menuValue", num);
  }

  const handleDashBoard = () => { setMenuValue(1);  }
  const handleNifty = () => { setMenuValue(2);  }
  const handleGreek = () => { setMenuValue(3);  }

  const handleHoliday = () => { handleClose(); setMenuValue(101);  }
  const handleContactUs = () => { handleClose(); setMenuValue(102);  }

  const handleProfile = () => { handleUserClose(); setMenuValue(201);  }
  const handleChangePassword = () => { handleUserClose(); setMenuValue(202);  }

  async function handleLogout() {
    console.log("in logout");
    await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/logout/${sessionStorage.getItem("csuid")}`);
    console.log("just given logout axios call");
    setLoggedState(-1);  // in unlogged state
    handleClose();
    sessionStorage.setItem("uid", "");
    //sessionStorage.setItem("menuValue", process.env.REACT_APP_DASHBOARD);
    cdRefresh();  
  };


  function DisplayCdItems() {
    switch(value) {
      case 1: return <Dashboard/>; 
      case 2: return <Nifty/>; 
      case 3: return <Greek/>; 
      case 101: return <Holiday/>; 
      case 102: return <ContactUs/>; 
      case 201: return <Profile />;
      case 202: return <ChangePassword />;
      default: return  <div></div>;
    }
  }

  // function onSwiped(direction) {
  //   let newValue = balue + Number(direction);
  //   if ((newValue >= 1) && (newValue  <= 4)) {
  //     setValue(newValue);
  //   }
  //   // if (adjustedIdx >= images.length) {
  //   //   newIdx = 0;
  //   // } else if (adjustedIdx < 0) {
  //   //   newIdx = images.length - 1;
  //   // } else {
  //   //   newIdx = adjustedIdx;
  //   // }
  //   // this.setState({ imageIdx: newIdx });
  // }

  let mylogo = `${process.env.PUBLIC_URL}/CS3.ICO`;
  let myName = sessionStorage.getItem("displayName");
  return (
    <div className={classes.root}>
      <AppBar position="static">
      <Toolbar>
        <div>
        <Avatar 
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
        variant="square" className={classes.avatar}  src={mylogo}/>
          {/* <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            {/* <MenuIcon className={classes.icon}/>
            <Avatar variant="square" className={classes.avatar}  src={mylogo}/>
          </IconButton> */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
            <MenuItem onClick={handleHoliday}>Custom Days</MenuItem>
            <MenuItem onClick={handleContactUs}>Contact Us</MenuItem>
          </Menu>
        </div>
        <Button color="inherit" className={classes.dashButton} onClick={handleDashBoard}>Dashboard</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleNifty}>Nifty</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleGreek}>Greek</Button>
        {/* <Button color="inherit" className={classes.dashButton} onClick={handleHoliday}>Custom Days</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleContactUs}>Contact Us</Button>
        <Button color="inherit" className={classes.dashButton} onClick={handleLogout}>Logout</Button> */}
        <div>
          <Avatar 
            aria-label="account of current user"
            aria-controls="user-appbar"
            aria-haspopup="true"
            onClick={handleUserMenu}
            color="inherit"
            variant="circle" className={classes.avatar1}>{myName[0]}
          </Avatar>
          <Menu
            id="user-appbar"
            anchorEl={userAnchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={userOpen}
            onClose={handleUserClose}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
      </AppBar>
      <DisplayCdItems/>
      {/* <Swipeable
          trackMouse
          preventDefaultTouchmoveEvent
          onSwipedLeft={() => onSwiped(LEFT)}
          onSwipedRight={() => onSwiped(RIGHT)}
          // style={{ width: IMG_WIDTH }}
        >
          <div>
            <button onClick={() => this.onSwiped(RIGHT)} style={buttonLeft}>
              ⇦
            </button>
            <button onClick={() => this.onSwiped(LEFT)} style={buttonRight}>
              ⇨
            </button>
          </div>
        </Swipeable> */}
    </div>
  );
}