/* eslint-disable @typescript-eslint/ban-types */
import { Box, Container, Typography } from '@mui/material'
import React from 'react'
import InputTodo from '../inputTodo'
import ListTodo from '../listTodo'

const listTodoStorage = JSON.parse(localStorage.getItem('listTodo')!)

// eslint-disable-next-line no-empty-pattern
export default function Todos() {
  const [data, setData] = React.useState<Todo[]>(listTodoStorage || [])
  const [itemEdit,setItemEdit] = React.useState<Todo | null>(null)

  return (
    <Container
      maxWidth={false}
      sx={{ backgroundColor: '#54a0ff', width: '100%', height: '100vh' }}
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
        <Typography 
          sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#fff' }} 
          variant='h4'
        >
          To do list
        </Typography>
        <InputTodo itemEdit={itemEdit} setItemEdit={setItemEdit} setData={setData}  />
        <ListTodo data={data} setItemEdit={setItemEdit} setData={setData} />
      </Box>
    </Container>
  )
}
