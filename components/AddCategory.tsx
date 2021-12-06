import { useState, useEffect, ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import Modal from '@mui/material/Modal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import StarIcon from '@mui/icons-material/Star';
import ListItemText from '@mui/material/ListItemText';
import {
  addCategory,
  // deleteCategory,
  getCategories,
  updateCategory,
} from '../src/httpRequests';

const style = {
  position: 'absolute' as 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const AddTags = ({ status = false, onStatus: setModalStatus }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState({ name: '', _id: '' });
  const [categories, setCategories] = useState([{ name: '', _id: '' }]);
  const [isAdding, setIsAdding] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getCategories();
      if (res.data) setCategories(res.data);
    })();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    setText(input);
  };

  const handleAdd = async () => {
    if (!text) return;
    try {
      if (!isAdding) {
        const res = await updateCategory(category._id, { name: text });
        if (res.data) {
          const result = categories.map((t) =>
            t._id !== res.data._id ? t : { ...t, name: res.data.name }
          );
          setCategories(result);
          setText('');
          setIsAdding(true);
        }
      } else {
        const res = await addCategory({ name: text });
        if (res.data) {
          setCategories((prev) => [...prev, res.data]);
          setText('');
        }
      }
    } catch (err) {
      toast.error(err?.response?.data || err.message);
    }
  };

  const handleEdit = (id) => {
    const selectedCategory = categories.filter((i) => i._id === id);
    if (selectedCategory.length > 0) {
      setCategory(selectedCategory[0]);
      setText(selectedCategory[0].name);
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setModalStatus(false);
    setText('');
    setIsAdding(true);
  };

  return (
    <Modal open={status} onClose={handleClose}>
      <Box sx={style}>
        <Typography sx={{ textAlign: 'center' }}>Tags</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <TextField
            label='Category'
            size='small'
            type='text'
            name='category'
            value={text}
            onChange={handleChange}
          />
          <Button sx={{ ml: 2 }} variant='contained' onClick={handleAdd}>
            {isAdding ? 'Add Tag' : 'Update tag'}
          </Button>
        </Box>
        <Box>
          <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          >
            {categories.map((c) => (
              <ListItem alignItems='flex-start' key={c._id}>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText
                  primary={c.name}
                  onClick={() => handleEdit(c._id)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTags;
