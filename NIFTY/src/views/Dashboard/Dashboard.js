import React from "react";
import { useEffect, useState } from 'react';
import { makeStyles } from "@material-ui/core/styles";
// import SportsHandballIcon from '@material-ui/icons/SportsHandball';
// import TimelineIcon from '@material-ui/icons/Timeline';
// import GroupIcon from '@material-ui/icons/Group';
// import Update from "@material-ui/icons/Update";
// import Accessibility from "@material-ui/icons/Accessibility";
// core components
import clsx from 'clsx';
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
// import Box from "@material-ui/core/Box";
// import Table from "components/Table/Table.js";
import Typography from '@material-ui/core/Typography';
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
// import CardContent from '@material-ui/core/CardContent';
// import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import socketIOClient from "socket.io-client";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// import {hasGroup} from "views/functions.js";
// import { NoGroup } from 'CustomComponents/CustomComponents.js';
import { deepOrange, deepPurple, yellow } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import MoreVertIcon from '@material-ui/icons/MoreVert';
import {setTab} from "CustomComponents/CricDreamTabs.js" 

const useStyles = makeStyles(styles);

const useStylesLocal = makeStyles((theme) => ({
    expiryDate: {
        fontSize: theme.typography.pxToRem(16),
        fontWeight: theme.typography.fontWeightBold,
        height: 50,
    },
    orange: {
      color: theme.palette.getContrastText(deepOrange[500]),
      backgroundColor: deepOrange[500],
    },
    purple: {
      color: theme.palette.getContrastText(deepPurple[500]),
      backgroundColor: deepPurple[500],
    },
    cardFooter: {
      backgroundColor: '#FFFF00', //  yellow[500],
      height: 70,
      paddingTop: 10,
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
      },
    expandOpen: {
    transform: 'rotate(180deg)',
    },  
}));
  
function leavingDashboard(myConn) {
  console.log("Leaving Dashboard wah wah ");
  myConn.disconnect();
}

const Months = ["Jan", "Feb", "Mar", "Apr",
                "May", "Jun", "Jul", "Aug", 
                "Sep", "Oct", "Nov", "Dec"];

function getDateTime(myTime) {
  let myDate = new Date(myTime);
  let xxx = ("0" + myDate.getDate()).slice(-2) + "-" +
    // ("0" + (myDate.getMonth()+1)).slice(-2) + "/" +
    Months[myDate.getMonth()] + "-" +
    myDate.getFullYear() + ' ' +
    ("0" + myDate.getHours()).slice(-2) + ":" +
    ("0" + myDate.getMinutes()).slice(-2) + ":" +
    ("0" + myDate.getSeconds()).slice(-2);
    // console.log(xxx);
    return (xxx);
}

export default function Dashboard() {
  const [dashData, setDashData] = useState([]);
  const [updateTime, setUpdateTime] = useState(""); 
  const [selectedExpiryDate, setSelectedExpiryDate] = React.useState("");  
  const [expanded, setExpandedPanel] = useState("");

  const handleCardChange = (panel) => (event) => {

    if (expanded === panel)
      setExpandedPanel("");
    else
      setExpandedPanel(panel);
  //   setExpandedPanel(isExpanded ? panel : false);
  };

  useEffect(() => {
    var sendMessage = {page: "DASH", csuid: sessionStorage.getItem("csuid") };

    const makeconnection = async () => {
      await sockConn.connect();
      sockConn.emit("page", sendMessage);
    }

    var sockConn = socketIOClient(process.env.REACT_APP_ENDPOINT);
    // console.log("in dashboard before make connection");
    makeconnection();
    // console.log("in dashboard after make connection");

    sockConn.on("connect", function() {
        sockConn.emit("page", sendMessage);
        sockConn.on("DASHBOARD", (dashData) => {
        // console.log("Got Dash Data");
        // console.log(dashData);
        setDashData(dashData);
        let x = new Date().toDateString() + " " + new Date().toLocaleTimeString();
        setUpdateTime(x);
      });

    });
    
    return () => {
      // componentwillunmount in functional component.
      // Anything in here is fired on component unmount.
      leavingDashboard(sockConn);
  }
   
  }, []);

  const classes = useStyles();
  const classesLocal = useStylesLocal();


  function handleGreekClick() {
    if (expanded === "") return;
    console.log(expanded);
    let myDate = document.getElementById(expanded+"Expiry").innerText;
    // let myDate = "22-Apr-2021";
    sessionStorage.setItem("dashNseName", expanded);
    sessionStorage.setItem("dashNseExpiryDate", myDate);
    // console.log(expanded);
    let myTab = parseInt(process.env.REACT_APP_GREEK_TAB);
    // console.log(sessionStorage.getItem("dashNseName"), " was clicked")
    // console.log(sessionStorage.getItem("dashNseExpiryDate"));
    // console.log("Button tab is ", myTab);
    setTab(parseInt(myTab));
  }

  function handleNseClick() {
    if (expanded === "") return;
    console.log(expanded);
    let myDate = document.getElementById(expanded+"Expiry").innerText;
    // let myDate = "22-Apr-2021";
    sessionStorage.setItem("dashNseName", expanded);
    sessionStorage.setItem("dashNseExpiryDate", myDate);
    // console.log(expanded);
    let myTab = parseInt(process.env.REACT_APP_NSE_TAB);
    // console.log(sessionStorage.getItem("dashNseName"), " was clicked")
    // console.log(sessionStorage.getItem("dashNseExpiryDate"));
    // console.log("Button tab is ", myTab);
    setTab(parseInt(myTab));
  }

  
  function ShowExpiryDates(props) {
    let myExpiryDates = props.data.expiryDate;
    myExpiryDates = myExpiryDates.map( x => x.expiryDate);
    let defValue = "";
    if (myExpiryDates.length > 0) {
      defValue = myExpiryDates[0];
      if (expanded === props.data.name) {
        let tmp = document.getElementById(expanded+"Expiry");
        if (tmp) {
          let currSelection =  tmp.innerText;
          if (myExpiryDates.find(x => x === currSelection));
            defValue = currSelection;
        }
      }
    }
    return (
      <Collapse in={expanded === props.data.name} timeout="auto" unmountOnExit>
        <Grid container alignItems="center" className={classesLocal.cardFooter}  spacing={3}>
          {/* <GridItem key={props.data.name+"GI1"} xs={3} sm={3} md={3} lg={3} />  */}
          <GridItem key={props.data.name+"GISELECT"} xs={3} sm={3} md={3} lg={3}>
            {/* <Typography className={classesLocal.expiryDate} >{props.data.expiryDate}</Typography> */}
            <Select 
              id={props.data.name+"Expiry"} 
              variant="outlined" required 
              // fullWidth
              size="small"
              label="NSE Name"
              name="nsename"
              // id="nsenameList"
              defaultValue={defValue}
              // onChange={handleSelectedExpiryDate(props.data.name)}
            >
              {myExpiryDates.map(x =><MenuItem key={x} value={x}>{x}</MenuItem>)}
            </Select>
          </GridItem>
          <GridItem key={props.data.name+"GI2"} xs={2} sm={2} md={2} lg={2} /> 
          <GridItem key={props.data.name+"GINSE"} xs={1} sm={1} md={1} lg={1}>
          <Button
              variant="contained"
              size="small"
              color="primary" 
              disabled={myExpiryDates.length === 0} 
              onClick={handleNseClick}
              >
              NSE
          </Button>
          </GridItem>
          <GridItem key={props.data.name+"GI3"} xs={1} sm={1} md={1} lg={1} /> 
          <GridItem key={props.data.name+"GIGREEK"} xs={1} sm={1} md={1} lg={1}>
          <Button
              variant="contained"
              size="small"
              color="primary" 
              disabled={myExpiryDates.length === 0} 
              onClick={handleGreekClick}
              >
              Greek
          </Button>
          </GridItem>
        </Grid>
      </Collapse>
    );
  }

  function ShowSingleNseCard(props) {
    // console.log(props);
    // let myTime = new Date(props.data.time);
    let myTimeString = getDateTime(props.data.time);
    return (
      <GridItem key={props.data.name+"GI"} xs={12} sm={6} md={6}>
      <Card key={props.data.name+"Card"}>
      <CardHeader key={props.data.name+"CH"} color="success" stats icon>
          <CardIcon color="success">
          <Avatar className={classesLocal.orange}>{props.data.name[0]}</Avatar>
          </CardIcon>
      </CardHeader>
      <CardBody>
      <h3 align="center" className={classes.cardTitle}>{props.data.name + " - " + props.data.underlyingValue}</h3>
      <h3 align="center" className={classes.cardTitle}>{"(" + myTimeString + ")"}</h3>
      </CardBody>
      <CardFooter key={props.data.name+"F"} stats>
      <Typography>{props.data.name + " Expiry Dates"}</Typography>
      <IconButton
        className={clsx(classesLocal.expand, 
          (expanded === props.data.name) && classesLocal.expandOpen
        )}
        onClick={handleCardChange(props.data.name)}
        aria-expanded={expanded === props.data.name}
        aria-label="show more"
      >
        <ExpandMoreIcon />
      </IconButton>
      </CardFooter>
      <ShowExpiryDates data={props.data} />
      </Card>
      </GridItem>
    );
  }

  function ShowAllNseCard() {
    return(
      <GridContainer key="showallnsecard">
      {dashData.map( (x) => <ShowSingleNseCard key={x.name} data={x} />)}
      </GridContainer>
    );
  } 

  function ShowUpdateTime() {
    return(
    <Card key="db_card">
        <CardHeader key="db_header" color="warning">
        <Grid container spacing={3}>
            <Grid item align="left" item>
              <Typography className={classes.dispString} >DashBoard</Typography> 
              <Typography className={classes.dispString} >{`Updated as of ${updateTime}`}</Typography>
            </Grid>
            </Grid>
        </CardHeader>
        <CardBody key="db_cbody">
        </CardBody>
    </Card>
    );
  }


  return (
    <div>
      <ShowUpdateTime />
      <ShowAllNseCard />
    </div>
  );
}
