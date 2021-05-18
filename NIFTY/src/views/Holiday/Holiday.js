import React, { useEffect } from 'react';
// import react from 'react'
// import { IsEmpty, Map } from "react-lodash"
import axios from "axios"; // 
import Link from '@material-ui/core/Link';
import Modal from 'react-modal';
import { lighten, makeStyles } from '@material-ui/core/styles';
import modalStyles from 'assets/modalStyles';
import globalStyles from 'assets/globalStyles';
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
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
// import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import { red, blue, orange } from '@material-ui/core/colors';
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
import { getAxiosUrl, validateSpecialCharacters, getUserType, sendHeartBeat, inactiveError } from "views/functions"
//import DeleteIcon from '@material-ui/icons/Delete';

// const yearList = ["2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
const holidayTypeList = ["HOLIDAY", "CUSTOMDAY"]
const Month = {"01": "Jan", "02": "Feb", "03": "Mar", 
               "04": "Apr", "05": "May", "06": "Jun", 
               "07": "Jul", "08": "Aug", "09": "Sep", 
               "10": "Oct", "11": "Nov", "12": "Dec"};


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
  },
  desc: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
    paddingRight: 10,
  },
  table: {
    //minWidth: 750,
  },
  th : {
    //border: 5,
    align: "center",
    padding: "none",
    color: orange[700],
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightBold,
  },
  td : {
    // border: 5,
    // align: "center",
    padding: "none",
    fontSize: theme.typography.pxToRem(18),
    height: 40,
    // fontWeight: theme.typography.fontWeightBold,
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
  tableField: {
    border: "1px solid black",
  },
  dateField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
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
    fontSize: '18px',
    color: blue[900],
    // // position: 'absolute',
    // alignItems: 'center',
    // marginTop: '0px',
  },
  button: {
    margin: theme.spacing(0, 1, 0),
  },

}));


export default function Holiday() {
  const [yearList, setYearList] = React.useState([]);
  const [holidayList, setHolidayList] = React.useState([]);
  const [currYear, setCurrYear] = React.useState(2021);
  const [errorMessage, setErrorMessage ] = React.useState("");

  // for holiday details edit/add
  const [nhRegisterStatus, setNhRegisterStatus] = React.useState(0)
  const [holidayType, setHolidayType] = React.useState("HOLIDAY");
  const [timeNotNeeded, setTimeNotNeeded] = React.useState(true);
  const [holidayDesc, setHolidayDesc] = React.useState("");
  const [holidayDate, setHolidayDate] = React.useState("2021-01-26");
  const [holidayStartTime, setHolidayStartTime] = React.useState("09:30");
  const [holidayEndTime, setHolidayEndTime] = React.useState("15:30");

  const [generalUser, setGeneralUser] = React.useState(true);
  const [deleteText, setDeleteText] = React.useState("");

  useEffect(() => {       
    let myCurrYear;
    const createYearList = () => {
      let myDate = new Date();
      myCurrYear = myDate.getFullYear();
      let myYearList = [];
      let maxYear = parseInt(process.env.REACT_APP_HOLIDAYYEARS);
      // console.log(maxYear, process.env.REACT_APP_HOLIDAYYEARS);
      for(let i=0; i < maxYear; ++i) {
        myYearList.push( (myCurrYear+i).toString());
      }
      // console.log(myYearList)
      setYearList(myYearList);
    }
    const fetchHolidays = async () => {
      setCurrYear(myCurrYear);
      //console.log(myYear);
      readHolidays(myCurrYear);
    }
    const setUser = () => {
      let myUserType = getUserType();
      if (myUserType.includes("OPER") || myUserType.includes("SUPER")) {
        setGeneralUser(false);
        setDeleteText("Delete");
      }
    }
    setUser();
    createYearList();
    fetchHolidays();
  }, []);

  function readHolidays(myYear) {
    let myUrl = getAxiosUrl(`/holiday/year/${myYear}`);
    axios.get(myUrl
      // apiPath.signUpPath,
      // { user: data },
    ).then((response) =>{
      // console.log('then')
      // console.log(response)
      setHolidayList(response.data);
      }   
    ).catch((e) => {
      console.log('catch')
      console.log(e);
    }).finally(() =>
    { 
      // console.log("in finally");
    });
  }


  const classes = useStyles();
  const gClasses = globalStyles();


  const handleSelectedYear = async (event) => {
    setCurrYear(parseInt(event.target.value));
    // console.log(`Selecyed year ${event.target.value}`);
    readHolidays(parseInt(event.target.value));
  }


  function DisplayYear() {
    return ( 
      <Grid key="gr-group" container justify="center" alignItems="center" >
      <Grid align="right" m={2} item xs={8} sm={8} md={6} lg={6} >
      <Typography className={classes.desc}>Custom days of year </Typography>
      </Grid>
      <Grid item padding={10} align="left" xs={4} sm={4} md={6} lg={6} >
      <Select  labelId='year' id='year' variant="outlined" required 
        // fullWidth
        //size="small"
        label="Select Year"
        name="year"
        id="year"
        value={currYear}
        onChange={handleSelectedYear}>
        {yearList.map(x =><MenuItem key={x} value={x}>{x}</MenuItem>)}
      </Select>
      </Grid>
      </Grid>
    )
  }


  async function handleAddNewHoliday() {
    console.log("Add new holiday");
    let newError = 0;
    let newDesc = document.getElementById("Holidaydesc").value;
    //console.log(newDesc);
    if (newDesc.length === 0) {
      setNhRegisterStatus(-2);
      return;
    } 
    let tmp = validateSpecialCharacters(newDesc);
    //console.log(`Check speci is ${tmp}`)
    if (!tmp) {
      setNhRegisterStatus(-4);
      return;
    }
    setHolidayDesc(newDesc);

    let myDate = document.getElementById("hdate").value;
    //console.log(`Date is ${myDate}`)
    //console.log(myDate.substring(0, 4));
    if (parseInt(myDate.substring(0, 4)) != currYear) {
      setNhRegisterStatus(-1);
      return;
    }
    // check if date already defined
    tmp = holidayList.find(x => x.date === myDate);
    if (tmp) {
      setNhRegisterStatus(-6);
      return;
    }
    // now check if date already there
    let sTime = document.getElementById("stime").value;
    //console.log(`Date is ${sTime}`)
    let eTime = document.getElementById("etime").value;
    //console.log(`Date is ${eTime}`)
    if (holidayType.includes("CUSTOM")) {
      //console.log("Check for time range");
      let myStime = new Date(myDate+" "+sTime);
      let myEtime = new Date(myDate+" "+eTime);
      if ((myEtime.getTime() - myStime.getTime()) <= 0) {
        setNhRegisterStatus(-3);
        return;
      }
    }
    
    //console.log("Allfine")
    try {
      //await sendHeartBeat();
      let myUrl = getAxiosUrl(`/holiday/add/${holidayType}/${newDesc}/${myDate}/${sTime}/${eTime}`);
      await axios.get(myUrl); 
      readHolidays(currYear);
      //console.log("Update without erro");
      setNhRegisterStatus(0);
      closeModal();
    } catch (e) {
      console.log("error found");
      console.log(e);
      // if (e.response.status == process.env.REACT_APP_INACTIVEERR)
      //   inactiveError();
      setNhRegisterStatus(-5);
    }
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

  function handleHolidayType(event) {
    let hType = event.target.value;
    setHolidayType(hType);
    setTimeNotNeeded(hType === "HOLIDAY")
  }

  function ShowNhResisterStatus() {
    let myMsg;
    let isError = true;
    switch (nhRegisterStatus) {
      case -1:
        myMsg = `Year should be ${currYear}`;
        break;
      case -2:
        myMsg = "Description cannot be blank";
        break;
      case -4:
        myMsg = "Special characters not permitted in Description";
        break;
      case -3:
        myMsg = "End time should be later than Start time";
        break;
      case -5:
        myMsg = "Error updating new holiday";
        break;
      case -6:
        myMsg = "Duplicate Date";
        break;
      case 0:
        myMsg = "";
        isError = false;
        break;
      default:
          myMsg = `Unknown Error ${nhRegisterStatus}`;
          break;
    }
    return(
        <Typography align="center" className={(isError) ? gClasses.error : gClasses.nonerror}>{myMsg}</Typography>
    )
  }

  // [defDate, setDefDate] = React.useState("2021-01-26");
  var today;
  function origGetNewHoliday(props) {
  //console.log(`Select is ${holidayType}`);
  if (props.holidayType === "new") {
    let x = new Date();
    x.setFullYear(currYear)
    setHolidayDate(x.toDateString("yyyy-mm-dd"));
    // if (holidayDesc.length === 0)
    // setHolidayDesc(`Holiday of ${x.toDateString("dd-mm-yyyy")}`)
    setHolidayDesc(``)
    setHolidayStartTime("09:30");
    setHolidayEndTime("15:30");
  }
  return (
  <form>
    <Grid container justify="center" alignItems="center" >
    <Grid align="center" m={2} item xs sm md lg >
    <TextField
      id="Holidaydesc"
      label="Description"
      variant="outlined"
      fullWidth
      required
      defaultValue={holidayDesc}
      //className={classes.dateField}
      // InputLabelProps={{
      //   shrink: true,
      // }}
    />
    </Grid>
    </Grid>
    <BlankArea />
    <Grid container justify="center" alignItems="center" >
    <Grid align="center" m={2} item xs={6} sm={6} md={6} lg={6} >
    <Select  labelId='htype' id='htype' variant="outlined" required 
      fullWidth
      //size="small"
      label="HolidayType"
      name="htype"
      value={holidayType}
      onChange={handleHolidayType}>
      {holidayTypeList.map(x =><MenuItem key={x} value={x}>{x}</MenuItem>)}
    </Select>
    </Grid>
    <Grid align="center" m={2} item xs={6} sm={6} md={6} lg={6} >
    <TextField
      id="hdate"
      label="Date"
      type="date"
      variant="outlined"
      required
      defaultValue={holidayDate}
      className={classes.dateField}
      InputLabelProps={{
        shrink: true,
      }}
    />
    </Grid>
    </Grid>
    <BlankArea/>
    <Grid container justify="center" alignItems="center" >
    <Grid align="center" m={2} item xs={6} sm={6} md={6} lg={6} >
    <TextField
      id="stime"
      label="Start Time"
      type="time"
      variant="outlined"
      required
      fullWidth
      disabled={timeNotNeeded}
      defaultValue={holidayStartTime}
      className={classes.dateField}
      InputLabelProps={{
        shrink: true,
      }}
    />
    </Grid>
    <Grid align="center" m={2} item xs={6} sm={6} md={6} lg={6} >
    <TextField
      id="etime"
      label="End Time"
      type="time"
      variant="outlined"
      required
      fullWidth
      disabled={timeNotNeeded}
      defaultValue={holidayEndTime}
      className={classes.dateField}
      InputLabelProps={{
        shrink: true,
      }}
    />
    </Grid>
    </Grid>
    <ShowNhResisterStatus/>
    <BlankArea/>
    <div align="center">
    <Button key="newHoliday" variant="contained" color="primary" size="small"
        className={classes.button} onClick={handleAddNewHoliday}>Update
    </Button>
    <Button key={"cancelHoilday"} variant="contained" color="primary" size="small"
       className={classes.button} onClick={closeModal}>Cancel
    </Button>
    {/* <button>the modal</button>
    <button onClick={closeModal}>close</button> */}
    </div>
  </form>

  )}

  function GetNewHoliday(props) {
    //console.log(`Select is ${holidayType}`);
    if (props.holidayType === "new") {
      let x = new Date();
      x.setFullYear(currYear)
      setHolidayDate(x.toDateString("yyyy-mm-dd"));
      // if (holidayDesc.length === 0)
      // setHolidayDesc(`Holiday of ${x.toDateString("dd-mm-yyyy")}`)
      setHolidayDesc(``)
      setHolidayStartTime("09:30");
      setHolidayEndTime("15:30");
    }
    return (
    <form align="center">
      <Select  labelId='htype' id='htype' variant="outlined" required 
        // size="small"
        // fullWidth
        className={gClasses.modalWidth}
        label="Holiday Type"
        name="htype"
        value={holidayType}
        onChange={handleHolidayType}>
        {holidayTypeList.map(x =><MenuItem key={x} value={x}>{x}</MenuItem>)}
      </Select>
      <BlankArea />
      <TextField
        className={gClasses.modalWidth}
        id="Holidaydesc"
        label="Description"
        variant="outlined"
        // fullWidth
        required
        defaultValue={holidayDesc}
      />
      <BlankArea />
      <TextField
        className={gClasses.modalWidth}
        id="hdate"
        label="Date"
        type="date"
        variant="outlined"
        required
        // fullWidth
        defaultValue={holidayDate}
        // className={classes.dateField}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <BlankArea />
      <Grid container justify="center" alignItems="center" >
      <Grid item align="center" m={6} item xs={6} sm={6} md={6} lg={6} >
      <TextField
        id="stime"
        label="Start Time"
        type="time"
        variant="outlined"
        required
        fullWidth
        disabled={timeNotNeeded}
        defaultValue={holidayStartTime}
        // className={classes.dateField}
        InputLabelProps={{
          shrink: true,
        }}
      />
      </Grid>
      <Grid item align="center" m={6} item xs={6} sm={6} md={6} lg={6} >
      <TextField
        id="etime"
        label="End Time"
        type="time"
        variant="outlined"
        required
        fullWidth
        disabled={timeNotNeeded}
        defaultValue={holidayEndTime}
        // className={classes.dateField}
        InputLabelProps={{
          shrink: true,
        }}
      />

      </Grid>
      </Grid>
      <ShowNhResisterStatus/>
      <BlankArea/>
      <div align="center">
        <Button key="newHoliday" variant="contained" color="primary" size="small"
            className={classes.button} onClick={handleAddNewHoliday}>Update
        </Button>
        <Button key={"cancelHoilday"} variant="contained" color="primary" size="small"
          className={classes.button} onClick={closeModal}>Cancel
        </Button>
      {/* <button>the modal</button>
      <button onClick={closeModal}>close</button> */}
      </div>
    </form>  
    )}

  async function deleteDate(myDate) {
    //console.log(`in Delete`);
    //console.log(myDate);
    try {
      // await sendHeartBeat();
      let myUrl = getAxiosUrl(`/holiday/delete/${myDate}`);
      await axios.get(myUrl);
      setHolidayList(holidayList.filter(x => x.date != myDate));
    } catch (e) {
      cosole.log(e);
      if (e.response.status == process.response.REACT_APP_INACTIVEERR) {
        inactiveError();
      }
    }
  }

  function DisplayDeleteButton(props) {
    // console.log(`Date is ${props.date}`);
    if (generalUser)
      return (
        <TableCell className={gClasses.td} component="td" scope="row"  padding="none" align="center" >
       </TableCell>
      )
    else 
      return (
        <TableCell className={gClasses.td} component="td" scope="row"  padding="none" align="center" >
        <IconButton key={props.date} id={props.date} aria-label="delete" className={gClasses.delete}
          onClick={ () => deleteDate(props.date) }
        >
          <DeleteIcon />
        </IconButton>
       </TableCell>
      )
  }

  function DisplayHolidayList() {
    // console.log(myGroupTableData);
    return (
      <TableContainer>
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        aria-label="enhanced table"
      >
        <TableHead>
        <TableRow ley="header" align="center">
          <TableCell className={gClasses.th} component="th" scope="row"  padding="none" align="center">Date</TableCell>
          <TableCell className={gClasses.th} component="th" scope="row"  padding="none" align="center">Description</TableCell>
          <TableCell className={gClasses.th} component="th" scope="row"  padding="none" align="center">{deleteText}</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
          {holidayList.map((x, index) => {
            // const labelId = `enhanced-table-checkbox-${index}`;
            //console.log(`${row.ce_openInterest}`)
            let tmp = x.date.split("-");
            let myDate = tmp[2] + "/" + Month[tmp[1]];
            let myTime = "";
            if (x.type.includes("CUSTOM")) {
              myTime = " (" + x.startTime + "-" + x.endTime + ")";
            }
            return (
              <TableRow
                // tabIndex={-1}
                key={x.date}>
               <TableCell className={gClasses.td} component="td" scope="row"  padding="none" align="center" >
                  {myDate}
               </TableCell>
               <TableCell className={gClasses.td} component="td" scope="row"  padding="none" align="center" >
                  {x.desc + myTime}
               </TableCell>
               <DisplayDeleteButton date={x.date}/>
              </TableRow>
            );
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
    )
  }
    
  function DisplayAddButton() {
    if (generalUser)
      return <BlankArea />
    else
      return (
        <Button
        variant="contained"
        size="small"
        color="primary" 
        // disabled={generalUser} 
        onClick={openModal}>Add New Holiday
      </Button>
      )
  }


  return (
    <div align = "center" className={gClasses.root}>
      <Paper className={gClasses.page}>
        <DisplayYear />
        {/* <DisplayHeader /> */}
        <DisplayHolidayList />
        <Typography className={gClasses.error} align="left">{errorMessage}</Typography>
        <br/>
        <DisplayAddButton />
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={modalStyles}
          aria-labelledby="modalTitle"
          contentLabel="Example Modal"
        >
          <Typography id="modalTitle" className={classes.title} align="center">
          New Holiday
          </Typography>
          <BlankArea/>
          <GetNewHoliday holidayType="new"/>
        </Modal>
        <BlankArea />
      </Paper>
    </div>
  );
}
