import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import {red, blue, green, yellow} from '@material-ui/core/colors';

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
  button: {
    margin: theme.spacing(0, 1, 0),
  },
  groupName:  {
    // right: 0,
    fontSize: '12px',
    color: blue[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
  },
  balance:  {
    // right: 0,
    fontSize: '18px',
    color: blue[900],
    // // position: 'absolute',
    // alignItems: 'center',
    // marginTop: '0px',
  },
  error:  {
    // right: 0,
    fontSize: '12px',
    color: red[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
  },
  successMessage: {
    color: green[700],
  }, 
  failureMessage: {
    color: red[700],
  }, 
  table: {
    // minWidth: 650,
  },
}));


// export function DisplayPrizeTable(props) {
//   const classes = useStyles();
//   return (
//     <TableContainer component={Paper}>
//     <Table size="small" className={classes.table} aria-label="simple table">
//       <TableHead>
//         <TableRow>
//           <TableCell align="center">Rank</TableCell>
//           <TableCell align="center">Prize</TableCell>
//         </TableRow>
//       </TableHead>
//       <TableBody>
//         {props.tableName.map((row) => (
//           <TableRow key={row.rank}>
//             <TableCell align="center">{row.rank}</TableCell>
//             <TableCell align="center">{row.prize}</TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   </TableContainer>    
//   );
// }

export class NoGroup extends React.Component {
  render() {return <h3 align="center">Do not belong to any Group</h3>;}
}


export class BlankArea extends React.Component {
  render() {return <h3></h3>;}
}

export class NothingToDisplay extends React.Component {
  render() {return <div></div>;}
}

export function GeneralMessage (props) {
  return(<h3 align="center">{props.message}</h3>);
}


// export function DisplayGroupName (props) {
//   const classes = useStyles();
//   return(<Typography className={classes.groupName} align="center">({props.groupName})</Typography>);
// }

export function DisplayPageHeader (props) {
    // let msg = props.groupName + '-' + props.tournament;
    return (
    <div>
      <Typography align="center" component="h1" variant="h5">{props.headerName}</Typography>
      {/* <DisplayGroupName groupName={msg}/> */}
    </div>
  );
}

// export function DisplayBalance (props) {
//   const classes = useStyles();
//   let msg =  `Wallet balance: ${props.balance}`;
//   return (
//   <div>
//     <Typography align="right" className={classes.balance} >{msg}</Typography>
//   </div>
//   );
// }


export function MessageToUser (props) {
  const classes = useStyles();
  // console.log(props.mtuMessage);
  let myClass = props.mtuMessage.toLowerCase().includes("success") ? classes.successMessage : classes.failureMessage;
  return (
    <Dialog aria-labelledby="simple-dialog-title" open={props.mtuOpen}
        onClose={() => {props.mtuClose(false)}} >
        <DialogTitle id="simple-dialog-title" className={myClass}>{props.mtuMessage}</DialogTitle>
    </Dialog>
  );
}


export class Copyright extends React.Component {
  render () {
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
        <Link color="inherit" href="https://material-ui.com/">
        CricDream
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  }
}

export function CadSysLogo () {
  let mylogo = `${process.env.PUBLIC_URL}/VS.JPG`;
  const classes = useStyles();
  return (
    <Avatar className={classes.avatar}  src={mylogo}/>
);
}