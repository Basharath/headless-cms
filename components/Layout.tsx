import Head from 'next/head';
import Box from '@mui/material/Box';

export default function Layout({ title, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Box>{children}</Box>
    </>
  );
}
