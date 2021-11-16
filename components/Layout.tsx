// import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { signout } from '../src/httpRequests';

export default function Layout(props) {
  const { children, title, user } = props;
  const router = useRouter();

  const handleSignout = async () => {
    await signout();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <AppBar position='static'>
        <Container>
          <Toolbar disableGutters>
            <Typography
              variant='h6'
              component='div'
              sx={{ flexGrow: 1, pl: 0 }}
            >
              <Link href='/'>Headless CMS</Link>
            </Typography>
            <div>
              {user && (
                <>
                  <Button
                    size='large'
                    color='inherit'
                    endIcon={<AccountCircle />}
                  >
                    {user?.name}
                  </Button>
                  <IconButton color='inherit' onClick={handleSignout}>
                    <LogoutRoundedIcon />
                  </IconButton>
                </>
              )}
            </div>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth='lg'>
        <Box sx={{}}>{children}</Box>
      </Container>
    </>
  );
}
