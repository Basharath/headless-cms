// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import { useContext, useEffect } from 'react';
// import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Typography from '@mui/material/Typography';
import Layout from '../components/Layout';
import { getUserData, setToken } from '../src/httpRequests';

export default function Dashboard({ user }) {
  return (
    <Layout title='HeadlessCMS - Dashboard' user={user}>
      <Typography>This where all posts can be seen </Typography>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req } = ctx;
  const { token } = req.cookies;
  setToken(token);

  try {
    const result = await getUserData();
    const user = result.data;

    if (!user) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
