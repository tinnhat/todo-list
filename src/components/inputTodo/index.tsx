import { Box, Button, Card, Checkbox, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
const label = { inputProps: { 'aria-label': 'Checkbox status' } }

type Props = {
  itemEdit: Todo | null
  setData: React.Dispatch<React.SetStateAction<Todo[]>>
}

export default function InputTodo({ itemEdit, setData }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(false)
  const [error, setError] = useState({
    title: false,
    description: false,
  })

  useEffect(() => {
    if (itemEdit) {
      setTitle(itemEdit.title)
      setDescription(itemEdit.description)
      setStatus(itemEdit.status)
    }
  }, [itemEdit])

  const handleSubmit = () => {
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
      return
    }
    console.log(title, description)
  }
  return (
    <Card
      sx={{
        width: {
          xs: '90%',
          sm: '70%',
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
              <Button fullWidth variant='contained'>
                Save
              </Button>
              <Button fullWidth variant='contained'>
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
