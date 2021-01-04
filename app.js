express = require('express');
path = require('path');
cookieParser = require('cookie-parser');
logger = require('morgan');
mongoose = require("mongoose");
cors = require('cors');
fetch = require('node-fetch');
_ = require("lodash");
cron = require('node-cron');
nodemailer = require('nodemailer');
axios = require('axios');
const { promisify } = require('util')
sleep = promisify(setTimeout)
app = express();

PORT = process.env.PORT || 1961;
http = require('http');
httpServer = http.createServer(app);
io = require('socket.io')(httpServer, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);
    res.end();
  }

});

// Routers
router = express.Router();
indexRouter = require('./routes/index');
usersRouter = require('./routes/user');
niftyRouter = require('./routes/nifty');

nseRetry=5    // retry count 
nseSleep=1000 // sleep for 1 second and try to fetch data from NSE if error while getching

// maintaing list of all active client connection
connectionArray  = [];
masterConnectionArray  = [];
clientData = [];
nseData = [];

READNSEINTERVAL=900;    // 900 seconds in 15 minues
readNseTimer = 1000;

CLIENTUPDATEINTERVAL=60; //
clientUpdateCount=0;


io.on('connect', socket => {
  app.set("socket",socket);
  socket.on("page", (pageMessage) => {
    console.log("page message from "+socket.id);
    console.log(pageMessage);
    var myClient = _.find(masterConnectionArray, x => x.socketId === socket.id);
    if (pageMessage.page.toUpperCase().includes("NSEDATA")) {
      myClient.page = "NSEDATA";
      myClient.uid = parseInt(pageMessage.uid);
      myClient.stockName = pageMessage.stockName;
      myClient.expiryDate = pageMessage.expiryDate;
      myClient.margin = parseInt(pageMessage.margin)
      myClient.firstTime = true;
      clientUpdateCount = CLIENTUPDATEINTERVAL+1;
    } else if (pageMessage.page.toUpperCase().includes("STAT")) {
      myClient.page = "STAT";
      myClient.gid = parseInt(pageMessage.gid);
      myClient.uid = parseInt(pageMessage.uid);
      myClient.firstTime = true;
      clientUpdateCount = CLIENTUPDATEINTERVAL+1;
    } else if (pageMessage.page.toUpperCase().includes("AUCT")) {
      myClient.page = "AUCT";
      myClient.gid = parseInt(pageMessage.gid);
      myClient.uid = parseInt(pageMessage.uid);
      myClient.firstTime = true;
      clientUpdateCount = CLIENTUPDATEINTERVAL+1;
    }
  });
});

io.sockets.on('connection', function(socket){
  // console.log("Connected Socket = " + socket.id)
  masterConnectionArray.push({socketId: socket.id, page: "", uid: 0});
  socket.on('disconnect', function(){
    _.remove(masterConnectionArray, {socketId: socket.id});
    
  });
});

app.set('view engine', 'html');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'material-dashboard-react-master/build/')));
app.use(express.json());


app.use((req, res, next) => {
  if (req.url.includes("admin")||req.url.includes("signIn")||req.url.includes("Logout")) {
    req.url = "/";
    res.redirect('/');
  }
  else {
    next();
  }

});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/nifty', niftyRouter);

// ---- start of globals
// connection string for database
//mongoose_conn_string = "mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020";
mongoose_conn_string = "mongodb+srv://ArpanaSalgia:Arpana%4001@niftydata.alj4u.mongodb.net/NIFTY?authSource=admin&replicaSet=atlas-kvq10m-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true"

//Schema
//Schema
MasterSettingsSchema = mongoose.Schema ({
  msid: Number,
  trialExpiry: String,
})

UserSchema = mongoose.Schema({
  uid: Number,
  userName: String,
  displayName: String,
  password: String,
  status: Boolean,
  //defaultGroup: Number,
  email: String,
  userPlan: Number
});

NiftySchema = mongoose.Schema({
  nid: Number,
  niftyName: String,
  niftyCode: Number,
  enable: Boolean,
});

NSEDataSchema = mongoose.Schema({
  nseName: String,
  expiryDate: String,
  strikePrice: Number,
  time: Number, 
  underlyingValue: Number,
  pe_openInterest: Number,
  pe_changeinOpenInterest: Number,
  pe_totalTradedVolume: Number,
  pe_impliedVolatility: Number,
  pe_lastPrice: Number,
  pe_pChange: Number,
  pe_bidQty: Number,
  pe_bidprice: Number,
  pe_askQty: Number,
  pe_askPrice: Number,
  ce_openInterest: Number,
  ce_changeinOpenInterest: Number,
  ce_totalTradedVolume: Number,
  ce_impliedVolatility: Number,
  ce_lastPrice: Number,
  ce_pChange: Number,
  ce_bidQty: Number,
  ce_bidprice: Number,
  ce_askQty: Number,
  ce_askPrice: Number,
});


ExpiryDateSchema = mongoose.Schema({
  nseName: String,
  expiryDate: String,
  revDate: String,
  time: Number,
  timestamp: String,
  underlyingValue: String,
});

HolidaySchema = mongoose.Schema({
  name: String,
  day: Number,
  month: Number,
  year: Number, 
  yearMonthDay: String, /// string in YYYYMMDD format. It can be used for sorting
});

// table name will be <tournament Name>_brief r.g. IPL2020_brief

// models
MasterData = mongoose.model("MasterSettings", MasterSettingsSchema)
User = mongoose.model("users", UserSchema);
NiftyNames = mongoose.model("niftynames", NiftySchema);
NSEData = mongoose.model("nse_data", NSEDataSchema)
ExpiryDate = mongoose.model("expirydate", ExpiryDateSchema)
Holiday = mongoose.model("holiday", HolidaySchema)

getBlankNSEDataRec = function () {
  let myblankRec = new NSEData();
  myblankRec.nseName = "";
  myblankRec.expiryDate = "";
  myblankRec.strikePrice = 0;
  myblankRec.time = 0;
  myblankRec.underlyingValue = 0;
  myblankRec.pe_openInterest = 0;
  myblankRec.pe_changeinOpenInterest = 0;
  myblankRec.pe_totalTradedVolume = 0;
  myblankRec.pe_impliedVolatility = 0;
  myblankRec.pe_lastPrice = 0;
  myblankRec.pe_pChange = 0;
  myblankRec.pe_bidQty = 0;
  myblankRec.pe_bidprice = 0;
  myblankRec.pe_askQty = 0;
  myblankRec.pe_askPrice = 0;
  myblankRec.ce_openInterest = 0;
  myblankRec.ce_changeinOpenInterest = 0;
  myblankRec.ce_totalTradedVolume = 0;
  myblankRec.ce_impliedVolatility = 0;
  myblankRec.ce_lastPrice = 0;
  myblankRec.ce_pChange = 0;
  myblankRec.ce_bidQty = 0;
  myblankRec.ce_bidprice = 0;
  myblankRec.ce_askQty = 0;
  myblankRec.ce_askPrice = 0;
  // console.log(myblankRec);
  return myblankRec;

}

router = express.Router();

db_connection = false;      // status of mongoose connection
connectRequest = true;
// constant used by routers
minutesIST = 330;    // IST time zone in minutes 330 i.e. GMT+5:30
minutesDay = 1440;   // minutes in a day 24*60 = 1440
SHORTMONTHNAME = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
MONTHNAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
weekDays = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
weekShortDays = new Array("Sun", "Mon", "Tue", "Wedn", "Thu", "Fri", "Sat");

SENDRES = 1;        // send OK response
SENDSOCKET = 2;     // send data on socket

// Error messages
DBERROR = 990;
DBFETCHERR = 991;
CRICFETCHERR = 992;
ERR_NODB = "No connection to CricDream database";

// Bid amount given to user when he/she joins group 1
GROUP1_MAXBALANCE = 1000;
allUSER = 99999999;

// Number of hours after which match details to be read frpom cricapi.
MATCHREADINTERVAL = 3;

// Wallet 

// match id for record which has bonus score for  Maximum Run and Maximum Wicket
// Note that it has be be set -ve

// variables rreuiqred by timer
serverTimer = 0;

// time interval for scheduler
serverUpdateInterval = 10; // in seconds. INterval after which data to be updated to server

// ----------------  end of globals

// make mogoose connection

// Create the database connection 
//mongoose.connect(mongoose_conn_string);
mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + mongoose_conn_string);
  db_connection = true;
  connectRequest = true;
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error');
  console.log(err);
  db_connection = false;
  connectRequest = false;   // connect request refused
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
  db_connection = false;
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
  // close mongoose connection
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
  });
  process.exit(0);
});

// schedule task
cron.schedule('*/15 * * * * *', () => {
  // console.log('running every 15 second');
  // console.log(`db_connection: ${db_connection}    connectREquest: ${connectRequest}`);
  if (!connectRequest)
    mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true });
});



// start app to listen on specified port
httpServer.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
});


// global functions

const AMPM = [
  "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM",
  "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM"
];
  /**
 * @param {Date} d The date
 */
const TZ_IST={hours: 5, minutes: 30};
cricDate = function (d)  {
  var xxx = new Date(d.getTime());
  xxx.setHours(xxx.getHours()+TZ_IST.hours);
  xxx.setMinutes(xxx.getMinutes()+TZ_IST.minutes);
  var myHour = xxx.getHours();
  var myampm = AMPM[myHour];
  if (myHour > 12) myHour -= 12;
  var tmp = `${MONTHNAME[xxx.getMonth()]} ${("0" + xxx.getDate()).slice(-2)} ${("0" + myHour).slice(-2)}:${("0" +  xxx.getMinutes()).slice(-2)}${myampm}`
  return tmp;
}

const notToConvert = ['XI', 'ARUN']
/**
 * @param {string} t The date
 */

cricTeamName = function (t)  {
  var tmp = t.split(' ');
  for(i=0; i < tmp.length; ++i)  {
    var x = tmp[i].trim().toUpperCase();
    if (notToConvert.includes(x))
      tmp[i] = x;
    else
      tmp[i] = x.substr(0, 1) + x.substr(1, x.length - 1).toLowerCase();
  }
  return tmp.join(' ');
}

getLoginName = function (name) {
  return name.toLowerCase().replace(/\s/g, "");
}

getDisplayName = function (name) {
  var xxx = name.split(" ");
  xxx.forEach( x => { 
    x = x.trim()
    x = x.substr(0,1).toUpperCase() +
      (x.length > 1) ? x.substr(1, x.length-1).toLowerCase() : "";
  });
  return xxx.join(" ");
}

masterRec = null;
joinOffer=500;

fetchMasterSettings = async function () {
    let tmp = await MasterData.find();
    masterRec = tmp[0];  
}

USERTYPE = { TRIAL: 0, SUPERUSER: 1, PAID: 2}

userAlive = async function (uRec) {
  let sts = false;
  if (uRec) {
    switch (uRec.userPlan) {
      case USERTYPE.SUPERUSER:
        sts = true;
        break;
      case  USERTYPE.PAID:
        sts = true;
        break;
      case  USERTYPE.TRIAL:
        let cTime = new Date();
        await fetchMasterSettings(); 
        // console.log(masterRec);
        let tTime = new Date(masterRec.trialExpiry);
        // console.log(cTime);
        // console.log(tTime);
        sts =  (tTime.getTime() > cTime.getTime());
        break;
    }
  }
  return sts;
}





EMAILERROR="";
CRICDREAMEMAILID='cricketpwd@gmail.com';
sendEmailToUser = async function(userEmailId, userSubject, userText) {
  // USERSUBJECT='User info from CricDream';
  // USEREMAILID='salgia.ankit@gmail.com';
  // USERTEXT=`Dear User,
    
      // Greeting from CricDeam.
  
      // As requested by you here is login details.
  
      // Login Name: ${uRec.userName} 
      // User Name : ${uRec.displayName}
      // Password  : ${uRec.password}
  
      // Regards,
      // for Cricdream.`
    
  var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CRICDREAMEMAILID,
    pass: 'Anob@1989#93'
  }
  });
  
  var mailOptions = {
  from: CRICDREAMEMAILID,
  to: userEmailId,
  subject: userSubject,
  text: userText
  };
  
  //mailOptions.to = uRec.email;
  //mailOptions.text = 
  
  var status = true;
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      EMAILERROR=error;
      //senderr(603, error);
      status=false;
    } else {
      //console.log('Email sent: ' + info.response);
      //sendok('Email sent: ' + info.response);
    }
    return(status);
  });
}


WEEKEND = [0, 6]       // (SUN=0 and SAT=6 is weekend)
STARTTIME = {hours: 9, minutes: 15}
ENDTIME = {hours: 15, minutes: 30}

let prevday = 0;
let todayIsHoliday = false;

nseWorkingTime = function() {
 
  let currDate = new Date();
  let today = currDate.getDate();
  let currHour = currDate.getHours();
  let currMinute = currDate.getMinutes();
  console.log(`Curr Time: ${currHour}:${currMinute}`);

  // if there is change of date then check if today it is holiday
  // if (today !== prevday) {
  //   let tmp = await Holiday.findOne({
  //     day: today, 
  //     month: (currDate.getMonth()+1), 
  //     year: currDate.getFullYear()
  //   });
  //   todayIsHoliday = (tmp !== null);
  //   prevday = today;
  // }
  if (todayIsHoliday) return false;

  // console.log("Not holiday")
  // check if it is weekend
  if (WEEKEND.includes(currDate.getDay()))  // if week end
    return false;

  // working day thus cehck if time is in range i.e. is it is working hour of NSE

  if (currHour < STARTTIME.hours) 
    return false;
  if (currHour > ENDTIME.hours)
    return false;
  if ((currHour === STARTTIME.hours) && (currMinute < STARTTIME.minutes))
    return false;
  if ((currHour === ENDTIME.hours) && (currMinute > ENDTIME.minutes))
    return false;

  console.log("Working time");
  return true;
}

revDate = function (myDate) {
  let xxx = myDate.split('-');
  let myIdx = SHORTMONTHNAME.indexOf(xxx[1].substr(0,3).toUpperCase()).toString();
  if (myIdx.length === 1) myIdx = "0" + myIdx;
  return(xxx[2]+myIdx+xxx[0]);
}

const zerostr = "000000";
datePriceKey = function(myDate, strikePrice) {
  let p1 = revDate(myDate);
  let p3 = strikePrice.toString();
  let p2 = (p3.length < 5) ? zerostr.substr(0, 5-p3.length) : "";
  return(`${p1}-${p2}${p3}`)
}
