import React, { useEffect } from 'react';
import axios from "axios";
import socketIOClient from "socket.io-client";
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
// import InputLabel from '@material-ui/core/InputLabel';
// import Box from '@material-ui/core/Box';
import Grid from "@material-ui/core/Grid";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
// import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import { red, blue, orange, deepOrange } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useHistory } from "react-router-dom";
import {DisplayPageHeader, MessageToUser} from "CustomComponents/CustomComponents.js"
import {setTab} from "CustomComponents/CricDreamTabs.js"
import { BlankArea } from 'CustomComponents/CustomComponents';
import { generateUnderlyingIndexString, getAxiosUrl } from "views/functions"
 

function leavingNifty(myConn) {
  console.log("Leaving Nifty wah wah ");
  myConn.disconnect();
}

var sockConn; 

function currency(num) {
  let myStr = (num) ? num.toFixed(2) : "-";
  return myStr;
}

function noncurrency(num) {
  let myStr = (num) ? num.toString() : "-";
  return myStr;
}

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
  tdyellow : {
    // border: 5,
    background: '#FFFF00',
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

}));

export default function Nifty() {
  const classes = useStyles();

  const [masterData, setmasterData] = React.useState([]);
  const [originalData, setOriginalData] = React.useState([]);
  const [rows, setNiftyDataArray] = React.useState([]);
  const [errorMessage, setErrorMessage ] = React.useState("");
  const [userMessage, setUserMessage] = React.useState("");
  const [nseNameList, setNseNameList] = React.useState([]);
  const [selectedNseName, setselectedNseName] = React.useState("");
  const [expiryDateList, setExpiryDateList] = React.useState([]);
  const [selectedExpiryDate, setSelectedExpiryDate] = React.useState("");
  const [displayString, setDisplayString] = React.useState("");
  const [underlyingValue, setUnderlyingValue] = React.useState(0);
  const [margin, setMargin] = React.useState(2000);
  const [callPut, setCallPut] = React.useState("CALL");

  var sendMessage = {page: "NSEDATA", csuid: sessionStorage.getItem("csuid")};

  function getSessionStorage(id) {
    return (sessionStorage.getItem(id)) ? sessionStorage.getItem(id) : "";
  }


  useEffect(() => {       

    const makeconnection = async () => {
      await sockConn.connect();
    }

    sockConn = socketIOClient(process.env.REACT_APP_ENDPOINT);
    
    makeconnection();

    sockConn.on("connect", function() {
      sockConn.emit("page", {page: "NSEDATA", uid: '0' });

      sockConn.on("NSEDATA", (mynsedata) => {
        //console.log("In NSEDATA");
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
          let myStr = generateUnderlyingIndexString(selectedNseName, 0, "");
          setDisplayString(myStr);
        }


      });

    });


    const fetchnifty = async () => {
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
          let myDates = await getExiryDates(currNse)
          if (myDates.length > 0) {
            // console.log(myDates.length);
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

    fetchnifty();

    return () => {
      // componentwillunmount in functional component.
      // Anything in here is fired on component unmount.
      leavingNifty(sockConn);
  }
}, []);


  async function getExiryDates(niftyName) {
    let myDates = [];
    try {
      let resp = await axios.get(getAxiosUrl(`/nifty/getexpirydate/${niftyName}`));

      //setExpiryDateList(resp.data);
      myDates = resp.data;
      // console.log(`expiry success ${resp.data[0].expiryDate}`)
    } catch (e) {
      console.log(e)
    }
    // console.log(myDates);
    return myDates;
  }

  async function readNSEData(nseName, expiryDate) {
    try {
      sendMessage["uid"] = sessionStorage.getItem("uid");
      sendMessage["stockName"] = nseName;
      sendMessage["expiryDate"] = expiryDate;
      sendMessage["margin"] = margin;
      //console.log(sendMessage);
      sockConn.emit("page", sendMessage);
    } catch (e) {
        console.log(e)
    }
  }

  const handleSelectedExpiryDate = async (event) => {
    setSelectedExpiryDate(event.target.value);
    //console.log(`Selecyed expiry daye ${event.target.value}`);
    await readNSEData(selectedNseName, event.target.value);
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
        await readNSEData(event.target.value, currExpiryDate);
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

  function DisplayNiftyData() {
    let myData = (callPut === "CALL") ?
      rows.filter(x => x.ce_openInterest || 
        x.ce_changeinOpenInterest ||
        x.ce_changeinOpenInterest ||
        x.ce_totalTradedVolume ||
        x.ce_impliedVolatility ||
        x.ce_lastPrice) :
      rows.filter(x => x.pe_openInterest || 
        x.pe_changeinOpenInterest ||
        x.pe_changeinOpenInterest ||
        x.pe_totalTradedVolume ||
        x.pe_impliedVolatility ||
        x.pe_lastPrice);
    return (
      <div className={classes.root}>
          <TableContainer>
            <Table className={classes.table} aria-labelledby="tableTitle" size='small' aria-label="enhanced table" >
              <TableHead>
                <TableRow align="center">
                  <TableCell className={classes.th} colSpan="6" align="center">{callPut} Data</TableCell>
                </TableRow> 
                <TableRow align="center">
                  <TableCell className={classes.th} align="center">Strike Price</TableCell>
                  <TableCell className={classes.th} align="center">LTP</TableCell>
                  <TableCell className={classes.th} align="center">IV</TableCell>
                  <TableCell className={classes.th} align="center">Volume</TableCell>
                  <TableCell className={classes.th} align="center">OI Change</TableCell>
                  <TableCell className={classes.th} align="center">OI</TableCell>
                </TableRow> 
              </TableHead>
              <TableBody>
                {myData.map((item) => {
                  // const labelId = `enhanced-table-checkbox-${index}`;
                  //console.log(`${item.ce_openInterest}`)
                  return (
                    <TableRow key={item.strikePrice}>
                      <TableCell className={(item.strikePrice < underlyingValue) ? classes.td : classes.tdyellow} 
                        align="center">{item.strikePrice}
                      </TableCell>
                      <TableCell className={classes.td} align="center">
                        {currency((callPut === "CALL") ? item.ce_lastPrice : item.pe_lastPrice)}
                      </TableCell>      
                      <TableCell className={classes.td} align="center">
                        {currency((callPut === "CALL") ? item.ce_impliedVolatility : item.pe_impliedVolatility)}
                      </TableCell>      
                      <TableCell className={classes.td} align="center">
                        {noncurrency((callPut === "CALL") ? item.ce_totalTradedVolume : item.pe_totalTradedVolume)}
                      </TableCell>      
                      <TableCell className={classes.td} align="center">
                        {noncurrency((callPut === "CALL") ? item.ce_changeinOpenInterest : item.pe_changeinOpenInterest)}
                      </TableCell>      
                      <TableCell className={classes.td} align="center">
                        {noncurrency((callPut === "CALL") ? item.ce_openInterest : item.pe_openInterest)}
                      </TableCell>      
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {/* <TablePagination
            rowsPerPageOptions={[50, 75, 100, 150, 200]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          /> */}
      </div> 
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

  return (
    <Paper className={classes.paper}>
      <DisplayPageHeader headerName="NSE India" />
      <BlankArea />
      <DisplaySelection />
      <CallPutButton />
      <DisplayNiftyData />
      <Typography className={classes.error} align="left">{errorMessage}</Typography>
    </Paper>
  );
}
