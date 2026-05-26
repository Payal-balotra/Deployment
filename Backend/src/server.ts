import express from "express"
import cors from "cors"
import { pool } from "./db";
const app = express();


app.use(cors());

app.get("/api/message", (req, res) => {
  res.json({
    success: true,
    message: "Hello from backend ",
  });
});
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");

  res.json(result.rows);
});
app.listen(3001, () => {
  console.log("Server running on port 3001");
});