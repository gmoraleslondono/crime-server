import express from "express";
import axios from "axios";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from "yaml";

const app = express();
const PORT = 3000;

const swaggerDocs = YAML.parse(fs.readFileSync("./swagger.yaml", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// GET /crimes: Fetch recent crime data for where you live and return it as JSON.
app.get("/crimes", async (req, res) => {
  try {
    const crimes = await axios.get(
      "https://brottsplatskartan.se/api/events/?location=sundbyberg&limit=5"
    );
    res.send(crimes.data.data);
  } catch (error) {
    console.error(error);
  }
});

// GET /crimes/locations: Return only the "headline" for each crime.
app.get("/crimes/locations", async (req, res) => {
  try {
    const response = await axios.get(
      "https://brottsplatskartan.se/api/events/?location=sundbyberg"
    );
    res.send(response.data.data.map((crime) => crime.headline));
  } catch (error) {
    console.error(error);
  }
});

// GET /crimes/search?city=:city: Allow users to specify a city (like "malmo" or "stockholm") via a query parameter.
app.get("/crimes/search", async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) {
      return res.status(400).send("City is required.");
    }
    const response = await axios.get(
      `https://brottsplatskartan.se/api/events/?location=${city}`
    );
    res.send(response.data.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data.");
  }
});

// GET /crimes/latest: Return only the latest crime event (the first one in the list)
app.get("/crimes/latest", async (req, res) => {
  try {
    const response = await axios.get("https://brottsplatskartan.se/api/events");
    res.send(response.data.data[0]);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
