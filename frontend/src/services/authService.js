const API_BASE_URL = "http://localhost:5000";

async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await readResponse(response);

  if (!response.ok) {
    throw new Error(result.error?.message || "Request failed. Please try again.");
  }
  return result.data ?? {};
}

// Log in a student or Mess Manager.
export async function login({ identifier, password, role }) {
  const result = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { identifier, password, role },
  });
  return result.user;
}

// Register a student account. The server always assigns the student role.

export async function registerStudent({
  full_name,
  student_id,
  email,
  hostel_block,
  room_no,
  year,
  department,
  password,
}) {
  const result = await apiRequest("/api/auth/register", {
    method: "POST",
    body: {
      full_name,
      student_id,
      email,
      hostel_block,
      room_no,
      year,
      department,
      password,
    },
  });

  return result.user;
}


// Request password recovery. In local development the API may return a local-only reset URL.
export async function requestPasswordReset(email) {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

// Set a new password using a one-time reset token.
export async function resetPassword({ token, password }) {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

// Check whether the browser has an authenticated Flask session.
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) return null;

  const result = await readResponse(response);
  if (!response.ok) {
    throw new Error(result.error?.message || "Unable to check your login status.");
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
