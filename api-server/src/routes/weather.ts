import { Router } from "express";

const weatherRouter = Router();

weatherRouter.get("/weather", async (req, res) => {
  try {
    const query = (req.query.q as string) || "fetch:ip";
    const url = `http://api.weatherstack.com/current?access_key=9b2527dfad32468d5943728d275f511d&query=${encodeURIComponent(query)}&units=m`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Weather unavailable" });
  }
});

export default weatherRouter;
