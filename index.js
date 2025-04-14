require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Telegraf } = require("telegraf");
const db = require("./db");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(cors());

bot.on("channel_post", async (ctx) => {
  const msg = ctx.channelPost;
  const { message_id, chat, text, date } = msg;

  try {
    await db.query(
      "INSERT INTO messages (message_id, chat_id, text, date) VALUES ($1, $2, $3, to_timestamp($4))",
      [message_id, chat.id.toString(), text || "", date]
    );
  } catch (err) {
    console.error("DB error:", err.message);
  }
});

app.get("/messages", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM messages ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  bot.launch().then(() => console.log("Bot started"));
});
