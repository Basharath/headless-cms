import { createTheme } from '@mui/material/styles';
import { red, blue } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
      light: blue[300],
      dark: blue[600],
    },
    secondary: {
      main: '#d81b60',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
