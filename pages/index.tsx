import { useState, ChangeEvent, SyntheticEvent } from 'react';
import Joi from 'joi-browser';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Layout from '../components/Layout';
import { signin, signup, getUserData, setToken } from '../src/httpRequests';

export default function Login() {
  const initialState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  const [form, setForm] = useState(initialState);
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState(initialState);
  const [httpError, setHttpError] = useState('');
  const router = useRouter();

  const formSchema = {
    name: Joi.string().min(4).label('Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(8).required().label('Password'),
    confirmPassword: Joi.any()
      .equal(Joi.ref('password'))
      .label('Confirm password')
      .options({ language: { any: { allowOnly: 'must match Password' } } }),
  };

  const validateProperty = ({ name, value }) => {
    if (name === 'confirmPassword') {
      return value !== form.password
        ? '"Confirm password" must match Password'
        : null;
    }

    const obj = { [name]: value };
    const schema = { [name]: formSchema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (httpError) setHttpError('');

    const errs = { ...errors };
    const errorMessage = validateProperty(input);
    if (errorMessage) errs[input.name] = errorMessage;
    else delete errs[input.name];

    setErrors(errs);
    setForm({ ...form, [input.name]: input.value });
  };

  const validateForm = (data) => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(data, formSchema, options);
    if (!error) return null;

    const errs = {};
    error.details.forEach((item) => {
      errs[item.path[0]] = item.message;
      return 0;
    });

    return errs;
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const { name, email, password } = form;
    const loginData = { email, password };
    const signupData = { name, email, password };

    const data = isLogin ? loginData : form;
    const errs = validateForm(data);
    // @ts-ignore
    setErrors({ ...(errs || {}) });
    if (errs) return;

    try {
      const res = isLogin ? await signin(loginData) : await signup(signupData);
      if (res.data) {
        router.push('/dashboard');
      }
    } catch (err) {
      const message = err?.response?.data || 'Something went wrong, try again';
      setHttpError(message);
    }
  };

  return (
    <Layout title='HeadlessCMS - Login'>
      <Box
        component='form'
        sx={{
          '& .MuiTextField-root': { my: 1, width: '100%' },
          '& .MuiButton-root': { my: 1 },
          width: '310px',
          mx: 'auto',
          mt: '100px',
        }}
        autoComplete='off'
        onSubmit={handleSubmit}
      >
        {!isLogin && (
          <div>
            <TextField
              label='Name'
              size='small'
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </div>
        )}
        <div>
          <TextField
            label='Email'
            size='small'
            type='email'
            name='email'
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
        </div>
        <div>
          <TextField
            label='Password'
            type='password'
            size='small'
            value={form.password}
            name='password'
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
        </div>
        {!isLogin && (
          <div>
            <TextField
              label='Confirm Password'
              type='password'
              size='small'
              value={form.confirmPassword}
              name='confirmPassword'
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
          </div>
        )}
        <Typography textAlign='center' color='red'>
          {httpError && httpError}
        </Typography>
        <Button type='submit' variant='contained' color='primary' fullWidth>
          {isLogin ? 'Login' : 'Signup'}
        </Button>
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          onClick={() => {
            setIsLogin((prev) => !prev);
            setErrors(initialState);
          }}
        >
          {isLogin ? 'Signup' : 'Login'}
        </Button>
      </Box>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req } = ctx;
  const { token } = req.cookies;
  setToken(token);

  try {
    const res = await getUserData();
    const user = res.data;

    if (user) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Not logged in');
  }
  return { props: {} };
};
