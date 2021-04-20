import React from "react";
import { useHistory } from "react-router-dom";

export default function Logout() {
    sessionStorage.clear();
    sessionStorage.setItem("logout",true);
const history = useHistory();
history.push("/signIn")

return(<div></div>)
}