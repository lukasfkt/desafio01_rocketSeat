const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userFound = users.find((user) => user.username == username);

  if (!userFound){
      return response.status(400).json({error:"User not found"});
   }

   request.user = userFound;

   return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);
  return response.status(201).send();
});

app.get('/todos',checksExistsUserAccount, (request, response) => {
    const {user} = request;
    return response.json(user.todos).send();
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  const newToDo = {
    id: uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newToDo);
  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const {title, deadline} = request.body;
    const {id} = request.params;
    const {user} = request;
    const todoFound = user.todos.find((todo) => todo.id == id);
    if (!todoFound){
      return response.status(400).json({error:"Todo not found"});
    }
    todoFound.title = title;
    todoFound.deadline = new Date(deadline);
    return response.status(204).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todoFound = user.todos.find((todo) => todo.id == id);
  if (!todoFound){
    return response.status(400).json({error:"Todo not found"});
  }
  todoFound.done = true;
  return response.status(204).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  user.todos = user.todos.filter((todo) => todo.id != id);
  return response.status(204).send();
});

module.exports = app;