const express = require("express");

const router = express.Router();

const {
  getAllPersons,
  getPersonById,
  registerPerson,
  updatePerson,
  deletePerson
} = require("../controllers/personController");

router.post("/register-person", registerPerson);

router.get("/all-persons", getAllPersons);

router.get("/missing-persons/:id", getPersonById);

router.put("/missing-persons/:id", updatePerson);

router.delete("/missing-persons/:id", (req, res) => {
  const id = parseInt(req.params.id);

  res.json({
    message: `Person ${id} deleted successfully`
  });
});

module.exports = router;