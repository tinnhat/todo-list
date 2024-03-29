import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Button, Card, Checkbox, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
const label = { inputProps: { 'aria-label': 'Checkbox demo' } }

type Props = {
  data: Todo[],
  setData: React.Dispatch<React.SetStateAction<Todo[]>>,
  setItemEdit: React.Dispatch<React.SetStateAction<Todo | null>>
}

const styledTextLong = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}
export default function ListTodo({ data, setData, setItemEdit }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [status, setStatus] = useState<boolean | null>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const dataFilter = useMemo(() => {
    if (status === null) return data
    return data.filter((item: Todo) => {
      if (item.status === status) return item
    })
  }, [data, status])

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleFilter = (status: boolean) => {
    setStatus(status)
    setAnchorEl(null)
  }

  const handleFilterAll = () => {
    setAnchorEl(null)
    setStatus(null)
  }

  const handleDelete = (id: string) => {
    setData(prev => prev.filter((item: Todo) => item.id !== id))
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
        mt: '20px',
        mb: '20px',
      }}
    >
      <Box>
        <Button
          id='basic-button'
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          Filter
        </Button>
        <Menu
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem
            onClick={handleFilterAll}
            sx={{
              color: status === null ? 'green' : 'black',
            }}
          >
            All
          </MenuItem>
          <MenuItem
            onClick={() => handleFilter(false)}
            sx={{
              color: status === false ? 'green' : 'black',
            }}
          >
            Pending
          </MenuItem>
          <MenuItem
            onClick={() => handleFilter(true)}
            sx={{
              color: status === true ? 'green' : 'black',
            }}
          >
            Complete
          </MenuItem>
        </Menu>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '300px',
          overflow: 'auto',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        {dataFilter.map((item: Todo,index: number) => (
          <Box
            sx={{
              display: 'flex',
              gap: '10px',
              paddingBottom: index === dataFilter.length - 1 ? '0' : '5px', 
              borderBottom: index === dataFilter.length - 1 ? 'none' : '1px solid black',
              mt: '10px',
            }}
            key={item.id}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Checkbox
                sx={{
                  '&.Mui-checked': {
                    color: 'green',
                  },
                }}
                {...label}
                checked={item.status}
              />
            </Box>
            <Box>
              <Tooltip title={item.title}>
                <Typography sx={styledTextLong} variant='h6'>
                  {item.title}
                </Typography>
              </Tooltip>

              <Tooltip title={item.description}>
                <Typography sx={styledTextLong}>{item.description}</Typography>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', ml: 'auto' }}>
              <EditIcon
                sx={{
                  fontSize: '34px',
                  cursor: 'pointer',
                  padding: '8px',
                  background: '#feca57',
                  color: 'white',
                  borderRadius: '50%',
                }}
                onClick={() => setItemEdit(item)}
              />
              <DeleteIcon
                sx={{
                  fontSize: '34px',
                  cursor: 'pointer',
                  padding: '8px',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                }}
                onClick={() => handleDelete(item.id)}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  )
}
