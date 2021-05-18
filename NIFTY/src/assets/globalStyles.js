import {
  successColor,
  whiteColor,
  grayColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";
import { red, blue, green, deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';


const globalStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  delete:  {
    color: red[900],
    height: 5,
    width: 5,
  },
  page: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  paper: {
    marginTop: theme.spacing(8),
    display:'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  message14: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightBold,
    // color: yellow[900]
  },
  message12: {
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightBold,
    // color: yellow[900]
  },
  message10: {
    fontSize: theme.typography.pxToRem(10),
    fontWeight: theme.typography.fontWeightBold,
    // color: yellow[900]
  },
  button: {
    margin: theme.spacing(0, 1, 0),
  },
  error:  {
    fontSize: '12px',
    color: red[700],
    alignItems: 'center',
    marginTop: '0px',
    fontWeight: theme.typography.fontWeightBold,
  },
  nonerror:  {
    fontSize: '12px',
    color: blue[700],
    alignItems: 'center',
    marginTop: '0px',
    fontWeight: theme.typography.fontWeightBold,
  },
  th: { 
    backgroundColor: '#EEEEEE', 
    color: deepOrange[700], 
    border: "1px solid black",
    fontWeight: theme.typography.fontWeightBold,
    align: "center",
    padding: "1px 10px",
  },
  td : {
    // border: 5,
    border: "1px solid black",
    align: "center",
    padding: "1px 10px",
  },
  upArrowCardCategory: {
    width: "16px",
    height: "16px"
  },
  stats: {
    color: grayColor[0],
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: "22px",
    "& svg": {
      top: "4px",
      width: "10px",
      height: "10px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      top: "4px",
      fontSize: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    }
  },
  cardCategory: {
    color: grayColor[0],
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0"
  },
  cardCategoryWhite: {
    color: "rgba(" + hexToRgb(whiteColor) + ",.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitle: {
    color: grayColor[2],
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  cardTitleWhite: {
    color: whiteColor,
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  modalContainer: {
    content: "",
    opacity: 0.8,
    // background: rgb(26, 31, 41) url("your picture") no-repeat fixed top;
    // background-blend-mode: luminosity;
    /* also change the blend mode to what suits you, from darken, to other 
    many options as you deem fit*/
    // background-size: cover;
    // top: 0;
    // left: 0;
    // right: 0;
    // bottom: 0;
    // position: absolute;
    // z-index: -1;
    // height: 500px;
  },
  modalTitle: {
    color: blue[700],
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
  },
  modalMessage: {
    //color: blue[700],
    fontSize: theme.typography.pxToRem(14),
    //fontWeight: theme.typography.fontWeightBold,
  },
  modalbutton: {
    margin: theme.spacing(2, 2, 2),
  },
  modalWidth: {
    width: theme.spacing(40),
  },
  jumpButton: {
    // margin: theme.spacing(0, 1, 0),
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    backgroundColor: '#FFFFFF',
    color: '#1A237E',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: '16px',
    width: theme.spacing(20),
  },
  jumpButtonFull: {
    // margin: theme.spacing(0, 1, 0),
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    backgroundColor: '#FFFFFF',
    color: '#1A237E',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: '16px',
    width: theme.spacing(40),
  },
  noSpace: {
    // margin: theme.spacing(0, 1, 0),
    marginTop: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginBottom: theme.spacing(0),
    marginLeft: theme.spacing(0),
  },

}));

export default globalStyles;
