export default async function handler(req, res) {
    try {
      const q = req.query.q || "fetch:ip";
      const url = `http://api.weatherstack.com/current?access_key=9b2527dfad32468d5943728d275f511d&query=${encodeURIComponent(q)}&units=m`;
      const response = await fetch(url);
      const data = await response.json();
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Weather unavailable" });
    }
  }
  