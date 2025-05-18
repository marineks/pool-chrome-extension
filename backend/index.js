// backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

// Setup
const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// POST /add
app.post("/add", async (req, res) => {
  const { name, meters } = req.body;
  console.log("Received request data:", { name, meters });

  try {
    const { error } = await supabase.from("swims").insert([{ name, meters }]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// GET /stats
app.get("/stats", async (req, res) => {
  const { data, error } = await supabase.from("swims").select("name, meters");
  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error });
  }

  const { total, leaderboard, byUser } = computeData(data);
  res.json({ total, leaderboard, byUser });
});

function computeData(data) {
  const byUser = {};
  let total = 0;
  for (const { name, meters } of data) {
    total += meters;
    byUser[name] = (byUser[name] || 0) + meters;
  }

  const leaderboard = Object.entries(byUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, meters]) => ({ name, meters }));

  return { total, leaderboard, byUser };
}

app.listen(3000, () => console.log("API up on http://localhost:3000"));
