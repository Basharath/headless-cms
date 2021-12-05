import * as React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ToastContainer } from 'react-toastify';
import theme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';
import { getUserData } from '../src/httpRequests';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  // eslint-disable-next-line react/require-default-props
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await getUserData();
        setUser(res.data);
      } catch (err) {
        // toast.error(err?.response?.data || err?.message);
      }
    })();
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>My page</title>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <ToastContainer
          position='top-left'
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <CssBaseline />
        <Component {...pageProps} user={user} />
      </ThemeProvider>
    </CacheProvider>
  );
}
