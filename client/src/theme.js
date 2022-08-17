import { createTheme } from '@mui/material/styles';
import { grey, blueGrey, red } from '@mui/material/colors';

export const appTheme = createTheme({
    palette: {
        primary: {
            main: blueGrey[800],
            dull: blueGrey[300]
        },
        neutral: {
            main: '#64748B',
            contrastText: '#fff',
            light: '#f0f0f0'
        },
        font: {
            main: blueGrey[800],
            dull: blueGrey[300],
            light: 'white',
            highlight: blueGrey[100],
            danger: red[500]
        },
        bg: {
            main: grey[200],
            dull: grey[50],
            secondary: grey[50], //'white'
            light: 'white'
        }
    },
});