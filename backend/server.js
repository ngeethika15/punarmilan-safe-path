const express = require("express");
const cors = require("cors");
require("dotenv").config();

const personRoutes = require("./routes/personRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Punarmilan Backend Running");
});

app.use("/api", personRoutes);


// Keep your PUT route here for now
app.put("/api/missing-persons/:id", (req, res) => {
  const id = req.params.id;

  res.json({
    message: `Person ${id} updated successfully`,
    updatedData: req.body
  });
});

// Keep your DELETE route here for now
app.delete("/api/missing-persons/:id", (req, res) => {
  res.status(404).json({
    message: "Person Not Found"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});