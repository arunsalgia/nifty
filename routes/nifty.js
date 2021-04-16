//const { default: axios } = require('axios');
const { getISTtime, nseWorkingTime } = require('./niftyfunctions'); 
var router = express.Router();
let NiftyRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  NiftyRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  next('route');
});



router.get('/addnifty/:name/:code', async function (req, res, next) {
  NiftyRes = res;
  setHeader();

  var { name, code } = req.params;

  let niftyRec = await NiftyNames.findOne({niftyName: name});
  if (niftyRec) { senderr(601, `Nifty ${name} already configured`); return; }
  
  let nRec = await NiftyNames.find().limit(1).sort({ "nid": -1 });
  let newNid = 0
  if (nRec.length > 0) newNid = nRec[0].nid;
  ++newNid;
  // console.log(nRec);
  niftyRec = new NiftyNames({
    nid: newNid,
    niftyName: name,
    niftyCode: code,
    enable: true,
  });
  niftyRec.save();
  sendok("ok");
}); 


router.get('/list', async function (req, res, next) {
  NiftyRes = res;
  setHeader();
  let allNiftyRec = await NiftyNames.find({enable: true});
  sendok(allNiftyRec);
}); 

router.get('/testtime/:timevalue', async function (req, res, next) {
  NiftyRes = res;
  setHeader();
  var { timevalue } = req.params;
  let myDate = new Date(parseInt(timevalue));
  // myDate.setTime(myDate);
  // console.log(finalDate);
  sendok(myDate);
});


/**
router.get('/getnsedata/:nseName/:expiryDate/:myRange', async function (req, res, next) {
  NiftyRes = res;
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
  NiftyRes = res;
  setHeader();
  let {nseName} = req.params;

  let myData = await CurrExpiryDate.find({nseName: nseName});
  myData = _.sortBy(myData, 'revDate');
  console.log(`Expiry date length: ${myData.length}`);
  sendok(myData);
}); 

router.get('/listholiday/:myYear', async function (req, res, next) {
  NiftyRes = res;
  setHeader();
  let {myYear} = req.params;

  publishHolidays(myYear);
}); 

router.get('/currentyearholiday', async function (req, res, next) {
  NiftyRes = res;
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

  console.log(`Process connection of ${connectionArray[i].page} for user ${connectionArray[i].uid}`);
  console.log(connectionArray[i]);
  var myDate1 = new Date();
  var myData;
  //console.log(connectionArray[i])
  if (connectionArray[i].page === "NSEDATA") {
    /**  find the latest data
    const filter = { age: { $gte: 30 } };
    let docs = await Character.aggregate([
      { $match: filter }
    ]);
    ***/
    /**
      * This is good example of aggregate. 
      * Not usefull since nse data will be archived every 5/15 minues
      * and need to update web site every 10 seconds.
    */
    /**
      let docs = await NSEData.aggregate([
        { $match: {nseName: connectionArray[i].stockName, expiryDate: connectionArray[i].expiryDate} },
        { "$group": {
          "_id": null,
          "MaximumValue": { "$max": "$time" },
          "MinimumValue": { "$min": "$time" }
      }}
      ]);
      console.log(docs);
    */
    let latestData = await CurrNSEData.find({nseName: connectionArray[i].stockName, expiryDate: connectionArray[i].expiryDate});
    //console.log(`${connectionArray[i].stockName}  ${connectionArray[i].expiryDate}`);
    console.log(`Fetched nsedata: ${latestData.length}`);
    if (latestData.length === 0) return;  // no data
    latestData = _.sortBy(latestData, 'strikePrice');
    let tmp = await CurrExpiryDate.findOne({nseName: connectionArray[i].stockName, expiryDate: connectionArray[i].expiryDate});
    // console.log(tmp);
    // if (!tmp) {
    //   return; // error. no data
    // }
    // console.log("Found expirty date");

    let myUnderlyingValue = parseFloat(tmp.underlyingValue);
    let myTimeStamp = tmp.timestamp;
    console.log(`About to send ULV ${myUnderlyingValue}`)
    io.to(connectionArray[i].socketId).emit('NSEUNDERLYINGVALUE', myUnderlyingValue);

    let myDisplayString = `Underlying Index: ${connectionArray[i].stockName} ${myUnderlyingValue} at ${myTimeStamp}`
    console.log(`About to send display ${myDisplayString}`)
    io.to(connectionArray[i].socketId).emit('NSEDISPLAYSTRING', myDisplayString);

    //myData = {stockName: connectionArray[i].stockName, stockData: latestData.niftyData, dispString: "heelo", underlyingValue: 11.0 }
    let minSP = myUnderlyingValue - connectionArray[i].margin;
    let maxSP = myUnderlyingValue + connectionArray[i].margin;
    console.log(`MIn ${minSP}  and Max ${maxSP}`);
    tmp = _.filter(latestData, x => x.strikePrice >= minSP && x.strikePrice <= maxSP);
    //tmp = latestData;
    console.log(`Length after min/max ${tmp.length}`);
    io.to(connectionArray[i].socketId).emit('NSEDATA', tmp);
  } else {

  }
  return;
}

async function sendClientData() {
  let T1 = new Date();
  //console.log("---------------------");
  console.log(masterConnectionArray);
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

// schedule task


let scheduleSemaphore = false;
cron.schedule('*/1 * * * * *', async () => {
  if (!db_connection) {
    console.log("============= No mongoose connection");
    return;
  }   
  // console.log("in schedule");
  ++clientUpdateCount;
  if (scheduleSemaphore) return;
  scheduleSemaphore = true;
  // console.log(clientUpdateCount);

  if (clientUpdateCount >= CLIENTUPDATEINTERVAL) {
    console.log("======== client update"); 
    clientUpdateCount = 0; 
    // console.log(activeUserList);
    //console.log(masterConnectionArray);
    await sendClientData(); 
  }

  scheduleSemaphore = false;
});


function sendok(usrmsg) { NiftyRes.send(usrmsg); }
function senderr(errcode, errmsg) { NiftyRes.status(errcode).send(errmsg); }
function setHeader() {
  NiftyRes.header("Access-Control-Allow-Origin", "*");
  NiftyRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
