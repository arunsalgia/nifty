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
crypto = require('crypto');
axios = require('axios');
const { promisify } = require('util')
sleep = promisify(setTimeout)
app = express();
const {getLoginName, getDisplayName, cricDate,
  encrypt, decrypt, dbencrypt, dbdecrypt,
	dbToSvrText, svrToDbText,
	sendCricMail,
  userAlive,
  getBlankNSEDataRec, getBlankCurrNSEDataRec,
  revDate, datePriceKey,
  getISTtime, nseWorkingTime,
  checkActiveUser, addActiveUser, delActiveUser,
} = require("./routes/niftyfunctions")
PRODUCTION=true;

PORT = process.env.PORT || 1965;
console.log(`Port is ${PORT}`);
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
holidayRouter = require('./routes/holiday');

nseRetry=5   // retry count 
nseSleep=1000 // sleep for 1 second and try to fetch data from NSE if error while getching

// maintaing list of all active client connection
connectionArray  = [];
masterConnectionArray  = [];
clientData = [];
nseData = [];

activeUserList = [];
///READNSEINTERVAL=900;    // 900 seconds in 15 minues
CLIENTUPDATEINTERVAL=10; //


readNseTimer = 0;
clientUpdateCount=0;


io.on('connect', socket => {
  app.set("socket",socket);
  socket.on("page", (pageMessage) => {
    console.log("page message from "+socket.id);
    // console.log(pageMessage);
    var myClient = _.find(masterConnectionArray, x => x.socketId === socket.id);
    // console.log("Current clinet is");
    //console.log(myClient);
    if (myClient) { 
      if (pageMessage.page.toUpperCase().includes("NSEDATA")) {
        // console.log("----Updatig page message");
        // console.log(pageMessage);
        myClient.page = "NSEDATA";
        myClient.csuid = pageMessage.csuid;
        myClient.stockName = pageMessage.stockName;
        myClient.expiryDate = pageMessage.expiryDate;
        myClient.margin = pageMessage.margin;
        myClient.firstTime = true;
        clientUpdateCount = CLIENTUPDATEINTERVAL+1;
      }
      if (pageMessage.page.toUpperCase().includes("GREEKDATA")) {
        // console.log("----Updatig page message");
        // console.log(pageMessage);
        myClient.page = "GREEKDATA";
        myClient.csuid = pageMessage.csuid;
        myClient.stockName = pageMessage.stockName;
        myClient.expiryDate = pageMessage.expiryDate;
        myClient.margin = pageMessage.margin;
        myClient.firstTime = true;
        clientUpdateCount = CLIENTUPDATEINTERVAL+1;
      } 
      if (pageMessage.page.toUpperCase().includes("DASH")) {
        // console.log("----Updatig page message");
        // console.log(pageMessage);
        myClient.page = "DASHBOARD";
        myClient.csuid = pageMessage.csuid;
        // myClient.stockName = pageMessage.stockName;
        // myClient.expiryDate = pageMessage.expiryDate;
        // myClient.margin = pageMessage.margin;
        myClient.firstTime = true;
        clientUpdateCount = CLIENTUPDATEINTERVAL+1;
      }
    }
  });
});

io.sockets.on('connection', function(socket){
  // console.log("Connected Socket = " + socket.id)
  masterConnectionArray.push({socketId: socket.id, page: "", csuid: ""});
  socket.on('disconnect', function(){
    console.log("---------------------disconnect")
    _.remove(masterConnectionArray, {socketId: socket.id});
    //console.log(masterConnectionArray);
  });
});

app.set('view engine', 'html');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'NIFTY/build/')));
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
app.use('/holiday', holidayRouter);

// ---- start of globals

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
  defaultGroup: Number,
  email: String,
  userPlan: Number,
  mobile: String
});

OLDUserSchema = mongoose.Schema({
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

HOLIDAYTYPE = [{type: 1, desc: "Holiday"}, {type: 2, desc: "Special"}];
HolidaySchema = mongoose.Schema({
  desc: String,
  type: String,
  date: String,
  startTime: String,
  endTime: String,
  year: String
  //yearMonthDay: String, /// string in YYYYMMDD format. It can be used for sorting
});

NseGreekSchema = mongoose.Schema({
  // common data
  nseName: String,
  expiryDate: String,
  strikePrice: Number,
  time: Number,
  underlyingValue: Number,
  diffDays: Number,
  diffDaysPercent: Number,
  // implied Volatility
  ce_impliedVolatility: Number,
  pe_impliedVolatility: Number,
  // CALLS
  ce_LnUlBySp: Number,
  ce_trqs2: Number,
  ce_IvSqrtDayExpir: Number,
  ce_d1: Number,
  ce_d2: Number,
  ce_normDistD1: Number,
  ce_normDistMinusD1: Number,
  ce_normDistD2: Number,
  ce_normDistMinusD2: Number,
  ce_ePowMinusRT: Number,
  ce_SpTimesePowMinusRT: Number,
  ce_ePowMinusQT: Number,
  ce_UlTimesePowMinusQT: Number,
  // PUTS
  pe_LnUlBySp: Number,
  pe_trqs2: Number,
  pe_IvSqrtDayExpir: Number,
  pe_d1: Number,
  pe_d2: Number,
  pe_normDistD1: Number,
  pe_normDistMinusD1: Number,
  pe_normDistD2: Number,
  pe_normDistMinusD2: Number,
  pe_ePowMinusRT: Number,
  pe_SpTimesePowMinusRT: Number,
  pe_ePowMinusQT: Number,
  pe_UlTimesePowMinusQT: Number,
  // CALLS alhpa beta gamma
  ce_greekPrice: Number,
  ce_greekDelta: Number,
  ce_greekGamma: Number,
  ce_greekTheta: Number,
  ce_greekVega: Number,
  ce_greekRho: Number,
  // PUTS alhpa beta gamma
  pe_greekPrice: Number,
  pe_greekDelta: Number,
  pe_greekGamma: Number,
  pe_greekTheta: Number,
  pe_greekVega: Number,
  pe_greekRho: Number
})



// models
MasterData = mongoose.model("MasterSettings", MasterSettingsSchema)
User = mongoose.model("users", UserSchema);
NiftyNames = mongoose.model("niftynames", NiftySchema);
Holiday = mongoose.model("holiday", HolidaySchema)
// for historical
NSEData = mongoose.model("nse_data", NSEDataSchema);
ExpiryDate = mongoose.model("expirydate", ExpiryDateSchema)
// for current display
CurrNSEData = mongoose.model("curr_nse_data", NSEDataSchema);
CurrExpiryDate = mongoose.model("curr_expirydate", ExpiryDateSchema)

NseGreekData = mongoose.model("curr_nseGreekdata", NseGreekSchema);


router = express.Router();

db_connection = false;      // status of mongoose connection
connectRequest = true;
// constant used by routers

SENDRES = 1;        // send OK response
SENDSOCKET = 2;     // send data on socket

// Error messages
DBERROR = 990;
DBFETCHERR = 991;
CRICFETCHERR = 992;
INACTIVEERR = 993;

ERR_NODB = "No connection to CricDream database";



// variables rreuiqred by timerma
serverTimer = 0;

// time interval for scheduler
serverUpdateInterval = 10; // in seconds. INterval after which data to be updated to server

// ----------------  end of globals

// make mogoose connection

// connection string for database
//mongoose_conn_string = "mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020";
mongoose_conn_string = "mongodb+srv://ArpanaSalgia:Arpana%4001@niftydata.alj4u.mongodb.net/NIFTY?authSource=admin&replicaSet=atlas-kvq10m-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true"

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

masterRec = null;
joinOffer=500;

fetchMasterSettings = async function () {
  // if (masterRec === null) {
    let tmp = await MasterData.find();
    masterRec = tmp[0];  
  // }  
}
