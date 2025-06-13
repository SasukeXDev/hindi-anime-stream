// /api/get-videos.js
import axios from "axios";

const BOT_TOKEN = "7776390965:AAHzRKpCHEwRiyYgYtuG3IkWIEOYICAlx80";
const CHANNEL_USERNAME = "-1002713297570"; // Not used in getUpdates

export default async function handler(req, res) {
  try {
    const api = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
    const { data } = await axios.get(api);

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
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
}
