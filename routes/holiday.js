//const { default: axios } = require('axios');
const { getISTtime, nseWorkingTime } = require('./niftyfunctions'); 
var router = express.Router();
let HolidayRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  HolidayRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  next('route');
});



router.get('/year/:myYear', async function (req, res, next) {
  HolidayRes = res;
  setHeader();

  var { myYear} = req.params;
  console.log(`Year is ${myYear}`);
  let myRecList = await Holiday.find({year: myYear});
  myRecList = _.sortBy(myRecList, 'date');
  sendok(myRecList);
}); 

router.get('/delete/:myDate', async function (req, res, next) {
  HolidayRes = res;
  setHeader();

  var { myDate} = req.params;
  console.log(`date is ${myDate}`);
  let sts = await Holiday.deleteOne({date: myDate});
  console.log(sts.deletedCount);
  if (sts.deletedCount > 0)
    sendok("OK");
  else
    senderr(601, "Unable to delete the holiday record");
}); 

router.get('/delall', async function (req, res, next) {
  HolidayRes = res;
  setHeader();

  let myRecList = await Holiday.deleteMany({});
  sendok("OK");
}); 

router.get('/list', async function (req, res, next) {
  HolidayRes = res;
  setHeader();
  let allData = await Holiday.find({});
  allData = _.sortBy(allData, 'date');
  console.log(allData);
  sendok(allData);
}); 

router.get('/testtime/:timevalue', async function (req, res, next) {
  HolidayRes = res;
  setHeader();
  var { timevalue } = req.params;
  let myDate = new Date(parseInt(timevalue));
  // myDate.setTime(myDate);
  // console.log(finalDate);
  sendok(myDate);
});

router.get('/add/:hType/:desc/:myDate/:sTime/:eTime', async function (req, res, next) {
  HolidayRes = res;
  setHeader();
  var { hType, desc, myDate, sTime, eTime } = req.params;

  console.log("add holiday");
  let hRec = await Holiday.findOne({date: myDate});
  if (!hRec) {
    hRec = new Holiday();
    hRec.desc = desc;
    hRec.type = hType;
    hRec.date = myDate;
    hRec.startTime = sTime;
    hRec.endTime = eTime;
    hRec.year = myDate.substring(0,4);
    console.log(hRec.year);
    hRec.save();
    sendok(hRec);
  } else {
    senderr(601, "Date already configured");
  }
});


/**
router.get('/getnsedata/:nseName/:expiryDate/:myRange', async function (req, res, next) {
  HolidayRes = res;
  setHeader();
  let {nseName, expiryDate} = req.params;

  let myRange = DEFAULTRANGE;

  let nameRec = await NiftyNames.findOne({niftyName: nseName, enable: true});
  if (!nameRec) {
    senderr(601, "Invalid NSE name");
    return;
  }
  let latestData = await read_nse_data(nameRec);
  latestData.niftyData = _.filter(latestData.niftyData, x => x.expiryDate === expiryDate);
  sendok({dispString: latestData.dispString, niftyData: latestData.niftyData});
}); 
 */

router.get('/getexpirydate/:nseName', async function (req, res, next) {
  HolidayRes = res;
  setHeader();
  let {nseName} = req.params;

  let myData = await CurrExpiryDate.find({nseName: nseName});
  myData = _.sortBy(myData, 'revDate');
  //console.log(myData);
  sendok(myData);
}); 

router.get('/listholiday/:myYear', async function (req, res, next) {
  HolidayRes = res;
  setHeader();
  let {myYear} = req.params;

  publishHolidays(myYear);
}); 

router.get('/currentyearholiday', async function (req, res, next) {
  HolidayRes = res;
  setHeader();

  // provide list of holidays for current year
  let tmp = new Date();
  publishHolidays(tmp.getFullYear());
}); 

async function publishHolidays(year) {
  let myData = await Holiday.find({year: year});
  myData = _.sortBy(myData, x => x.yearMonthDay);
  sendok(myData);
}

async function processConnection(i) {
  // just simple connection then nothing to do
  // console.log("in process connection array");
  // console.log(connectionArray[i]);
  if ((connectionArray[i].uid  <= 0)  ||
      (connectionArray[i].page.length  <= 0)) return;

  console.log(`Process contion of ${connectionArray[i].page}`);
  var myDate1 = new Date();
  var myData;
  if (connectionArray[i].page === "NSEDATA") {
    let latestData = await CurrNSEData.find({nseName: connectionArray[i].stockName, expiryDate: connectionArray[i].expiryDate});
    console.log(`${connectionArray[i].stockName}  ${connectionArray[i].expiryDate}`);
    console.log(`Fetched nseata: ${latestData.length}`);
    if (latestData.length === 0) return;  // no data

    let tmp = await CurrExpiryDate.findOne({nseName: connectionArray[i].stockName, expiryDate: connectionArray[i].expiryDate});
    console.log(tmp);
    if (!tmp) return; // error. no data

    let myUnderlyingValue = parseFloat(tmp.underlyingValue);
    let myTimeStamp = tmp.timestamp;
    io.to(connectionArray[i].socketId).emit('NSEUNDERLYINGVALUE', myUnderlyingValue);

    let myDisplayString = `Underlying Index: ${connectionArray[i].stockName} ${myUnderlyingValue} at ${myTimeStamp}`

    io.to(connectionArray[i].socketId).emit('NSEDISPLAYSTRING', myDisplayString);

    //myData = {stockName: connectionArray[i].stockName, stockData: latestData.niftyData, dispString: "heelo", underlyingValue: 11.0 }
    let minSP = myUnderlyingValue - connectionArray[i].margin;
    let maxSP = myUnderlyingValue + connectionArray[i].margin;
    console.log(`${minSP}  ${maxSP}`);
    console.log(`${myUnderlyingValue}  ${connectionArray[i].margin}`);
    //tmp = _.filter(latestData, x => x.expiryDate === connectionArray[i].expiryDate);
    console.log(`Before ${latestData.length}`);
    tmp = _.filter(latestData, x => x.strikePrice >= minSP && x.strikePrice <= maxSP);
    console.log(`After ${tmp.length}`);
    io.to(connectionArray[i].socketId).emit('NSEDATA', tmp);
      // io.to(connectionArray[i].socketId).emit('rank', myData.dbData.rank);
    console.log("sent NSE data to " + connectionArray[i].socketId);``
  } else {

  }

  return;
/***
  // console.log(clientData);
  var myData = _.find(clientData, x => x.tournament === myTournament);
  let sts = false;
  if (!myData) {
    // no data of this tournament with us. Read database and do calculation
    // console.log("------------------reading database");
    sts = await readDatabase(connectionArray[i].gid );
    // console.log(`Status is ${sts} for tournamenet data ${myTournament}`);
    if (sts) {
      // console.log(connectionArray[i].gid );
      let myDB_Data = await statCalculation(connectionArray[i].gid );
      let mySTAT_Data = await statBrief(connectionArray[i].gid , 0 , SENDSOCKET);
      myData = {tournament: myTournament, dbData: myDB_Data, statData: mySTAT_Data}
      clientData.push(myData);
      var myDate2 = new Date();
      var duration = myDate2.getTime() - myDate1.getTime();
      console.log(`Total calculation Time: ${duration}`)
    }
  }
  // else
  //   console.log("----- data already availanle");
  // console.log(clientData);
  // console.log(`Will send data of ${myData.tournament} to UID ${connectionArray[i].uid}  with GID ${connectionArray[i].gid}`);
  // console.log(connectionArray[i].page);
  switch(connectionArray[i].page.substr(0, 4).toUpperCase()) {
    case "DASH":
      if (myData) {
        io.to(connectionArray[i].socketId).emit('maxRun', myData.dbData.maxRun);
        io.to(connectionArray[i].socketId).emit('maxWicket', myData.dbData.maxWicket);
        io.to(connectionArray[i].socketId).emit('rank', myData.dbData.rank);
        console.log("sent Dash data to " + connectionArray[i].socketId);
      }
      break;
    case "STAT":
      if (myData) {
          io.to(connectionArray[i].socketId).emit('brief', myData.statData);
          console.log("Sent Stat data to " + connectionArray[i].socketId);
      }
      break
    // case "AUCT":
    //   console.log(auctioData);
    //   var myRec = _.filter(auctioData, x => x.gid == connectionArray[i].gid);
    //   console.log(myRec);
    //   if (myRec.length > 0) {
    //     io.to(connectionArray[i].socketId).emit('playerChange', 
    //         myRec[0].player, myRec[0].balance );
    //       console.log("Sent Auction data to " + connectionArray[i].socketId);          
    //   }
    //   break;
  }
***/
  return;
}

async function sendClientData() {
  let T1 = new Date();
  console.log("---------------------");
  connectionArray = [].concat(masterConnectionArray)
  nseData = [];
  for(i=0; i<connectionArray.length; ++i)  {
    await processConnection(i);
  }
  let T2 = new Date();
  let diff = T2.getTime() - T1.getTime();
  // console.log(T1);
  // console.log(T2);
  console.log(`Processing all socket took time ${diff}`);
}


function sendok(usrmsg) { HolidayRes.send(usrmsg); }
function senderr(errcode, errmsg) { HolidayRes.status(errcode).send(errmsg); }
function setHeader() {
  HolidayRes.header("Access-Control-Allow-Origin", "*");
  HolidayRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
