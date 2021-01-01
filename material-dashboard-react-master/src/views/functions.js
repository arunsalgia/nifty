// export const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
// export const ENDPOINT = "http://localhost:4000";

import axios from "axios";


export function cdRefresh() {
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


// export function hasGroup() {
//   var sts = false;
//     if (localStorage.getItem("gid") !== null) 
//     if (localStorage.getItem("gid") !== "") 
//     if (localStorage.getItem("gid") !== "0")
//       sts = true;
//   return sts;
// }



// export async function getUserBalance() {
//   let myBalance = 0;
//   try {
//     let response = await axios.get(`/wallet/balance/${localStorage.getItem("uid")}`);
//     myBalance = (await response).data.balance;
//   } catch(err) {
//     myBalance = 0;
//   }
//   return myBalance;
// }

export function specialSetPos() {
  //console.log(`in SSP: ${localStorage.getItem("joinGroupCode")}`)
  let retval = 0;
  if (localStorage.getItem("joinGroupCode").length > 0)
    retval = 105;
  //console.log(`in SSP: ${retval}`)
  return retval;
}