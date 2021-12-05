import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import Modal from '@mui/material/Modal';
import Layout from '../components/Layout';
import {
  addPost,
  getPosts,
  getUserData,
  deletePost,
  setToken,
} from '../src/httpRequests';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const StyledDataGrid = styled(DataGrid)`
  &.MuiDataGrid-root .MuiDataGrid-columnHeader:focus,
  &.MuiDataGrid-root .MuiDataGrid-cell:focus {
    outline: none;
  }
`;

export default function Dashboard({ posts, user }) {
  const router = useRouter();
  const [selection, setSelection] = useState([]);
  const [currentPosts, setCurrentPosts] = useState(posts);
  const [open, setOpen] = useState(false);

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

  const handleAddPost = async () => {
    const samplePostData = {
      title: 'Sample title',
      slug: `sample-title-${Math.floor(Math.random() * 1000)}`,
      excerpt: 'Sample excerpt',
      content: 'Write your content here',
      author: user.id,
      tags: [],
      categories: [],
      thumbnail: undefined,
      images: [],
      status: 'Draft',
      type: 'Post',
    };

    try {
      const res = await addPost(samplePostData);
      const post = res.data;
      if (post?.id) {
        setCurrentPosts((prev) => [post, ...prev]);
        router.push(`/post?id=${post.id}`);
        return null;
      }
      return toast.error('Could not add new post, try again');
    } catch (err) {
      return toast.error(err?.response?.data || err?.message);
    }
  };

  const handleDeletePost = async () => {
    setOpen(false);
    if (selection.length > 1)
      return toast.info('You can only delete one post at a time');
    if (selection.length < 1) return null;

    const id = selection[0];

    try {
      const res = await deletePost(id);
      const post = res.data;
      if (post && post.id) {
        toast.info('Post successfully deleted');
        setCurrentPosts((prev) => prev.filter((p) => p.id !== id));
      }
      return null;
    } catch (err) {
      return toast.error(err?.response?.data || err?.message);
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <Layout title='HeadlessCMS - Dashboard' user={user}>
      <div style={{ height: 400, width: '100%' }}>
        <Typography variant='h5' textAlign='center' py={2}>
          POSTS
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button
            onClick={() => setOpen(true)}
            color='error'
            sx={{ mr: '20px' }}
            variant='contained'
          >
            Delete Post
          </Button>
          <Button onClick={handleAddPost} variant='contained'>
            Add post
          </Button>
        </Box>

        <StyledDataGrid
          rows={currentPosts}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          onSelectionModelChange={(ids) => setSelection(ids)}
          onRowClick={(params: GridRowParams) =>
            router.push(`/post?id=${params.id}`)
          }
          disableSelectionOnClick
        />
      </div>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography sx={{ textAlign: 'center' }}>
            Are you sure you want to delete the post?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
            <Button variant='contained' color='success' onClick={handleClose}>
              No
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleDeletePost}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>
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
  } catch (err) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    const postRes = await getPosts();
    let posts = postRes.data;
    posts = posts.map((i) => ({
      ...i,
      updatedAt: dayjs(i.updatedAt).format('MMM D, YYYY'),
      category: i.categories.length > 0 ? i.categories[0].name : '',
    }));

    return {
      props: {
        posts,
      },
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Could not fetch posts', err?.response?.data || err?.message);
    return null;
  }
};
