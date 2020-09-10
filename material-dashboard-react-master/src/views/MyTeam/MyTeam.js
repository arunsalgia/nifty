import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";


import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { UserContext } from "../../UserContext";
import { Typography } from '@material-ui/core';


const populateTable = (data) => {
    const tableData = [];
    data.forEach(element => {
        tableData.push({ displayName: element.displayName, players: element.players })
    });
    return tableData;

}

export default function App() {
    const { user } = useContext(UserContext);

    // const classes = useStyles();
    const theme = useTheme();
    const [teamArray, setTeamArray] = useState([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get(user.admin ? "/user/myteam/all" : `/user/myteam/${user.uid}`);


                const data = populateTable(response.data);
                // console.log(response.data);
                setTeamArray(data);
            } catch (e) {
                console.log(e)
            }


        }
        fetchTeam();
    }, []);




    return (

        teamArray.map(team => 
        <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Typography>{team.displayName}</Typography>

                <Table
                    tableHeaderColor="warning"
                    tableHead={["Player Name", "Bid Amount"]}
                    tableData={team.players.map(team => {
                        const arr = [team.playerName, team.bidAmount]

                        return { data: arr, collapse: [] }
                    })}
                />

            </Grid>
            
            )

    )

};


