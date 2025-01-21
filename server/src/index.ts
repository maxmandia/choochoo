import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());

app.post("/graphql", async (req, res) => {
  try {
    const graphQLEndpoint = "https://backboard.railway.com/graphql/v2";
    const { query, variables } = req.body;

    const response = await axios({
      method: "POST",
      url: graphQLEndpoint,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RAILWAY_API_TOKEN}`,
      },
      data: { query, variables },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error calling external GraphQL API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
