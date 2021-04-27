import React, { useState ,useContex, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
// import Grid from '@material-ui/core/Grid';
// import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { UserContext } from "../../UserContext";
import axios from "axios";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import {blue, red } from '@material-ui/core/colors';
import { useHistory } from "react-router-dom";
import { encrypt, decrypt, getAxiosUrl} from "views/functions.js";
import { BlankArea, ValidComp } from 'CustomComponents/CustomComponents.js';


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
  textColor: {
    color: blue[700],
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

/***
class ChildComp extends React.Component {

  componentDidMount()  {
    // custom rule will have name 'isPasswordMatch'
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      return (value === this.props.p1)
    });

    ValidatorForm.addValidationRule('minLength', (value) => {
      return (value.length >= 6)
    });

    ValidatorForm.addValidationRule('noSpecialCharacters', (value) => {
      return validateSpecialCharacters(value);
    });

    ValidatorForm.addValidationRule('isEmailOK', (value) => {
      return validateEmail(value);
    });
  }

  
  componentWillUnmount() {
    // remove rule when it is not needed
    ValidatorForm.removeValidationRule('isPasswordMatch');
    ValidatorForm.removeValidationRule('isEmailOK');
    ValidatorForm.removeValidationRule('minLength');
    ValidatorForm.removeValidationRule('noSpecialCharacters');   
  }

  render() {
    return <br/>;
  }

}
***/
// const handleSubmit = e => {
//   e.preventDefault();
// };



export default function Profile() {
  const classes = useStyles();
  const history = useHistory();
  const [userName, setUserName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({});
  const [registerStatus, setRegisterStatus] = useState(199);

  useEffect(() => {
    const profileInfo = async () => {
      try {
        // get user details
        var userRes = await axios.get(getAxiosUrl(`/user/profile/${sessionStorage.getItem("uid")}`));
        setProfile(userRes.data); // master data for comparision if changed by user
        // setLoginName(userRes.data.loginName);
        setUserName(userRes.data.userName);
        // setGroupName(userRes.data.defaultGroup);
        let tmp = decrypt(userRes.data.email);
        setEmail(tmp);
      } catch (e) {
          console.log(e)
      }
    }
    profileInfo();
  }, []);

  // const { setUser } = useContext(UserContext);

  
  const handleProfileSubmit = async() => {
    // console.log("Submit command provided"); 
    if ((profile.email !== email) || (profile.userName !== userName)) {
      // console.log("New EMail or use name");
      let tmp1 = encrypt(email)
      try {
        await axios.get(getAxiosUrl(`/user/updateprofile/${sessionStorage.getItem("uid")}/${userName}/${tmp1}`));
        setRegisterStatus(200);
      } catch (e) {
        console.log(e);
        setRegisterStatus(e.response.status);
      }
    }
  }

  function ShowResisterStatus() {
    // console.log(`Status is ${registerStatus}`);
    let myMsg;
    switch (registerStatus) {
      case 200:
        myMsg = `User Profile successfully regisitered.`;
        break;
      case 601:
        myMsg = "Invalid User Id";
        break;
      case 602:
        myMsg = "Email id already in use";
        break;
      case 199:
        myMsg = ``;
        break;
      default:
        myMsg = "unKnown error";
        break;
    }
    return(
      <Typography className={(registerStatus === 200) ? classes.root : classes.error}>{myMsg}</Typography>
    )
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">User Profile</Typography>
    <ValidatorForm className={classes.form} onSubmit={handleProfileSubmit}>
      <TextValidator
          className={classes.textColor}
          variant="outlined"
          required
          fullWidth      
          label="User Name"
          onChange={(event) => setUserName(event.target.value)}
          name="username"
          // type=""
          validators={['required', 'minLength', 'noSpecialCharacters']}
          errorMessages={['User Name to be provided', 'Mimumum 6 characters required', 'Special characters not permitted']}
          value={userName}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          name="email"
          type="email"
          validators={['isEmailOK', 'required']}
          errorMessages={['Invalid Email', 'Email to be provided']}
          value={email}
      />
      <BlankArea/>
      {/* <TextValidator
          variant="outlined"
          // required
          fullWidth      
          // readonly
          disabled
          label="Default Group"
          name="groupName"
          value={groupName}
      /> */}
      <ShowResisterStatus/>
      <BlankArea/>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Update
    </Button>
    </ValidatorForm>
    </div>
    <ValidComp />    
    </Container>
  );
}
