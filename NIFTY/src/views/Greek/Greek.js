import React, { useEffect } from 'react';
import axios from "axios"; // 
import socketIOClient from "socket.io-client";
// import Link from '@material-ui/core/Link';
// import Modal from 'react-modal';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
// import InputLabel from '@material-ui/core/InputLabel';
// import Box from '@material-ui/core/Box';
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input';
// import TextField from '@material-ui/core/TextField';
// import Checkbox from '@material-ui/core/Checkbox';
// import Button from '@material-ui/core/Button';
// import Checkbox from '@material-ui/core/Checkbox';
// import Radio from '@material-ui/core/Radio';
import { red, blue, deepOrange } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
// import Tooltip from '@material-ui/core/Tooltip';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Switch from '@material-ui/core/Switch';
// import DeleteIcon from '@material-ui/icons/Delete';
// import FilterListIcon from '@material-ui/icons/FilterList';
// import { useHistory } from "react-router-dom";
import {DisplayPageHeader, MessageToUser} from "CustomComponents/CustomComponents.js"
// import {setTab} from "CustomComponents/CricDreamTabs.js"
import { BlankArea } from 'CustomComponents/CustomComponents';
import { generateUnderlyingIndexString, getAxiosUrl } from "views/functions"
import { func } from 'prop-types';
//import DeleteIcon from '@material-ui/icons/Delete';
import * as zoom from "chartjs-plugin-zoom";
import Hammer from "hammerjs";
import Zoom1 from "./chart1"
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';

function currency(num) {
  let myStr = (num) ? num.toFixed(2) : "-";
  return myStr;
}


function leavingGreek(myConn) {
  console.log("Leaving Greek wah wah ");
  myConn.disconnect();
}

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    //minWidth: 750,
  },
  thm: { 
    backgroundColor: '#EEEEEE', 
    color: deepOrange[700], 
    border: "1px solid black",
    fontWeight: theme.typography.fontWeightBold,
    align: "center",
    padding: "1px 10px",
  },
  th: { 
    backgroundColor: '#EEEEEE', 
    color: deepOrange[700], 
    border: "1px solid black",
    fontWeight: theme.typography.fontWeightBold,
    align: "center",
    padding: "1px 10px",
  },
  td : {
    // border: 5,
    border: "1px solid black",
    align: "center",
    padding: "1px 10px",
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1, 
  },
  radio: {
    color: blue[200],
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  filter: {
    marginTop: '0.1rem',
    marginBottom: '0.1rem',
    fontSize: 5,
  },
  dispString:  {
    // right: 0,
    margin: theme.spacing(0, 1, 0),
    fontSize: '18px',
    color: blue[900],
    // // position: 'absolute',
    // alignItems: 'center',
    // marginTop: '0px',
  },
  error:  {
    // right: 0,
    fontSize: '12px',
    color: blue[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
},
add:  {
  color: blue[900],
  padding: "1px 1px 1px 1px",
},
}));

var sockConn; 

export default function Greek() {

  const [errorMessage, setErrorMessage ] = React.useState("");

  // for holiday details edit/add
  const [nhRegisterStatus, setNhRegisterStatus] = React.useState(0)

  const [niftyDataArray, setNiftyDataArray] = React.useState([]);
  const [masterData, setmasterData] = React.useState([]);
  const [greekData, setGreekData] = React.useState([]);

  const [nseNameList, setNseNameList] = React.useState([]);
  const [selectedNseName, setselectedNseName] = React.useState("");
  const [expiryDateList, setExpiryDateList] = React.useState([]);
  const [selectedExpiryDate, setSelectedExpiryDate] = React.useState("");
  const [displayString, setDisplayString] = React.useState("");
  const [underlyingValue, setUnderlyingValue] = React.useState(0);
  const [margin, setMargin] = React.useState(2000);
  const [filterString, setfilterString] = React.useState("");
  const [callPut, setCallPut] = React.useState("CALL");
  
  
  var sendMessage = {page: "GREEKDATA", csuid: sessionStorage.getItem("csuid")};

  useEffect(() => { 
    const makeconnection = async () => {
      await sockConn.connect();
    }

    sockConn = socketIOClient(process.env.REACT_APP_ENDPOINT);
    
    makeconnection();

    sockConn.on("connect", function() {
      sockConn.emit("page", {page: "GREEKDATA", uid: '0' });

      /*** NSEDATA now not sent by server 
      sockConn.on("NSEDATA", (mynsedata) => {
        //console.log("In NSEDATA");
        console.log("rcvd NSE data of length", mynsedata.length);
        setNiftyDataArray(mynsedata);
        setmasterData(mynsedata);
        if (mynsedata.length > 0) {
          let ulvalue = mynsedata[0].underlyingValue
          setUnderlyingValue(ulvalue);
          // let tmp = new Date(mynsedata[0].time);
          let myStr = generateUnderlyingIndexString(selectedNseName, 
            ulvalue, new Date(mynsedata[0].time));
          // let myTimeStamp = tmp.toString().split("+");
          // let myStr = `Underlying Index: ${selectedNseName} ${ulvalue} at ${myTimeStamp[0]}`
          setDisplayString(myStr);
        } else {
          setUnderlyingValue(0);
        }
      });
      ***/

      sockConn.on("GREEKDATA", (mygreekdata) => {
        // console.log("In GREEKDATA");
        setGreekData(mygreekdata);
        console.log("rcvd Greek data of length", mygreekdata.length);
        if (mygreekdata.length > 0) {
          let ulvalue = mygreekdata[0].underlyingValue
          setUnderlyingValue(ulvalue);
          // let tmp = new Date(mynsedata[0].time);
          let myStr = generateUnderlyingIndexString(selectedNseName, 
            ulvalue, new Date(mygreekdata[0].time));
          // let myTimeStamp = tmp.toString().split("+");
          // let myStr = `Underlying Index: ${selectedNseName} ${ulvalue} at ${myTimeStamp[0]}`
          setDisplayString(myStr);
        } else {
          setUnderlyingValue(0);
        }

        // console.log(`Length is ${mygreekdata.length}`);
      });

      sockConn.on("GREEKDISPLAYSTRING", (dispStr) => {
        // console.log("In DISPLAY STRING");
        // setNiftyDataArray(mynsedata);
        // setmasterData(mynsedata);
        // console.log(dispStr);
        //setDisplayString(dispStr);
      });

      sockConn.on("GREEKUNDERLYINGVALUE", (ulvalue) => {
        // console.log("In uderlying value");
        // setNiftyDataArray(mynsedata);
        // setmasterData(mynsedata);
        // setUnderlyingValue(ulvalue);
        //setNextSP(getNextSP(masterData, ulvalue));
      });
      
    });

    function getSessionStorage(id) {
      return (sessionStorage.getItem(id)) ? sessionStorage.getItem(id) : "";
    }


    const fetchGreek = async () => {
      let response, response1;
      try {
        response = await axios.get(getAxiosUrl('/nifty/list'));
        setNseNameList(response.data);
        if (response.data.length > 0) {
          let currNse = getSessionStorage("dashNseName");
          // console.log(currNse);
          if (currNse === "") currNse = response.data[0].niftyName;
          // console.log(currNse);
          sessionStorage.setItem("dashNseName", "");
          setselectedNseName(currNse);
          let myDates = await getExiryDates(currNse);
          // console.log(myDates);
          if (myDates.length > 0) {
            setExpiryDateList(myDates);
            let currExpiryDate = getSessionStorage("dashNseExpiryDate");
            if (currExpiryDate === "") currExpiryDate = myDates[0].expiryDate
            sessionStorage.setItem("dashNseExpiryDate", "");
            setSelectedExpiryDate(currExpiryDate);

            sendMessage["uid"] = sessionStorage.getItem("uid");
            sendMessage["stockName"] = currNse;
            sendMessage["expiryDate"] = currExpiryDate;
            sendMessage["margin"] = margin;
            // console.log(sendMessage);
            // console.log("Now making connection");
            sockConn.emit("page", sendMessage);
          }  
          else
            setSelectedExpiryDate("");  
        }
      } catch (e) {
            console.log(e)
      }
      setfilterString("")
    }
    fetchGreek();

    return () => {
      leavingGreek(sockConn);
    }
  }, []);


  const classes = useStyles();
    

  async function getExiryDates(niftyName) {
    let myDates = [];
    try {
      let resp = await axios.get(getAxiosUrl(`/nifty/getexpirydate/${niftyName}`));
      myDates = resp.data;
    } catch (e) {
      console.log(e)
    }
    // console.log(myDates);
    return myDates;
  }
  
  const handleSelectedExpiryDate = async (event) => {
    setSelectedExpiryDate(event.target.value);
    //console.log(`Selecyed expiry daye ${event.target.value}`);
    await readGreekData(selectedNseName, event.target.value);
  }

  async function readGreekData(nseName, expiryDate) {
    // console.log("Need to read Greek Data");
    var greekMessage = {
      page: "GREEKDATA", 
      csuid: sessionStorage.getItem("csuid"),
      uid: sessionStorage.getItem("uid"),
      stockName: nseName,
      expiryDate: expiryDate,
      margin: 2000
    };
    // console.log(sendMessage);
    // console.log("Now making connection");
    sockConn.emit("page", greekMessage);
  }
  
  const handleSelectedNseName = async (event) => {
    setselectedNseName(event.target.value);
    //console.log(`Selecyed nse name ${event.target.value}`);
    let myDates = await getExiryDates(event.target.value);
    if (myDates.length > 0) {
      setExpiryDateList(myDates);
      if (myDates.length > 0) {
        // check if current expiry data is there
        let currExpiryDate = selectedExpiryDate;
        let tmp = myDates.find(x => x.expiryDate === selectedExpiryDate);
        if (!tmp) currExpiryDate = myDates[0].expiryDate;
        setSelectedExpiryDate(currExpiryDate)
        await readGreekData(event.target.value, currExpiryDate);
      }
    }
  }


  
  function DisplaySelection() {
    return(
      <Grid container direction="row" alignItems="center" justify="flex-end" >
        {/* <Grid item xs="1"/> */}
        <Grid item xs={2} sm={2} md={1} lg={1} >
          <Typography align="right" className={classes.dispString} >NSE Name</Typography>
        </Grid>
        <Grid item xs>
          <Select labelId='nsename' id='nsename' variant="outlined" required 
          style={ {padding: "0px"} }
          size="small"
          // label="NSE Name"
          // name="nsename"
          // id="nsenameList"
          value={selectedNseName}
          onChange={handleSelectedNseName}>
          {nseNameList.map(x =><MenuItem dense={true} disableGutters={true}  key={x.niftyName} value={x.niftyName}>{x.niftyName}</MenuItem>)}
        </Select>
        </Grid>
        <Grid item xs={2} sm={2} md={2} lg={2}>
          <Typography align="right" className={classes.dispString} >Expiry Date</Typography>
        </Grid>
        <Grid item xs>
          <Select labelId='expirydateList' id='expirydateList' variant="outlined" required 
          style={ {padding: "0px"} }
          // fullWidth
          size="small"
          label="Expiry Date"
          name="expirydate"
          id="expirydateList"
          value={selectedExpiryDate}
          onChange={handleSelectedExpiryDate}>
          {expiryDateList.map(x =><MenuItem dense={true} disableGutters={true} key={x.expiryDate} value={x.expiryDate}>{x.expiryDate}</MenuItem>)}
          </Select>
        </Grid>
        <Grid  item>
            <Typography align="center" className={classes.dispString} >{displayString}</Typography>
        </Grid>
        {/* <Grid  item xs></Grid> */}
      </Grid>
    );
  }

  function CallPutButton() {
    return (
      <div align="left">
        <Button variant="contained" color="primary" size="small"
          disabled={callPut === "CALL"}
          className={classes.button} onClick={() => { setCallPut("CALL")}}>Call
        </Button>
        <Button variant="contained" color="primary" size="small"
          disabled={callPut === "PUT"}
          className={classes.button} onClick={() => { setCallPut("PUT")}}>Put
        </Button>
      </div>
    )
  }

  function DisplayHeading() {
    return(
      <Table>
        <TableHead>
          <TableRow align="center">
            <TableCell className={classes.th} colSpan="5" align="center">{callPut} Data</TableCell>
          </TableRow> 
          <TableRow align="center">
            <TableCell className={classes.th} align="center">Strike Price</TableCell>
            <TableCell className={classes.th} align="center">IV</TableCell>      
            <TableCell className={classes.th} align="center">LTP</TableCell>      
            <TableCell className={classes.th} align="center">Greek Delta</TableCell>      
            <TableCell className={classes.th} align="center">Greek Price</TableCell>      
          </TableRow>
        </TableHead>
      </Table>
    )
  }

  function selectData(record) {
    // console.log(callPut, record.strikePrice);
    alert(`${callPut} with SP ${record.strikePrice}`);
  }

  function ShowAddButton(props) {
    return (
      <IconButton key={props.sp} id={props.sp} aria-label="add" className={classes.add}
      onClick={ () => selectData(props.sp) }
      >
        <AddCircleOutlineRoundedIcon />
      </IconButton>

    )
  }

  function DisplayGreekData() {
    if (callPut === "CALL") {
      let myData = greekData.filter(x => x.ce_impliedVolatility !== 0)
      return (
        <Table>
          <TableHead>
            <TableRow align="center">
              <TableCell className={classes.th} colSpan="6" align="center">{callPut} Data</TableCell>
            </TableRow> 
            <TableRow align="center">
              <TableCell className={classes.th} align="center">{callPut} LTP</TableCell>      
              <TableCell className={classes.th} align="center">Strike Price</TableCell>
              <TableCell className={classes.th} align="center">IV</TableCell>      
              <TableCell className={classes.th} align="center">Call Delta</TableCell>      
              <TableCell className={classes.th} align="center">Call Price</TableCell>      
              {/* <TableCell className={classes.th} align="center"></TableCell>       */}
            </TableRow>
          </TableHead>
          <TableBody>
            {myData.map(item => {
            return(
            <TableRow onClick={() => selectData(item)} key={item.strikePrice} align="center">
            <TableCell className={classes.td} align="center">{currency(item.ce_lastPrice)}</TableCell>      
            <TableCell className={classes.td} align="center">{item.strikePrice}</TableCell>
            <TableCell className={classes.td} align="center">{currency(item.ce_impliedVolatility)}</TableCell>      
            <TableCell className={classes.td} align="center">{currency(item.ce_greekDelta)}</TableCell>      
            <TableCell className={classes.td} align="center">{currency(item.ce_greekPrice)}</TableCell>      
            {/* <TableCell className={classes.td} align="center">
              <ShowAddButton sp={item.strikePrice} />
            </TableCell>       */}
            </TableRow>
            )})}
          </TableBody>
        </Table>
      );
    } else {
      let myData = greekData.filter(x => x.pe_impliedVolatility !== 0)
      return (
        <Table>
          <TableHead>
            <TableRow align="center">
              <TableCell className={classes.th} colSpan="6" align="center">{callPut} Data</TableCell>
            </TableRow> 
            <TableRow align="center">
              <TableCell className={classes.th} align="center">{callPut} LTP</TableCell>      
              <TableCell className={classes.th} align="center">Strike Price</TableCell>
              <TableCell className={classes.th} align="center">IV</TableCell>      
              <TableCell className={classes.th} align="center">Put Delta</TableCell>      
              <TableCell className={classes.th} align="center">Put Price</TableCell>      
              {/* <TableCell className={classes.th} align="center"></TableCell>       */}
            </TableRow>
          </TableHead>
          <TableBody>
            {myData.map(item => {
            return(
            <TableRow onClick={() => selectData(item)} key={item.strikePrice} align="center">
            <TableCell className={classes.td} align="center">{currency(item.pe_lastPrice)}</TableCell>      
            <TableCell className={classes.td} align="center">{item.strikePrice}</TableCell>
            <TableCell className={classes.td} align="center">{currency(item.pe_impliedVolatility)}</TableCell>      
            <TableCell className={classes.td} align="center">{currency(item.pe_greekDelta)}</TableCell>      
            <TableCell className={classes.td} align="center">{currency(item.pe_greekPrice)}</TableCell>      
            {/* <TableCell className={classes.td} align="center">
              <ShowAddButton sp={item.strikePrice} />
            </TableCell>       */}
            </TableRow>
            )})}
          </TableBody>
        </Table>
      );
    }
  }


  return (
    <div align = "center" className={classes.root}>
      <Paper className={classes.paper}>
        <DisplayPageHeader headerName="Greek" />      
        <BlankArea />
        <DisplaySelection />
        <CallPutButton />
        <DisplayGreekData />
        <Zoom1 />
      </Paper>
    </div> 
  );
}
