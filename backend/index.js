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
const PORT = process.env.PORT ?? 3000;
// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// POST /login
app.post("/login", async (req, res) => {
  const { name, personalCode } = req.body;

  // Trim and put to lowercase
  const trimmedName = name.trim().toLowerCase();
  // Convert personalCode to number
  const personalCodeNumber = Number(personalCode);

  const { data, error } = await supabase
    .from("swims")
    .select("name")
    .eq("name", trimmedName)
    .eq("personal_code", personalCodeNumber)
    .limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.json({ success: true });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
});

// POST /add
app.post("/add", async (req, res) => {
  const { name, meters } = req.body;
  console.log("Received request data:", { name, meters });

  const trimmedName = name.trim().toLowerCase();

  try {
    const { error } = await supabase
      .from("swims")
      .insert([{ name: trimmedName, meters }]);

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

app.listen(PORT, () => console.log(`API up on ${PORT}`));
