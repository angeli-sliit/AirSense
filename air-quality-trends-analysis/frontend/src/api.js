import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
});

// Inject plan header (your backend enforces tiers by X-PLAN)
api.interceptors.request.use((config) => {
    config.headers["X-PLAN"] = import.meta.env.VITE_PLAN || "free";
    return config;
});

export const health = () => api.get("/healthz").then(r => r.data);
export const scrape = (city, days=7) => api.post("/scrape", { city, days }).then(r=>r.data);
export const compareCities = (cities, days=7) => api.post("/compare", { cities, days }).then(r=>r.data);
export const forecastMulti = (cities, horizonDays=7, trainDays=30, use_cache=true) =>
    api.post("/forecast/multi", { cities, horizonDays, trainDays, use_cache }).then(r=>r.data);

export const agentPlan = (prompt) =>
    api.post("/agent/plan", { prompt }).then(r=>r.data);

export const agentExecute = (payload) =>
    api.post("/agent/execute", payload).then(r=>r.data);
