const BASE_URL = "http://127.0.0.1:8000";

// ROOT TEST
export const getHome = async () => {
  const res = await fetch(`${BASE_URL}/`);
  return res.json();
};

// QUERY API (your main feature)
export const askQuery = async (question) => {
  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });
  return res.json();
};