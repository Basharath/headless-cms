import Head from 'next/head';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function Layout({ title, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Box
        sx={{
          bgcolor: 'primary.main',
          textAlign: 'center',
          p: '10px',
          fontSize: '20px',
          color: '#fafafa',
        }}
      >
        <Link href='/'>Headless CMS</Link>
      </Box>
      <Container maxWidth='lg'>
        <Box sx={{ height: '100vh' }}>{children}</Box>
      </Container>
    </>
  );
}
