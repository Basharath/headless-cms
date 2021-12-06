/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-no-comment-textnodes */
import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  SyntheticEvent,
} from 'react';
import dayjs from 'dayjs';
import { Editor } from '@tinymce/tinymce-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
// import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { GetServerSideProps } from 'next';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import {
  getPost,
  getUserData,
  getCategories,
  getTags,
  updatePost,
} from '../src/httpRequests';

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

export default function post({ data, user }) {
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

    const postData = { ...form, updatedAt: new Date().toISOString() };
    try {
      const res = await updatePost(data.id, postData);
      const result = res.data;

      if (result) {
        toast.success('Post successfully saved');
        setForm(postData);
      }
      return null;
    } catch (err) {
      return toast.error(err?.response?.data || err?.message);
    }
    // console.log('form', form);
  };

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.currentTarget.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_PRESET);

      const res = await fetch(process.env.NEXT_PUBLIC_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      return result;
    } catch (err) {
      return toast.error(err.message);
    }
  };

  const uploadThumbnail = async (e: ChangeEvent<HTMLInputElement>) => {
    const result = await uploadImage(e);
    setForm((prev) => ({ ...prev, thumbnail: result.secure_url }));
  };

  const uploadOtherImages = async (e: ChangeEvent<HTMLInputElement>) => {
    const result = await uploadImage(e);
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, result.secure_url],
    }));
  };

  const destroyImage = async (image: string) => {
    const thumbnail = image.split('/').slice(-2).join('/').split('.')[0];

    try {
      const res = await fetch('/api/destroy', {
        method: 'POST',
        body: JSON.stringify({ public_id: thumbnail }),
      });

      const result = await res.json();
      return result;
    } catch (err) {
      return toast.error(err.message);
    }
  };

  const handleThumbnailImage = async () => {
    if (form.thumbnail) {
      const res = await destroyImage(form.thumbnail);
      if (res.result === 'ok')
        setForm((prev) => ({ ...prev, thumbnail: undefined }));
    }
  };

  const handleOtherImages = async (idx) => {
    if (idx > -1) {
      const res = await destroyImage(form.images[idx]);
      if (res.result === 'ok') {
        const images = form.images.filter((i, id) => id !== idx);
        setForm((prev) => ({ ...prev, images }));
      }
    }
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
    <Layout title={data.title || 'New Post'} user={user}>
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
            // onSubmit={handleSubmit}
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
          </Box>
          <Box
            sx={{
              width: '30%',
              display: 'block',
            }}
          >
            <Button
              sx={{ m: 1, width: 300 }}
              onClick={handleSubmit}
              variant='contained'
            >
              Save post
            </Button>
            <Typography sx={{ m: 1, width: 300, color: '000000DE' }}>
              Last updated at:{' '}
              {dayjs(form.updatedAt).format('MMM DD, YYYY HH:mm')}
            </Typography>
            <FormControl sx={{ m: 1, width: 300 }} size='small'>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                onChange={handleChange}
                input={<OutlinedInput label='Status' />}
                name='status'
                MenuProps={MenuProps}
              >
                {['Published', 'Draft'].map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 300 }} size='small'>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                onChange={handleChange}
                input={<OutlinedInput label='Type' />}
                name='type'
                MenuProps={MenuProps}
              >
                {['Post', 'Page'].map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 300 }} size='small'>
              <InputLabel>Tags</InputLabel>
              <Select
                value={form.tags}
                onChange={handleChange}
                input={<OutlinedInput label='Tags' />}
                name='tags'
                multiple
                MenuProps={MenuProps}
              >
                {tagArray.map((tag) => (
                  <MenuItem key={tag.name} value={tag._id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 300 }} size='small'>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.categories}
                onChange={handleChange}
                input={<OutlinedInput label='Category' />}
                name='categories'
                multiple
                MenuProps={MenuProps}
              >
                {catArray.map((cat) => (
                  <MenuItem key={cat.name} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={DateAdapter} size='small'>
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
                  onChange={uploadThumbnail}
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
                  p: '0 2px',
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
                  sx={{ p: '5px' }}
                  onClick={() => copyText(form.thumbnail)}
                >
                  <ContentCopyIcon />
                </IconButton>
                <IconButton sx={{ p: '5px' }} onClick={handleThumbnailImage}>
                  <HighlightOffIcon />
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
                  onChange={uploadOtherImages}
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
              form.images.map((img, idx) => (
                <Box
                  sx={{
                    p: '0 4px',
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
                  <IconButton sx={{ p: '5px' }} onClick={() => copyText(img)}>
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton
                    sx={{ p: '5px' }}
                    onClick={() => handleOtherImages(idx)}
                  >
                    <HighlightOffIcon />
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
