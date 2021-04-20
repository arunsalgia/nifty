import React, { useEffect } from 'react';
// import react from 'react'
// import { IsEmpty, Map } from "react-lodash"
import axios from "axios";
import socketIOClient from "socket.io-client";
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Box from '@material-ui/core/Box';
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
import { red, blue } from '@material-ui/core/colors';
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
import { generateUnderlyingIndexString } from "views/functions"



function leavingNifty(myConn) {
  console.log("Leaving Nifty wah wah ");
  myConn.disconnect();
}

var sockConn; 

export default function Nifty() {

  // const history = useHistory();

  function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}


const headCells = [
  { id: 'ce_openInterest', numeric: true, disablePadding: true, label: 'OI' },
  { id: 'ce_changeinOpenInterest', numeric: true, disablePadding: true, label: 'OI Change' },
  { id: 'ce_totalTradedVolume', numeric: true, disablePadding: true, label: 'Volume' },
  { id: 'ce_impliedVolatility', numeric: true, disablePadding: true, label: 'IV' },
  { id: 'ce_lastPrice', numeric: true, disablePadding: true, label: 'LTP' },
  { id: 'strikePrice', numeric: true, disablePadding: true, label: 'Strike Price' },
  { id: 'pe_lastPrice', numeric: true, disablePadding: true, label: 'LTP' },
  { id: 'pe_impliedVolatility', numeric: true, disablePadding: true, label: 'IV' },
  { id: 'pe_totalTradedVolume', numeric: true, disablePadding: true, label: 'Volume' },
  { id: 'pe_changeinOpenInterest', numeric: true, disablePadding: true, label: 'OI Change' },
  { id: 'pe_openInterest', numeric: true, disablePadding: true, label: 'OI' },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  // border:"1px solid black"
  const THColumnStyle= { backgroundColor: '#EEEEEE', border: "1px solid black" };
  // const THColumnStyleBorderTop= { backgroundColor: '#EEEEEE', borderBottom: 0,  };
  // const THColumnStyleBorderBottom= { backgroundColor: '#EEEEEE', borderTop: 1,  };
  return (
    <TableHead>
      <TableRow align="center">
        <TableCell style={THColumnStyle} align="center"
            padding='none' colSpan={5}>CALLS</TableCell>
        <TableCell style={THColumnStyle} align="center"
            padding='none' colSpan={1}></TableCell>      
        <TableCell style={THColumnStyle} align="center"
            padding='none' colSpan={5}>PUTS</TableCell>            
      </TableRow>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            style={THColumnStyle} 
            key={headCell.id}
            align="center" 
            colSpan={1}
            //padding={headCell.disablePadding ? 'none' : 'default'}
            padding="none"
            sortDirection={orderBy === headCell.id ? order : false}
          >
          <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
  button: {
    margin: theme.spacing(0, 1, 0),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Nutrition
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
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
  td : {
    border: 5,
    align: "center",
    padding: "none",
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


const [masterData, setmasterData] = React.useState([]);
const [originalData, setOriginalData] = React.useState([]);
// const [rows, setStationTableData] = React.useState([]);
const [rows, setNiftyDataArray] = React.useState([]);
const [filterString, setfilterString] = React.useState("");
const [page, setPage] = React.useState(0);
const [dense, setDense] = React.useState(true);
const [rowsPerPage, setRowsPerPage] = React.useState(50);
const [errorMessage, setErrorMessage ] = React.useState("");
const [backDropOpen, setBackDropOpen] = React.useState(false);
const [userMessage, setUserMessage] = React.useState("");
const [nseNameList, setNseNameList] = React.useState([]);
const [selectedNseName, setselectedNseName] = React.useState("");
const [expiryDateList, setExpiryDateList] = React.useState([]);
const [selectedExpiryDate, setSelectedExpiryDate] = React.useState("");
const [displayString, setDisplayString] = React.useState("");
const [underlyingValue, setUnderlyingValue] = React.useState(0);
const [margin, setMargin] = React.useState(2000);
const [nextSP, setNextSP] = React.useState(0);

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
          setDisplayString("");
        }


      });

      sockConn.on("NSEDISPLAYSTRING", (dispStr) => {
        // console.log("In DISPLAY STRING");
        // setNiftyDataArray(mynsedata);
        // setmasterData(mynsedata);
        // console.log(dispStr);
        // setDisplayString(dispStr);
      });

      sockConn.on("NSEUNDERLYINGVALUE", (ulvalue) => {
        // console.log("In uderlying value");
        // setNiftyDataArray(mynsedata);
        // setmasterData(mynsedata);
        // setUnderlyingValue(ulvalue);
        //setNextSP(getNextSP(masterData, ulvalue));
      });

    });

    function getNextSP(myTable, ulValue) {
      let i = 0;
      for(i=0; i<myTable.length; ++i) {
        if (myTable.sp > unValue)
          return(myTable.sp);
      }
      return myTable[myTable.length - 1].sp;
    }


    const fetchnifty = async () => {
      let response, response1;
      try {
        response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/nifty/list`);
        setNseNameList(response.data);
        if (response.data.length > 0) {
          let currNse = getSessionStorage("dashNseName");
          console.log(currNse);
          if (currNse === "") currNse = response.data[0].niftyName;
          console.log(currNse);
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
        // //console.log(`LIst success ${response.data[0].niftyName}`);
        // response1 = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/nifty/getexpirydate/${response.data[0].niftyName}`);
        // // console.log(response1.data);
        // setExpiryDateList(response1.data);
        // setSelectedExpiryDate(response1.data[0].expiryDate);
        //console.log(`expiry success ${response1.data[0].expiryDate}`)

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

  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('StationName');
  const [selected, setSelected] = React.useState([]);

  async function getExiryDates(niftyName) {
    let myDates = [];
    try {
      let resp = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/nifty/getexpirydate/${niftyName}`);

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

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.SubstationName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };


const handleClick = (event, myUid) => {
    event.preventDefault();
    // console.log(myUid);
    // cannot remove admin from the member list
    if (sessionStorage.getItem("uid") == myUid) return;

    // take care of non admin member to add/remove
    let tmp = [].concat(masterData);
    let i;
    for(i=0; i<tmp.length; ++i) {
        if (tmp[i].uid == myUid) {
            if (tmp[i].isMember) {
                tmp[i].isMember = false;
                // console.log("it was true")
            } else {
                tmp[i].isMember = true;
                // console.log("it was false")
            }
        }
    }
    setmasterData(tmp);
  };


  const handleChangePage = (event, newPage) => {
    event.preventDefault();
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);



  function SetFilter() { 
    const chkstr = document.getElementById("filterstring").value.toLowerCase();
    setfilterString(chkstr);
    // console.log(chkstr);
    var tmp = masterData.filter(x => x.displayName.toLowerCase().includes(chkstr));
    setNiftyDataArray(tmp);
    setPage(0);
  }

  function ShowFilters() {
    return (
      <div className={classes.filter} align="right">
        <TextField className={classes.filter} id="filterstring" margin="none" size="small" defaultValue={filterString}/>        
        <Button key="filterbtn" variant="contained" color="primary" size="small"
          className={classes.button} onClick={SetFilter}>Filter
        </Button>
      </div>
    );
  }

  async function UpdateMemberList() {
    // make list of fresh member list (select existing members as well as selected new memebrs)
    var newMebmerList = masterData.filter(x => x.isMember === true);
    // console.log(newMebmerList);
    

    let uidx = 0;
    let addMember = [];
    for(uidx=0; uidx<newMebmerList.length; ++uidx) {
      let tmp = originalData.find(x => x.uid === newMebmerList[uidx].uid)
      if (!tmp) addMember.push(newMebmerList[uidx].uid);
    }
    // console.log(addMember);
    for(uidx=0; uidx<addMember.length; ++uidx) {
      let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/add/${sessionStorage.getItem("gdGid")}/${sessionStorage.getItem("uid")}/${addMember[uidx]}`)
    }

    let delMember = [];
    for(uidx=0; uidx<originalData.length; ++uidx) {
      let tmp = newMebmerList.find(x => x.uid === originalData[uidx].uid);
      if (!tmp) delMember.push(originalData[uidx].uid);
    }
    // console.log(delMember);
    for(uidx=0; uidx<delMember.length; ++uidx) {
      let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/delete/${sessionStorage.getItem("gdGid")}/${sessionStorage.getItem("uid")}/${delMember[uidx]}`)
      // console.log(response);
    }
    // setErrorMessage(`Successfully added and/or removed members of group ${sessionStorage.getItem("gdName")}`)
    setUserMessage(`Successfully added and/or removed members of group ${sessionStorage.getItem("gdName")}`);
    setBackDropOpen(true);
    setTimeout(() => setBackDropOpen(false), process.env.REACT_APP_MESSAGE_TIME);
}


function ShowGmButtons() {
    return (
    <div align="center">
        {/* <Button variant="contained" color="primary" size="small"
            // disabled={tournamentStated || (sessionStorage.getItem("gdAdmin").length === 0)}
            className={classes.button} onClick={UpdateMemberList}>Update List
        </Button> */}
        {/* <Button variant="contained" color="primary" size="small"
            className={classes.button} onClick={() => { setTab(0) }}>Done
        </Button> */}
        {/* <Switch>
            <Route  path='/admin/groupmember' component={GroupMember} key="MemberList"/>
            <Route  path='/admin/newgroup' component={NewGroup} key="NewGroup"></Route>
        </Switch> */}
    </div>)
}

function DisplayNse() {
  return (
    <Grid container 
      direction="row"
      alignItems="center"
      justify="flex-end"
      spacing={3}>
      <Grid item xs 
      
      // display="flex" alignItems="center" flexDirection="column"
      >
        <Typography className={classes.dispString} >NSE Name</Typography>
      </Grid>
      <Grid item xs>
        <Select labelId='nsename' id='nsename' variant="outlined" required 
        // fullWidth
        size="small"
        label="NSE Name"
        name="nsename"
        id="nsenameList"
        value={selectedNseName}
        onChange={handleSelectedNseName}>
        {nseNameList.map(x =><MenuItem key={x.niftyName} value={x.niftyName}>{x.niftyName}</MenuItem>)}
      </Select>
    </Grid>
    <Grid item xs></Grid>
  </Grid>
  )
}

function DisplayExpiry() {
  return (
    <Grid container spacing={3}>
      <Grid item xs>
        <Typography align="right" className={classes.dispString} >Expiry Date</Typography>
      </Grid>
      <Grid item xs>
        <Select labelId='expirydateList' id='expirydateList' variant="outlined" required 
        // fullWidth
        size="small"
        label="Expiry Date"
        name="expirydate"
        id="expirydateList"
        value={selectedExpiryDate}
        // displayEmpty 
        // inputProps={{
        //   name: 'age',
        //   id: 'outlined-age-native-simple',
        // }}
        onChange={handleSelectedExpiryDate}>
        {expiryDateList.map(x =><MenuItem key={x.expiryDate} value={x.expiryDate}>{x.expiryDate}</MenuItem>)}
        </Select>
      </Grid>
      <Grid item xs></Grid>
    </Grid>
  )
}

function DisplayTimeStamp() {
  return (
    <Grid container spacing={1}>
      <Grid item xs>
        <Typography align="right" className={classes.dispString} >{displayString}</Typography>
      </Grid>
    </Grid>
  )
}


function DisplaySelection() {
  return(
    <Grid container
      direction="row"
      alignItems="center"
      justify="flex-end"
    >
      <Grid item xs="1"/>
      <Grid item xs="1"
      >
        <Typography className={classes.dispString} >NSE Name</Typography>
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
      <Grid item xs="2">
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
      <Grid  item xs={5}>
          <Typography className={classes.dispString} >{displayString}</Typography>
      </Grid>
      <Grid  item xs></Grid>
      </Grid>
  );
}

const PEColumnStyle= { backgroundColor: '#FFB6C1' };
const CEColumnStyle= { backgroundColor: '#ADFF2F' };
const SPLowColumnStyle= { backgroundColor: '#EEEEEE', border: "1px solid black", color: "#6a00ff", fontWeight: 600};
const SPHighColumnStyle= { backgroundColor: '#FFFF00', border: "1px solid black", color: "#6a00ff", fontWeight: 600};
const PinkColumnStyle= { backgroundColor: '#FFF3E0', border: "1px solid black", margin: "0px"};
const WhiteColumnStyle= { backgroundColor: '#FFFFFF', border: "1px solid black", margin: "0px"};


function DisplayTableCell(props) {
  let myStyle;
  if (props.dataType === "CE") {
    myStyle = (props.sp < underlyingValue) ? PinkColumnStyle : WhiteColumnStyle;
  } else if (props.dataType === "PE") {
    myStyle = (props.sp < underlyingValue) ? WhiteColumnStyle : PinkColumnStyle;
  } else
    myStyle = (props.sp < underlyingValue) ? SPLowColumnStyle : SPHighColumnStyle;
  return (
    <TableCell style={myStyle} component="th" scope="row"  padding="none" align="center" >
      {props.data}
    </TableCell>
  );
}

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <DisplayPageHeader headerName="NSE India" groupName="" tournament="gdTournament"/>
        <BlankArea />
        <DisplaySelection />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length} 
              order={order}
              orderBy={orderBy}
              // onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;
                //console.log(`${row.ce_openInterest}`)
                return (
                  <TableRow
                    tabIndex={-1}
                    key={row.strikePrice}>
                  <DisplayTableCell dataType="CE" sp={row.strikePrice} data={row.ce_openInterest} />
                  <DisplayTableCell dataType="CE" sp={row.strikePrice} data={row.ce_changeinOpenInterest} />
                  <DisplayTableCell dataType="CE" sp={row.strikePrice} data={row.ce_totalTradedVolume} />
                  <DisplayTableCell dataType="CE" sp={row.strikePrice} data={row.ce_impliedVolatility} />
                  <DisplayTableCell dataType="CE" sp={row.strikePrice} data={row.ce_lastPrice} />
                  <DisplayTableCell dataType="SP" sp={row.strikePrice} data={row.strikePrice} />
                  <DisplayTableCell dataType="PE" sp={row.strikePrice} data={row.pe_lastPrice} />
                  <DisplayTableCell dataType="PE" sp={row.strikePrice} data={row.pe_impliedVolatility} />
                  <DisplayTableCell dataType="PE" sp={row.strikePrice} data={row.pe_totalTradedVolume} />
                  <DisplayTableCell dataType="PE" sp={row.strikePrice} data={row.pe_changeinOpenInterest} />
                  <DisplayTableCell dataType="PE" sp={row.strikePrice} data={row.pe_openInterest} />
                  </TableRow>
                );
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[50, 75, 100, 150, 200]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <div>
        <Typography className={classes.error} align="left">{errorMessage}</Typography>
      </div>
      <br/>
      {/* <ShowGmButtons/> */}
      {/* <MessageToUser mtuOpen={backDropOpen} mtuClose={setBackDropOpen} mtuMessage={userMessage} /> */}
    </div>
);
}
