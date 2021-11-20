// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import dayjs from 'dayjs';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import Layout from '../components/Layout';
import { getPosts, getUserData, setToken } from '../src/httpRequests';

export default function Dashboard({ posts }) {
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Type', width: 350 },
    { field: 'type', headerName: 'Type', width: 150 },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 150,
    },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
  ];

  return (
    <Layout title='HeadlessCMS - Dashboard'>
      <div style={{ height: 400, width: '100%' }}>
        <Typography variant='h5' textAlign='center' py={2}>
          POSTS
        </Typography>
        <DataGrid
          rows={posts}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          onRowClick={(params: GridRowParams) =>
            router.push(`/post?id=${params.id}`)
          }
          disableSelectionOnClick
        />
      </div>
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

    const postRes = await getPosts();
    let posts = postRes.data;
    posts = posts.map((i) => ({
      ...i,
      updatedAt: dayjs(i.updatedAt).format('MMM D, YYYY'),
      category: i.categories[0].name,
    }));

    return {
      props: {
        posts,
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
