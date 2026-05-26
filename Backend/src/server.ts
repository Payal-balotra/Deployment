import express from "express"
import cors from "cors"
import { pool } from "./db";
import { prisma } from "./lib/prisma";

const app = express();

app.use(cors());
app.use(express.json()); // Enable JSON body parsing for CRUD operations

// Existing health check and verification endpoints
app.get("/api/message", (req, res) => {
  res.json({
    success: true,
    message: "Hello from backend",
  });
});

app.get("/", async (req, res) => {
  try {
    // const result = await pool.query("SELECT NOW()");
    res.json({ status: "connected", message: "this is front page " });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// --- CRUD ENDPOINTS FOR USERS USING PRISMA ORM ---

// 1. GET /api/users - Fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/users/:id - Fetch a single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/users - Create a new user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    });
    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === "P2002") { // Prisma unique key violation
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// 4. PUT /api/users/:id - Update an existing user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    });

    res.json(user);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (err.code === "P2025") { // Prisma record not found
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE /api/users/:id - Delete a user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "User deleted successfully", user });
  } catch (err: any) {
    if (err.code === "P2025") { // Prisma record not found
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
