const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  
  const user = users.find((customer) => customer.username === username)

  if(!user){
    return response.status(404).json({ error: 'User dont exist'})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userAlreadyExists = users.some((customer) => customer.username === username)

  if(userAlreadyExists){
    return response.status(400).json({ error: 'User already exists'})
  }

  const pos = users.push({
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  })

  return response.status(201).json(users[pos - 1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)


  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;


  const todo = user.todos.find(todo => todo.id === id)

  console.log(todo)

  if(todo != undefined){
    todo.title = title;
    todo.deadline = new Date(deadline);
    return response.status(200).json(todo)
  }

  return response.status(404).json({'error': 'Todo não existe'})
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  todo = user.todos.find(todo => todo.id === id)

  if(todo != undefined){
    todo.done = true;
    users.push(user);
    return response.status(201).json(todo)
  }

  return response.status(404).json({'error': 'Todo não existe'})
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos.find((todo) => {
    if(todo.id === id){
      user.todos.splice(todo, 1)
      return response.status(204).send();
    }
  })

  return response.status(404).json({ error : 'Usuário não existe' });
});

module.exports = app;