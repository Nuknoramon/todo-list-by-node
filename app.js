const express = require("express");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");
const createError = require("./utils/createError");

const { readTodos, writeTodos } = require("./services/todoService");

const app = express();

app.use(express.json());

// Get All Todos: GET / todos
app.get("/todos", async (req, res, next) => {
  try {
    const todos = await readTodos();
    res.json({ todos });
  } catch (err) {
    next(err);
  }
});

// Get Todo By id: GET /todos/:id
// PARAM: id
app.get("/todos/:id", async (req, res, next) => {
  try {
    const params = req.params;
    const todos = await readTodos();
    const todo = todos.find((el) => el.id === params.id);
    res.json({ todo: todo ?? null });
  } catch (err) {
    next(err);
  }
});

// Create Todo: POST /todos
// BODY: title(required), completed(default:false), dueDate()
app.post("/todos", async (req, res, next) => {
  try {
    const { title, completed = false, dueDate = null } = req.body;
    if (typeof title !== "string") {
      // return res.status(400).json({ messaage: "title must be a string" });
      createError("title must be a string", 400);
    }
    if (validator.isEmpty(title)) {
      // return res.status(400).json({ message: "title is required" });
      createError("title is required", 400);
    }
    if (typeof completed !== "boolean") {
      // return res.status(400).json({ message: "completed must be a boolean" });
      createError("completed must be a boolean", 400);
    }
    if (dueDate !== null && !validator.isDate(dueDate + "")) {
      // return res.status(400).json({ message: "dueDate must be a date string" });
      createError("dueDate must be a date string", 400);
    }

    const todos = await readTodos();
    const todo = {
      id: uuidv4(),
      title,
      completed,
      dueDate: dueDate === null ? dueDate : new Date(dueDate),
    };

    todos.push(todo);
    await writeTodos(todos);

    res.json({ todo });
  } catch (err) {
    next(err);
  }
});

// Update Todo: PUT /todos/:id
// BODY: title(required), conpleted(default:false), dueDate
app.put("/todos/:id", async (req, res, next) => {
  try {
    const params = req.params;
    const { title, completed = false, dueDate = null } = req.body;
    if (typeof title !== "string") {
      // return res.status(400).json({ messaage: "title must be a string" });
      createError("title must be a string", 400);
    }
    if (validator.isEmpty(title)) {
      createError("title is required", 400);
    }
    if (typeof completed !== "boolean") {
      createError("completed must be a boolean", 400);
    }
    if (dueDate !== null && !validator.isDate(dueDate + "")) {
      createError("dueDate must be a date string", 400);
    }
    const todos = await readTodos();
    const idx = todos.findIndex((el) => el.id === params.id);
    if (idx === -1) {
      createError("todo is not found", 400);
    }
    todos[idx] = {
      id: params.id,
      title,
      completed,
      dueDate: dueDate === null ? dueDate : new Date(dueDate),
    };

    await writeTodos(todos);
    res.json({ todo: todos[idx] });
  } catch (err) {
    next(err);
  }
});

// Delete Todo: DELETE
app.delete("/todos/:id", async (req, res, next) => {
  try {
    const params = req.params;
    const todos = await readTodos();
    const idx = todos.findIndex((el) => el.id === params.id);
    if (idx === -1) {
      createError("todo is not found", 400);
    }
    todos.splice(idx, 1);
    await writeTodos(todos);
    res.status(204).json();
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: err.message });
});

app.listen(8002, () => console.log("server running on port 8002"));
