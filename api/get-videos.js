// api/get-videos.js
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;

    const telegramURL = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
    const { data } = await axios.get(telegramURL);

    const messages = data.result
      .map(u => u.message || u.channel_post)
      .filter(m => m && m.video);

    const videos = messages.slice(-10).map(m => ({
      file_id: m.video.file_id,
      caption: m.caption || "",
    }));

    const detailedVideos = await Promise.all(
      videos.map(async v => {
        const fileRes = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${v.file_id}`);
        const path = fileRes.data.result.file_path;
        const file_url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${path}`;
        return { ...v, file_url };
      })
    );

    res.status(200).json(detailedVideos);
  } catch (err) {
    console.error("Telegram API Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch videos", details: err?.response?.data || err.message });
  }
};
