const API_BASE_URL = "http://localhost:5000";

async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// Log in a student or Mess Manager.
export async function login({ identifier, password, role }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      identifier,
      password,
      role,
    }),
  });

  const result = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Unable to log in. Please try again."
    );
  }

  return result.data.user;
}

// Check whether the browser has an authenticated Flask session.
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const result = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Unable to check your login status."
    );
  }

  return result.data.user;
}

// Log out and clear the Flask session.
export async function logout() {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to log out. Please try again.");
  }
}