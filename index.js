const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const cors = require("cors");
const Joi = require("joi");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

let persons = [
  {
    id: "1",
    name: "Sam",
    age: "26",
    hobbies: [],
  },
]; //This is your in memory database

app.set("db", persons);

const personSchema = Joi.object().keys({
  name: Joi.string().required(),
  age: Joi.number().required(),
  hobbies: Joi.array().items(Joi.string()).min(1).required(),
});

app.get("/person", (req, res) => {
  res.json(persons);
});

app.get("/person/:id", (req, res) => {
  const person = persons.find((person) => person.id === req.params.id);
  if (!person) {
    return res.status(404).json({ error: "Person not found" });
  }
  res.json(person);
});

app.post("/person", (req, res) => {
  const result = personSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }
  const person = {
    id: uuidv4(),
    ...req.body,
  };
  persons.push(person);
  res.status(200).json(person);
});

app.put("/person/:id", (req, res) => {
  const result = personSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }
  const person = persons.find((person) => person.id === req.params.id);
  if (!person) {
    return res.status(404).json({ error: "Person not found" });
  }
  Object.assign(person, req.body);
  res.json(person);
});

app.delete("/person/:id", (req, res) => {
  const index = persons.findIndex((person) => person.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Person not found" });
  }
  persons.splice(index, 1);
  res.status(204).send();
});

// Handle non-existing routes (404 error)
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// Global error handler for internal server errors (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error." });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}
module.exports = app;
