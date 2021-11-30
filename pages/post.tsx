/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-no-comment-textnodes */
import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  SyntheticEvent,
} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
// import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/material/styles';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { getPost, getCategories, getTags } from '../src/httpRequests';

const ITEM_HEIGHT = 30;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Input = styled('input')({
  display: 'none',
});

export default function post({ data }) {
  const initialState = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    author: data.author,
    tags: data.tags,
    categories: data.categories[0],
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
  const [tagArray, setTagArray] = useState([]);
  const [catArray, setCatArray] = useState([]);

  useEffect(() => {
    (async () => {
      const tagRes = await getTags();
      const tagResult = tagRes.data;
      const catRes = await getCategories();
      const catResult = catRes.data;
      setTagArray(tagResult);
      setCatArray(catResult);
    })();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
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

  const copyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.style.cssText = 'position: absolute; left: -100%;';

    try {
      document.body.appendChild(textArea);
      textArea.value = text;
      textArea.select();
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <Layout title={data.title || 'New Post'}>
      <div style={{ width: '100%' }}>
        <Typography variant='h5' textAlign='center' py={2}>
          Post details
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            component='form'
            sx={{
              '& .MuiTextField-root': { my: 1, width: '100%' },
              '& .MuiButton-root': { my: 1 },
              width: '65%',
              mr: '25px',
              mx: 'auto',
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

            <Button type='submit' variant='contained'>
              Show form
            </Button>
          </Box>
          <Box
            sx={{
              width: '30%',
              display: 'block',
            }}
          >
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                onChange={handleChange}
                input={<OutlinedInput label='Status' />}
                name='status'
                MenuProps={MenuProps}
                sx={{ py: 2, maxHeight: 40 }}
              >
                {['Published', 'Draft'].map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                onChange={handleChange}
                input={<OutlinedInput label='Type' />}
                name='type'
                MenuProps={MenuProps}
                sx={{ py: 2, maxHeight: 40 }}
              >
                {['Post', 'Page'].map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel>Tags</InputLabel>
              <Select
                value={form.tags}
                onChange={handleChange}
                input={<OutlinedInput label='Tags' />}
                name='tags'
                multiple
                MenuProps={MenuProps}
                sx={{ py: 2, maxHeight: 40 }}
              >
                {tagArray.map((tag) => (
                  <MenuItem key={tag.name} value={tag._id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.categories}
                onChange={handleChange}
                input={<OutlinedInput label='Category' />}
                name='categories'
                MenuProps={MenuProps}
                sx={{ py: 2, maxHeight: 40 }}
              >
                {catArray.map((cat) => (
                  <MenuItem key={cat.name} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={DateAdapter}>
              <DateTimePicker
                label='Update date'
                value={form.updatedAt}
                onChange={(newValue) =>
                  setForm((prev) => ({ ...prev, updatedAt: newValue }))
                }
                renderInput={(params) => (
                  <TextField {...params} sx={{ m: 1, width: 300 }} />
                )}
              />
            </LocalizationProvider>

            <Box
              sx={{ m: 1, width: 300, display: 'flex', alignItems: 'center' }}
            >
              <Typography>Thumbnail image</Typography>
              <label htmlFor='thumbnail-image'>
                <Input
                  accept='image/*'
                  id='thumbnail-image'
                  type='file'
                  onChange={(e) => console.log('e', e.target.files)}
                />
                <IconButton
                  color='primary'
                  aria-label='upload picture'
                  component='span'
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            {form.thumbnail && (
              <Box
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #c4c4c4',
                  borderRadius: '5px',
                  m: 1,
                  width: 300,
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder={form.thumbnail}
                  value={form.thumbnail}
                />
                <IconButton
                  sx={{ p: '10px' }}
                  onClick={() => copyText(form.thumbnail)}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            )}

            <Box
              sx={{ m: 1, width: 300, display: 'flex', alignItems: 'center' }}
            >
              <Typography>Other images</Typography>
              <label htmlFor='other-images'>
                <Input
                  accept='image/*'
                  id='other-images'
                  type='file'
                  onChange={(e) => console.log('e', e.target.files)}
                />
                <IconButton
                  color='primary'
                  aria-label='upload picture'
                  component='span'
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>

            {form.images.length > 0 &&
              form.images.map((img) => (
                <Box
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #c4c4c4',
                    borderRadius: '5px',
                    m: 1,
                    width: 300,
                  }}
                  key={img}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={img}
                    value={img}
                  />
                  <IconButton sx={{ p: '10px' }} onClick={() => copyText(img)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              ))}
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
