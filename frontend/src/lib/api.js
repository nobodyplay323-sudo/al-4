import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export async function submitScore({ game, nickname, score, meta }) {
  const res = await axios.post(`${API}/scores`, { game, nickname, score, meta });
  return res.data;
}

export async function getScores(game, limit = 10) {
  const res = await axios.get(`${API}/scores/${game}`, { params: { limit } });
  return res.data;
}

export async function getStats() {
  const res = await axios.get(`${API}/stats`);
  return res.data;
}

const NICK_KEY = "arcade_nickname";
export function getNickname() {
  return localStorage.getItem(NICK_KEY) || "";
}
export function saveNickname(name) {
  localStorage.setItem(NICK_KEY, name);
}
