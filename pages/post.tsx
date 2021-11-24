import { useState, useRef, ChangeEvent, SyntheticEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { getPost } from '../src/httpRequests';

export default function post({ data }) {
  const initialState = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    author: data.author,
    tags: data.tags,
    categories: data.categories,
    thumbnail: data.thumbnail,
    images: data.images,
    updatedAt: data.updatedAt,
    status: data.status,
    type: data.type,
  };

  const errorState = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    tags: '',
    categories: '',
    thumbnail: '',
    images: '',
    updatedAt: '',
    status: '',
    type: '',
  };

  const editorRef = useRef(null);

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState(errorState);
  const [httpError, setHttpError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (httpError) setHttpError('');

    const errs = { ...errors };
    // const errorMessage = validateProperty(input);
    // if (errorMessage) errs[input.name] = errorMessage;
    // else delete errs[input.name];

    setErrors(errs);
    setForm({ ...form, [input.name]: input.value });
  };
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    console.log('form', form);
  };

  return (
    <Layout title={data.title}>
      <div style={{ width: '100%' }}>
        <Typography variant='h5' textAlign='center' py={2}>
          Post details
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <Box
            component='form'
            sx={{
              '& .MuiTextField-root': { my: 1, width: '100%' },
              '& .MuiButton-root': { my: 1 },
              width: '65%',
              mr: '25px',
              mx: 'auto',
              // mt: '100px',
            }}
            autoComplete='off'
            onSubmit={handleSubmit}
          >
            <div>
              <TextField
                label='Title'
                size='small'
                type='text'
                name='title'
                value={form.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </div>
            <div>
              <TextField
                label='Slug'
                size='small'
                type='text'
                name='slug'
                value={form.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug}
              />
            </div>
            <div>
              <TextField
                label='Excerpt'
                size='small'
                type='text'
                name='excerpt'
                value={form.excerpt}
                onChange={handleChange}
                error={!!errors.excerpt}
                helperText={errors.excerpt}
              />
            </div>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_EDITOR_KEY}
              id='editor'
              // eslint-disable-next-line no-return-assign
              onInit={(_evt, editor) => (editorRef.current = editor)}
              value={form.content}
              onEditorChange={(text) =>
                setForm((prev) => ({ ...prev, content: text }))
              }
              init={{
                height: 500,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen codesample',
                  'insertdatetime media table paste code help wordcount',
                ],
                toolbar:
                  'undo redo | formatselect | codesample | code | fontsizeselect | ' +
                  'bold italic backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist | ' +
                  'removeformat | help | link | image',

                content_style:
                  'body { font-family: Roboto,Helvetica,Arial,sans-serif; font-size:17px }',
              }}
            />
            <div>
              <TextField
                label='Title'
                size='small'
                type='text'
                name='title'
                value={form.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </div>
            <Button type='submit' variant='contained'>
              Show form
            </Button>
          </Box>
          <Box sx={{ width: '30%', bgcolor: 'red', display: 'block' }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste, velit
            quibusdam et quo inventore reprehenderit, ratione accusantium odio
            neque ipsum eum eligendi possimus excepturi ducimus sapiente eveniet
            placeat temporibus at!
          </Box>
        </Box>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id }: { id?: string } = query;

  if (!id) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  const postRes = await getPost(id);
  const postData = postRes.data;

  return {
    props: {
      data: postData,
    },
  };
};
