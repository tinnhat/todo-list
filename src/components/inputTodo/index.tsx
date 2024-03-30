import { Box, Button, Card, Checkbox, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { isAllSpace } from '../../utils/common'
const label = { inputProps: { 'aria-label': 'Checkbox status' } }

type Props = {
  itemEdit: Todo | null
  setData: React.Dispatch<React.SetStateAction<Todo[]>>
  setItemEdit: React.Dispatch<React.SetStateAction<Todo | null>>
}

export default function InputTodo({ itemEdit, setItemEdit, setData }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(false)
  const [error, setError] = useState({
    title: false,
    description: false,
  })
  console.log('rebder input todo');


  useEffect(() => {
    if (itemEdit) {
      //reset error
      setError({ title: false, description: false })
      setTitle(itemEdit.title)
      setDescription(itemEdit.description)
      setStatus(itemEdit.status)
    }
  }, [itemEdit])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setError({ title: false, description: false })
    setStatus(false)
    setItemEdit(null)
  }

  const validateForm = () => {
    const error = {
      title: false,
      description: false,
    }
    if (!title) {
      error.title = true
    }
    if (!description) {
      error.description = true
    }

    if (Object.values(error).includes(true)) {
      setError(error)
      return false
    }

    if (isAllSpace(title) || isAllSpace(description)) {
      toast.error('Please enter valid value', {
        toastId: 'error-validate',
      })
      setError({ title: isAllSpace(title), description: isAllSpace(description) })
      return false
    }
    return true
  }

  const handleSubmit = () => {
    const checkForm = validateForm()
    if (!checkForm) return
    const newTodo: Todo = {
      id: new Date().toISOString().toString(),
      title: title.trim(),
      description: description.trim(),
      status: false,
    }
    setData(data => {
      localStorage.setItem('listTodo', JSON.stringify([...data, newTodo]))
      return [...data, newTodo]
    })
    resetForm()
    toast.success('Add todo successfully', {
      toastId: 'todo-added',
    })
  }

  const handleUpdateTodo = (itemEdit: Todo) => {
    const checkForm = validateForm()
    if (!checkForm) return
    setData(prev => {
      const newData = prev.map(item =>
        item.id === itemEdit.id
          ? { ...item, title: title.trim(), description: description.trim(), status }
          : item
      )
      localStorage.setItem('listTodo', JSON.stringify(newData))
      return newData
    })
    resetForm()
    toast.success('Update todo successfully', {
      toastId: 'todo-updated',
    })
  }

  const handleCancel = () => {
    resetForm()
  }
  return (
    <Card
      sx={{
        width: {
          xs: '90%',
          sm: '80%',
          md: '60%',
          lg: '50%',
          xl: '40%',
        },
        padding: '20px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {itemEdit ? (
          <>
            <Box
              sx={{
                display: 'flex',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Checkbox
                  sx={{
                    '&.Mui-checked': {
                      color: 'green',
                    },
                  }}
                  {...label}
                  checked={status}
                  onChange={() => setStatus(!status)}
                />
              </Box>
              <TextField
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
                id='outlined-basic'
                label='Title'
                variant='outlined'
                error={error.title ? true : false}
                helperText={error.title ? 'Title is required' : ''}
              />
            </Box>
            <TextField
              value={description}
              onChange={e => setDescription(e.target.value)}
              id='outlined-multiline-static'
              label='Description'
              multiline
              rows={2}
              error={error.description ? true : false}
              helperText={error.description ? 'Description is required' : ''}
            />
            <Box
              sx={{
                display: 'flex',
                gap: '10px',
              }}
            >
              <Button fullWidth variant='contained' onClick={() => handleUpdateTodo(itemEdit)}>
                Save
              </Button>
              <Button fullWidth variant='contained' onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Box>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              value={title}
              onChange={e => setTitle(e.target.value)}
              id='outlined-basic'
              label='Title'
              variant='outlined'
              error={error.title ? true : false}
              helperText={error.title ? 'Title is required' : ''}
            />
            <TextField
              fullWidth
              value={description}
              onChange={e => setDescription(e.target.value)}
              id='outlined-multiline-static'
              label='Description'
              multiline
              rows={2}
              error={error.description ? true : false}
              helperText={error.description ? 'Description is required' : ''}
            />
            <Button variant='contained' onClick={handleSubmit}>
              Submit
            </Button>
          </>
        )}
      </Box>
    </Card>
  )
}
