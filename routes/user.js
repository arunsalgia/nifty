const {getLoginName, getDisplayName, cricDate,
  encrypt, decrypt, dbencrypt, dbdecrypt,
	dbToSvrText, svrToDbText,
	sendCricMail,
  userAlive, checkActiveCsuid,
  getBlankNSEDataRec, getBlankCurrNSEDataRec,
  revDate, datePriceKey,
  getISTtime, nseWorkingTime,
  checkActiveUser, addActiveUser, delActiveUser, resetActiveUserTimer,
} = require("./niftyfunctions")
router = express.Router();

/* GET all users listing. */
router.get('/', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  if (req.url == "/")
    publish_users(res, {});
  else
    next('route');
});

router.get('/encrypt/:text', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  let { text } = req.params;
  const hash = encrypt(text);
  console.log(hash);
  sendok(res, hash);

});

router.get('/dbencrypt/:text', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  let { text } = req.params;
  const hash = dbencrypt(text);
  console.log(hash);
  sendok(res, hash);

});


//=============== SIGNUP

router.get('/signup/:uName/:uPassword/:uEmail', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {uName, uPassword, uEmail, myCsuid } = req.params;

  var isValid = false;
  // if user name already used up
  var lname = getLoginName(uName);
  var dname = getDisplayName(uName);
  uEmail = dbencrypt(uEmail.toLowerCase());

  let uuu = await User.findOne({userName: lname });
  if (uuu) {senderr(res, 602, "User name already used."); return; }
  uuu = await User.findOne({ email: uEmail });
  if (uuu) {senderr(res, 603, "Email already used."); return; }
  
  // uid: Number,
  // userName: String,
  // displayName: String,
  // password: String,
  // status: Boolean,
  // defaultGroup: Number,
  // email: String,
  // userPlan: Number  
  uRec = await User.find().limit(1).sort({ "uid": -1 });
  var user1 = new User({
      uid: uRec[0].uid + 1,
      userName: lname,
      displayName: dname,
      password: dbencrypt(uPassword),
      status: true,
      defaultGroup: 0,
      email: uEmail,
      userPlan: USERTYPE.TRIAL,
    });
  user1.save();
  console.log(`user user record for ${lname}`);
  // open user wallet with 0 balance
  await WalletAccountOpen(user1.uid, joinOffer);

  // console.log(user1);
  sendok(res, "OK"); 
})


//=============== RESET
router.get('/reset/:userId/:oldPwd/:newPwd/:myCsuid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {userId, oldPwd, newPwd, myCsuid } = req.params;

  if (!isUserActive(res, myCsuid)) return;

  console.log(userId);
  var uDoc = await User.findOne({uid: userId});
  console.log(uDoc);
  if (uDoc) { 
    if (uDoc.password === dbencrypt(oldPwd)) {
      uDoc.password = dbencrypt(newPwd);
      uDoc.save();
      sendok(res, "OK");
      return;
    }
  }
  senderr(res, 601, "Invalid Password"); 
});

//=============== LOGIN
router.get('/login/:uName/:uPassword', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {uName, uPassword } = req.params;

  // confirm user name okay
  let uRec = await User.findOne({ userName:  getLoginName(uName)});
  console.log(uRec);
  if (!uRec) {
    senderr(res, 601, "Invalid User name or password");
    return;
  }

  // confirm password okay
  let tmp = dbencrypt(uPassword);
  if (tmp !== uRec.password) {
    senderr(res, 601, "Invalid User name or password");
    return;
  }

  // for paid user check if validity still present
  tmp = await userAlive(uRec);
  if (!tmp) {
    senderr(res, 601, "Invalid User name or password");
    return;
  }

  let csuid = addActiveUser(uRec.uid);
  console.log(`New csuid: ${csuid}`);
  if (csuid.length === 0) {
    senderr(res, 602, "User already logged in");
    return;
  }

  sendok(res, {csuid: csuid, userRec: uRec});
});

router.get('/confirmlogin/:uName/:uPassword', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {uName, uPassword } = req.params;

  // confirm user name okay
  let uRec = await User.findOne({ userName:  getLoginName(uName)});
  if (!uRec) {
    senderr(res, 601, "Invalid User name or password");
    return;
  }

  // confirm password okay
  let tmp = dbencrypt(uPassword);
  if (tmp !== uRec.password) {
    senderr(res, 601, "Invalid User name or password");
    return;
  }

  // for paid user check if validity still present
  tmp = await userAlive(uRec);
  if (!tmp) {
    senderr(res, 601, "Invalid User name or password");
    return;
  }

  let csuid = addActiveUser(uRec.uid, true);
  console.log(`New csuid: ${csuid}`);
  if (csuid.length === 0) {
    senderr(res, 602, "User already logged in");
    return;
  }

  sendok(res, {csuid: csuid, userRec: uRec});
});


router.get('/logout/:myCsuid/', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var {myCsuid } = req.params;
  delActiveUser(myCsuid);
  sendok(res, "OK");
});

router.get('/islogged/:mycsuid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var {mycsuid } = req.params;
  // let uRec = await User.find({uid: uid});
  // let cActive = activeUserList.find(x => x.uid == uid);
  // if (cActive) {
  //   if (cActive.time <= 100000000000)
  //     status = true;
  // }
  // status = true;

  let cActive = activeUserList.find(x => x.csuid === mycsuid);
  let status = true;   //(cActive) ? true : false;
  sendok(res, {status: status});
});

router.get('/heartbeat/:uid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var {uid } = req.params;

  resetActiveUserTimer(parseInt(uid));
  sendok(res, "OK");
});



router.get('/profile/:userId/:myCsuid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { userId, myCsuid } = req.params;

  if (!isUserActive(res, myCsuid)) return;

  let userRec = await User.findOne({uid: userId});
  // console.log(userRec);
  if (userRec) {
    // let groupRec = await IPLGroup.findOne({gid: userRec.defaultGroup})
    // let myGroup = (groupRec) ? groupRec.name : "";
    sendok(res, {
      loginName: userRec.userName,
      userName: userRec.displayName,
      email: dbdecrypt(userRec.email),
      // password: encrypt(dbdecrypt(userRec.password)),
      // defaultGroup: myGroup,
    });
  } else
    senderr(res, 601, `Invalid user id ${userId}`);
});

router.get('/updateprofile/:userId/:displayName/:emailId/:myCsuid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { userId, displayName, emailId, myCsuid} = req.params;

  if (!isUserActive(res, myCsuid)) return;
  // first get the user record using uid
  let userRec = await User.findOne({uid: userId});
  if (!userRec) {senderr(res, 601, `Invalid user id ${userId}`); return; }

  // now check if email id is unique
  emailId = dbencrypt(emailId.toLowerCase());
  if (userRec.email !== emailId) {
    let tmp = await User.findOne({email: emailId});
    if (tmp) {senderr(res, 602, `Email id already in use.`); return; }
  }

  // update display name and email id
  userRec.email = emailId;
  userRec.displayName = displayName;
  userRec.save();
  sendok(res, `Update profile of user ${userRec.uid}`);    
});


router.get('/cricemailpassword/:mailid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {mailid} = req.params;
  // var isValid = false;
  //mailid = mailid.toLowerCase();
  let uRec = await User.findOne({ email: svrToDbText(mailid) });
  if (!uRec) {senderr(res, 602, "Invalid email id"); return  }
  
  let text = `Dear User,
  
    Greeting from Auction Permier League.

    As request by you here is your password.

    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${dbdecrypt(uRec.password)}

    Regards,
    for Auction Permier League`

   let xxx = decrypt(mailid);
   console.log(`Send message to ${xxx}`);
  let resp = await sendCricMail(xxx, 'User info from Auction Permier League', text);
  if (resp.status) {
    console.log('Email sent: ' + resp.error);
    sendok(res, `Email sent to ${resp.error}`);
  } else {
    console.log(`errror sending email to ${xxx}`);
    console.log(resp.error);
    senderr(res, 603, resp.error);
  }
}); 


router.get('/cricemailwelcome/:mailid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {mailid} = req.params;
  var isValid = false;
  //mailid = mailid.toLowerCase();

  let uRec = await User.findOne({ email: svrToDbText(mailid) });
  //console.log(uRec)
  if (!uRec) {senderr(res, 602, "Invalid email id"); return  }

  let text = `Dear ${uRec.displayName},
  
    Welcome to the family of Auction Permier League.

    Thanking you registering in Auction Permier League (APL).

    You can now create Group, with family and friends and select the tournament,
    Auction players among group members
    and let APL provide you the players details during the tournament.

    Your login details are:
    
    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${dbdecrypt(uRec.password)}

    Regards,
    for Auction Permier League.`

  let resp = await sendCricMail(dbdecrypt(uRec.email), 'Welcome to Auction Permier League', text);
  console.log(resp);
  if (resp.status) {
	console.log('Email sent: ' + resp.error);
	sendok(res, `Email sent to ${resp.error}`);
  } else {
	console.log(resp.error);
	senderr(res, 603, resp.error);
  }
}); 


async function publish_users(res, filter_users) {
  //console.log(filter_users);
  var ulist = await User.find(filter_users);
  // ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName', 'defaultGroup']));
  ulist = _.sortBy(ulist, 'userName');
  sendok(res, ulist);
}

function isUserActive(res, myCsuid) {
  let sts = true;
  if (!checkActiveCsuid(myCsuid)) {
    senderr(res, INACTIVEERR, "Inactive error");
    sts = false;
  }
  return sts;
}

function sendok(res, usrmgs) { res.send(usrmgs); }
function senderr(res, errcode, errmsg) { res.status(errcode).send({error: errmsg}); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;

