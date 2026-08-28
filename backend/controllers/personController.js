const persons = require("../models/personModel");

const getAllPersons = (req, res) => {
  res.json(persons);
};

const getPersonById = (req, res) => {
  const id = parseInt(req.params.id);

  const person = persons.find((p) => p.id === id);

  if (!person) {
    return res.status(404).json({
      message: "Person Not Found"
    });
  }

  res.json(person);
};

const registerPerson = (req, res) => {
  const newPerson = {
    id: persons.length + 1,
    ...req.body
  };

  persons.push(newPerson);

  res.status(201).json({
    message: "Person Registered",
    person: newPerson
  });
};

const updatePerson = (req, res) => {
  const id = parseInt(req.params.id);

  const person = persons.find((p) => p.id === id);

  if (!person) {
    return res.status(404).json({
      message: "Person Not Found"
    });
  }

  Object.assign(person, req.body);

  res.json({
    message: "Person Updated Successfully",
    person
  });
};

const deletePerson = (req, res) => {
  const id = parseInt(req.params.id);

  const personIndex = persons.findIndex(
    (p) => p.id === id
  );

  if (personIndex === -1) {
    return res.status(404).json({
      message: "Person Not Found"
    });
  }

  persons.splice(personIndex, 1);

  res.json({
    message: "Person Deleted Successfully"
  });
};

module.exports = {
  persons,
  getAllPersons,
  getPersonById,
  registerPerson,
  updatePerson,
  deletePerson
};