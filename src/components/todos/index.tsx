/* eslint-disable @typescript-eslint/ban-types */
import { Box, Container, Typography } from '@mui/material'
import React from 'react'
import InputTodo from '../inputTodo'
import ListTodo from '../listTodo'

type Props = {
}

const dataFake: Todo[] = [
  {
    id: 'id1',
    title: 'Todo 1',
    description: 'Todo 1 description',
    status: false,
  },
  {
    id: 'id2',
    title: 'Todo 2',
    description: 'Todo 2 description',
    status: true,
  },
  {
    id: 'id3',
    title: 'Todo 3',
    description: 'Todo 3 description',
    status: false,
  },
  {
    id: 'id4',
    title: 'Todo 4',
    description: 'Todo 4 description',
    status: true,
  },
  {
    id: 'id5',
    title: 'Todo 5',
    description: 'Todo 5 description',
    status: false,
  },
]

// eslint-disable-next-line no-empty-pattern
export default function Todos({}: Props) {
  const [data, setData] = React.useState<Todo[]>(dataFake)
  const [itemEdit,setItemEdit] = React.useState<Todo | null>(null)
  return (
    <Container
      maxWidth={false}
      sx={{
        backgroundColor: '#54a0ff',
        width: '100%',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Typography sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#fff' }} variant='h4'>
          To do list
        </Typography>
        <InputTodo itemEdit={itemEdit} setData={setData}  />
        <ListTodo data={data} setItemEdit={setItemEdit} setData={setData} />
      </Box>
    </Container>
  )
}
