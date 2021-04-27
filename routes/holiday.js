//const { default: axios } = require('axios');
const { checkActiveCsuid } = require('./niftyfunctions'); 
var router = express.Router();
// let HolidayRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  // HolidayRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});

router.get('/year/:myYear/:myCsuid', async function (req, res, next) {
  // HolidayRes = res;
  setHeader(res);

  var { myYear, myCsuid} = req.params;

  if (!isUserActive(res, myCsuid )) return;

  publishHolidays(res, myYear);
}); 

router.get('/add/:hType/:desc/:myDate/:sTime/:eTime/:myCsuid', async function (req, res, next) {
  // HolidayRes = res;
  setHeader(res);
  var { hType, desc, myDate, sTime, eTime, myCsuid } = req.params;

  if (!isUserActive(res, myCsuid )) return;

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
    sendok(res, hRec);
  } else {
    senderr(res, 601, "Date already configured");
  }
});

router.get('/delete/:myDate/:myCsuid', async function (req, res, next) {
  // HolidayRes = res;
  setHeader(res);

  var { myDate, myCsuid} = req.params;

  if (!isUserActive(res, myCsuid )) return;

  console.log(`date is ${myDate}`);
  let sts = await Holiday.deleteOne({date: myDate});
  console.log(sts.deletedCount);
  if (sts.deletedCount > 0)
    sendok(res, "OK");
  else
    senderr(res, 601, "Unable to delete the holiday record");
}); 

router.get('/delall/:myCsuid', async function (req, res, next) {
  // HolidayRes = res;
  setHeader(res);

  var { myCsuid} = req.params;

  if (!isUserActive(res, myCsuid )) return;

  await Holiday.deleteMany({});
  sendok(res, "OK");
}); 

router.get('/list/:myCsuid', async function (req, res, next) {
  // HolidayRes = res;
  setHeader(res);

  var { myCsuid} = req.params;
  
  if (!isUserActive(res, myCsuid )) return;

  // let allData = await Holiday.find({});
  // allData = _.sortBy(allData, 'date');
  // console.log(allData);
    // sendok(res, allData);
    publishHolidays(res, 0);   // Holidays of all the years
}); 

router.get('/testtime/:timevalue', async function (req, res, next) {
  // HolidayRes = res;
  setHeader(res);
  var { timevalue } = req.params;
  let myDate = new Date(parseInt(timevalue));
  // myDate.setTime(myDate);
  // console.log(finalDate);
  sendok(res, myDate);
});


router.get('/currentyearholiday', async function (req, res, next) {
  // HolidayRes = res;
  setHeader(res);

  // provide list of holidays for current year
  let tmp = new Date();
  publishHolidays(res, tmp.getFullYear());
}); 

async function publishHolidays(res, year) {
  let myFilter = (year != 0) ? {year: year} : {};
  let myData = await Holiday.find(myFilter);
  myData = _.sortBy(myData, x => x.date);
  sendok(res, myData);
}

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
