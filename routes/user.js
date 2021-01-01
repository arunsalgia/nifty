const { sortedIndexOf } = require("lodash");
const { route, use } = require(".");
router = express.Router();
// const allUSER = 99999999;
let UserRes;



/* GET all users listing. */
router.get('/', function (req, res, next) {
  UserRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  if (req.url == "/")
    publish_users({});
  else
    next('route');
});



//=============== SIGNUP
router.get('/signup/:uName/:uPassword/:uEmail', async function (req, res, next) {
  UserRes = res;
  setHeader();
  var {uName, uPassword, uEmail } = req.params;
  var isValid = false;
  // if user name already used up
  var lname = getLoginName(uName);
  var dname = getDisplayName(uName);
  uEmail = uEmail.toLowerCase();

  let uuu = await User.findOne({userName: lname });
  if (uuu) {senderr(602, "User name already used."); return; }
  uuu = await User.findOne({ email: uEmail });
  if (uuu) {senderr(603, "Email already used."); return; }
  
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
      password: uPassword,
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
  sendok("OK"); 
})

//=============== RESET
router.get('/reset/:userId/:oldPwd/:newPwd', async function (req, res, next) {
  UserRes = res;
  setHeader();
  var {userId, oldPwd, newPwd } = req.params;

  var uDoc = await uDoc.findOne({uid: userId});
  if (!uDoc) { senderr(602, "Invalid user Name or Passwod"); return; }
  if (uDoc.password !== oldPwd) { senderr(602, "Invalid user Name or Passwod"); return; }
  uDoc.password = newPwd;
  uDoc.save();
  sendok("OK");
});

//=============== LOGIN
router.get('/login/:uName/:uPassword', async function (req, res, next) {
  UserRes = res;
  setHeader();
  var {uName, uPassword } = req.params;
  var isValid = false;
  let lName = getLoginName(uName);
  let uRec = await User.findOne({ userName:  lName});
  // console.log(uRec)
  if (await userAlive(uRec)) 
    isValid = (uPassword === uRec.password);

  if (isValid) sendok(uRec);
  else         senderr(602, "Invalid User name or password");
});

//=============== forgot passord. email pwd to user
router.get('/xxxxxemailpassword/:mailid', async function (req, res, next) {
  UserRes = res;
  setHeader();
  var {mailid} = req.params;
  var isValid = false;
  let uRec = await User.findOne({ email: mailid });
  if (!uRec) {senderr(602, "Invalid email id"); return  }
  

  // mailOptions.to = uRec.email;
  let mySubject = 'User info from CricDream';
  let myText = `Dear User,
  
    Greeting from CricDeam.

    As request by you here is your password.

    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${uRec.password}

    Regards,
    for Cricdream.`

    if (sendEmailToUser(urec.email, mySubject, myText))
      sendok("OK")
    else
      senderr(603, EMAILERROR);
}); 


router.get('/emailpassword/:mailid', async function (req, res, next) {
  UserRes = res;
  setHeader();
  var {mailid} = req.params;
  var isValid = false;
  mailid = mailid.toLowerCase();
  let uRec = await User.findOne({ email: mailid });
  if (!uRec) {senderr(602, "Invalid email id"); return  }
  

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CRICDREAMEMAILID,
      pass: 'Anob@1989#93'
    }
  });

  var mailOptions = {
    from: CRICDREAMEMAILID,
    to: 'arunsalgia@gmail.com',
    subject: 'User info from CricDream',
    text: 'That was easy!'
  };

  
  mailOptions.to = uRec.email;
  mailOptions.text = `Dear User,
  
    Greeting from CricDeam.

    As request by you here is your password.

    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${uRec.password}

    Regards,
    for Cricdream.`


  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      senderr(603, error);
    } else {
      console.log('Email sent: ' + info.response);
      sendok('Email sent: ' + info.response);
    }
  });
}); 

router.get('/emailwelcome/:mailid', async function (req, res, next) {
  UserRes = res;
  setHeader();
  var {mailid} = req.params;
  var isValid = false;
  mailid = mailid.toLowerCase();

  let uRec = await User.findOne({ email: mailid });
  console.log(uRec)
  if (!uRec) {senderr(602, "Invalid email id"); return  }

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CRICDREAMEMAILID,
      pass: 'Anob@1989#93'
    }
  });

  var mailOptions = {
    from: CRICDREAMEMAILID,
    to: 'arunsalgia@gmail.com',
    subject: 'Welcome to CricDream',
    text: 'That was easy!'
  };

  mailOptions.to = uRec.email;
  mailOptions.text = `Dear ${uRec.displayName},
  
    Welcome to the family of CricDeam.

    Thanking you registering in CricDream.

    You can now create Group, with family and friends and select the tournament,
    Auction players among group members
    and let CricDream provide you the players details during the tournament.

    Your login details are:
    
    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${uRec.password}

    Regards,
    for Cricdream.`

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      senderr(603, error);
    } else {
      console.log('Email sent: ' + info.response);
      sendok('Email sent: ' + info.response);
    }
  });
}); 




async function publish_users(filter_users) {
  //console.log(filter_users);
  var ulist = await User.find(filter_users);
  // ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName', 'defaultGroup']));
  ulist = _.sortBy(ulist, 'userName');
  sendok(ulist);
}



function sendok(usrmgs) { UserRes.send(usrmgs); }
function senderr(errcode, errmsg) { UserRes.status(errcode).send({error: errmsg}); }
function setHeader() {
  UserRes.header("Access-Control-Allow-Origin", "*");
  UserRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;

