//const { default: axios } = require('axios');
const { getISTtime, nseWorkingTime, checkActiveCsuid } = require('./niftyfunctions'); 
var router = express.Router();
// let // NiftyRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  // NiftyRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});



router.get('/addnifty/:name/:code/:myCsuid', async function (req, res, next) {
  // NiftyRes = res;
  setHeader(res);

  var { name, code, myCsuid } = req.params;

  if (!isUserActive(res, myCsuid)) return;

  let niftyRec = await NiftyNames.findOne({niftyName: name});
  if (niftyRec) { senderr(res, 601, `Nifty ${name} already configured`); return; }
  
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
  sendok(res, "ok");
}); 


router.get('/list/:myCsuid', async function (req, res, next) {
  // NiftyRes = res;
  setHeader(res);

  var {myCsuid} = req.params;

  if (!isUserActive(res, myCsuid)) return;

  let allNiftyRec = await NiftyNames.find({enable: true});
  sendok(res, allNiftyRec);
}); 

router.get('/testtime/:timevalue', async function (req, res, next) {
  // NiftyRes = res;
  setHeader(res);
  var { timevalue } = req.params;
  let myDate = new Date(parseInt(timevalue));
  // myDate.setTime(myDate);
  // console.log(finalDate);
  sendok(res, myDate);
});



router.get('/getexpirydate/:nseName/:myCsuid', async function (req, res, next) {
  // NiftyRes = res;
  setHeader(res);
  let {nseName, myCsuid} = req.params;

  if (!isUserActive(res, myCsuid)) return;

  let myData = await CurrExpiryDate.find({nseName: nseName});
  myData = _.sortBy(myData, 'revDate');
  // console.log(myData);
  // console.log(nseName);
  // console.log(`Expiry date length: ${myData.length}`);
  sendok(res, myData);
}); 



async function processConnection(i) {
  // just simple connection then nothing to do
  // console.log("in process connection array");
  // console.log(connectionArray[i]);
  if ((connectionArray[i].csuid === "")  ||
      (connectionArray[i].page === "")) return;

  // if not active user, then do not send the data
  if (!checkActiveCsuid(connectionArray[i].csuid)) {
    io.to(connectionArray[i].socketId).emit('ERROR', {errorCode: INACTIVEERR});
    return;
  }

  console.log(`Process connection of ${connectionArray[i].page} for user ${connectionArray[i].csuid}`);
  console.log(connectionArray[i]);
  try {
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
      // console.log(`Fetched nsedata: ${latestData.length}`);
      if (latestData.length === 0) return;  // no data
      latestData = _.sortBy(latestData, 'strikePrice');
      let myUnderlyingValue = latestData[0].underlyingValue;

      /***
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
      ***/

      let minSP = myUnderlyingValue - connectionArray[i].margin;
      let maxSP = myUnderlyingValue + connectionArray[i].margin;
      // console.log(`MIn ${minSP}  and Max ${maxSP}`);
      tmp = _.filter(latestData, x => x.strikePrice >= minSP && x.strikePrice <= maxSP);
      //tmp = latestData;
      console.log(`Length after min/max ${tmp.length}`);
      io.to(connectionArray[i].socketId).emit('NSEDATA', tmp);

    } else if (connectionArray[i].page === "GREEKDATA") {
      let greekData = await NseGreekData.find({nseName: connectionArray[i].stockName, expiryDate: connectionArray[i].expiryDate});
      io.to(connectionArray[i].socketId).emit('GREEKDATA', greekData);

    } else if (connectionArray[i].page === "DASHBOARD") {
      console.log("Dash data to be sent");
      let myData = [];
      let myNames = ["NIFTY", "BANKNIFTY"];
      for(let n=0; n<myNames.length; ++n) {
        let niftyData = await CurrNSEData.findOne({nseName: myNames[n]});  
        let ulValue = 0; 
        let fetchTime = 0; 
        let expirtyDates = [];
        if (niftyData) {
          ulValue = niftyData.underlyingValue;
          fetchTime = niftyData.time;
          expirtyDates = await CurrExpiryDate.find({nseName: myNames[n]});
          expirtyDates = _.sortBy(expirtyDates, 'revDate');
        }
        myData.push({name: myNames[n],  
          underlyingValue: ulValue, 
          time: fetchTime,
          expiryDate: expirtyDates
        });
      }
      // let niftyData = await CurrNSEData.findOne({nseName: 'NIFTY'});
      // if (!niftyData) return;
      // let bankniftyData = await CurrNSEData.findOne({nseName: 'BANKNIFTY'});
      // if (!bankniftyData) return;
      // let tmp = {
      //   niftyValue: niftyData.underlyingValue,
      //   niftyTime: niftyData.time,
      //   bankNiftyValue: bankniftyData.underlyingValue,
      //   bankNiftyTime: bankniftyData.time,
      // }
      // console.log(tmp);
      io.to(connectionArray[i].socketId).emit('DASHBOARD', myData);
    } else {

    }
  } catch(e) {
    console.log(e);
  } 
  return;
}

async function sendClientData() {
  let T1 = new Date();
  //console.log("---------------------");
  // console.log(masterConnectionArray);
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


let scheduleSemaphore = false;
cron.schedule('*/1 * * * * *', async () => {
  if (!db_connection) {
    console.log("============= No mongoose connection");
    return;
  }   
  // console.log(clientUpdateCount, scheduleSemaphore);
  // console.log("in schedule");
  ++clientUpdateCount;
  if (scheduleSemaphore) return;
  scheduleSemaphore = true;
  // console.log(clientUpdateCount);
  try {
    if (clientUpdateCount >= CLIENTUPDATEINTERVAL) {
      console.log("======== client update"); 
      clientUpdateCount = 0; 
      // console.log(activeUserList);
      //console.log(masterConnectionArray);
      await sendClientData(); 
    }
  } catch(e) {
    console.log("Error in sendClientData");
    console.log(e);    
  }
  scheduleSemaphore = false;
});

function isUserActive(res, myCsuid) {
  let sts = true;
  if (!checkActiveCsuid(myCsuid)) {
    senderr(res, INACTIVEERR, "Inactive error");
    sts = false;
  }
  return sts;
}

function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errcode, errmsg) { res.status(errcode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
