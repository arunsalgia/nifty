// export const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
// export const ENDPOINT = "http://localhost:4000";

import axios from "axios";
var crypto = require("crypto");

export function cdRefresh() {
  console.log("in refresh");
  window.location.reload();
}

export function cdCurrent() {
  return String.fromCharCode(169);
}

export function cdDefault() {
  return String.fromCharCode(9745);
}

export function validateSpecialCharacters(sss) {
    var sts = false;
    const TerroristCharacters = [];

    if (!sss.includes("\""))
    if (!sss.includes("\'"))
    if (!sss.includes("\`"))
    if (!sss.includes("\\"))
    if (!sss.includes("/"))
    if (!sss.includes("~"))
    if (!sss.includes("\%"))
    if (!sss.includes("^"))
    if (!sss.includes("\&"))
    if (!sss.includes("\+"))
      sts = true;
    return sts;
}

export function encrypt(text) {
  let hash="";
  try {
    const cipher = crypto.createCipheriv(process.env.REACT_APP_ALGORITHM, 
      process.env.REACT_APP_AKSHUSECRETKEY, 
      Buffer.from(process.env.REACT_APP_IV, 'hex'));
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    hash = encrypted.toString('hex');
  }
  catch (err) {
    console.log(err);
  } 
  return hash;
};

export function decrypt(hash) {
  const decipher = crypto.createDecipheriv(process.env.REACT_APP_ALGORITHM, 
    process.env.REACT_APP_AKSHUSECRETKEY, 
    Buffer.from(process.env.REACT_APP_IV, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

//let USERTYPE = { TRIAL: 0, SUPERUSER: 1, PAID: 2, OPERATOR: 3}
export function getUserType() {
  let uType = "";
  switch(sessionStorage.getItem("userPlan")) {
    case "0" : uType = "TRIAL"; break;
    case "1" : uType = "SUPERUSER"; break;
    case "2" : uType = "PAID"; break;
    case "3" : uType = "OPERATOR"; break;
  }
  return(uType);
}

export async function sendHeartBeat() {
  try {
   await axios.get(`/user/heartbeat/${sessionStorage.getItem("uid")}`);
  } catch(e) {
    console.log(e);
  }
}


export function specialSetPos() {
  //console.log(`in SSP: ${sessionStorage.getItem("joinGroupCode")}`)
  let retval = 0;
  // if (sessionStorage.getItem("joinGroupCode").length > 0)
  //   retval = 105;
  // //console.log(`in SSP: ${retval}`)
  return retval;
}

export function validateMobile(sss) {
var sts = false;
const TerroristCharacters = [];

if (sss.length === 10)
if (!sss.includes("\."))
if (!sss.includes("\-"))
if (!sss.includes("\+"))
if (!sss.includes("\*"))
if (!sss.includes("\/"))
if (!sss.includes("e"))
if (!sss.includes("E"))
if (!isNaN(sss))
  sts = true;
return sts;
}

export function validateEmail(sss) {
  let sts = false;
  if (validateSpecialCharacters(sss)) {
    let xxx = sss.split("@");
    if (xxx.length === 2) {
      if (xxx[1].includes(".")) 
        sts = true;
    }
  }
  return sts;
}

export function getCurrentuser() {
  let myUid = 0;
  if (sessionStorage.getItem("uid") !== null)
  if (sessionStorage.getItem("uid").length > 0)
    myUid = parseInt(sessionStorage.getItem("uid"))
  return myUid;
}

export function generateUnderlyingIndexString(nsename, ulvalue, myTime) {
  let myStr = `Underlying Index: ${nsename} - `;
  if (ulvalue) {
    let myTimeStamp = myTime.toString().split("GMT");
    myStr = `Underlying Index: ${nsename} ${ulvalue} at ${myTimeStamp[0].trim()}`;
  }
  return myStr;
}

export function getAxiosUrl(myurl) {
  return (`${process.env.REACT_APP_AXIOS_BASEPATH}${myurl}/${sessionStorage.getItem("csuid")}`);
}

export async function logoutUser() {
  console.log("in logout");
  await axios.get(getAxiosUrl('/user/logout'));
  console.log("just given logout axios call");
  sessionStorage.setItem("uid", "");
  sessionStorage.setItem('csuid', "");
  cdRefresh();  
}

export function inactiveError() {
  sessionStorage.setItem("uid", "");
  sessionStorage.setItem("csuid", "");
}