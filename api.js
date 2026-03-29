// ============================================
// api.js — MindCare Frontend API connector
// Drop this file into the frontend project
// Add <script src="api.js"></script> to every HTML page
// ============================================

const BASE_URL = 'https://mindcare-backend-production-ad91.up.railway.app';

// ─────────────────────────────────────────
// HELPERS (used internally)
// ─────────────────────────────────────────

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

// Register a new user
// Usage: await register("shreya", "mypassword", "student")
// Role must be: "student", "counsellor", or "peer"
async function register(username, password, role) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not connect to server.' };
  }
}

// Login — returns token and user info
// Usage: const data = await login("shreya", "mypassword")
// After this, token is saved automatically — no extra steps needed
async function login(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.token) {
      // Save everything to localStorage (same keys the frontend already uses)
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.username);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('loggedIn', 'true');
    }

    return data;
  } catch (err) {
    return { error: 'Could not connect to server.' };
  }
}

// Logout — clears everything
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// ─────────────────────────────────────────
// STUDENT
// ─────────────────────────────────────────

// Submit the daily check-in form
// Usage: await submitCheckin(stressLevel, sleepHours, focusLevel, mood)
// Example: await submitCheckin("4", "6", "3", "Anxious")
async function submitCheckin(stressLevel, sleepHours, focusLevel, mood) {
  try {
    const answers = [
      { question_text: 'Stress Level', answer_text: stressLevel },
      { question_text: 'Sleep Hours', answer_text: sleepHours },
      { question_text: 'Focus Level', answer_text: focusLevel },
      { question_text: 'Mood',        answer_text: mood }
    ];

    const res = await fetch(`${BASE_URL}/api/student/start-session`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ answers })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not submit check-in.' };
  }
}

// Get all sessions for the logged-in student
// Usage: const data = await getMySessions()
// Returns: { sessions: [...] }
async function getMyStudentSessions() {
  try {
    const res = await fetch(`${BASE_URL}/api/student/my-sessions`, {
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not fetch sessions.' };
  }
}

// Get full details of one session (answers, follow-up questions, advice)
// Usage: const data = await getSessionDetail(sessionId)
async function getSessionDetail(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/api/student/session/${sessionId}`, {
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not fetch session.' };
  }
}

// Answer a follow-up question from counsellor
// Usage: await answerFollowup(questionId, "My answer here")
async function answerFollowup(questionId, answerText) {
  try {
    const res = await fetch(`${BASE_URL}/api/student/answer-followup`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ question_id: questionId, answer_text: answerText })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not submit answer.' };
  }
}

// ─────────────────────────────────────────
// COUNSELLOR
// ─────────────────────────────────────────

// Get all open (unclaimed) student sessions
// Usage: const data = await getOpenSessions()
// Returns: { sessions: [...] }
async function getOpenSessions() {
  try {
    const res = await fetch(`${BASE_URL}/api/counsellor/open-sessions`, {
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not fetch sessions.' };
  }
}

// Claim a session to start helping that student
// Usage: await claimSession(sessionId)
async function claimSession(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/api/counsellor/claim-session/${sessionId}`, {
      method: 'POST',
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not claim session.' };
  }
}

// Get all sessions assigned to this counsellor
// Usage: const data = await getMyCounsellorSessions()
async function getMyCounsellorSessions() {
  try {
    const res = await fetch(`${BASE_URL}/api/counsellor/my-sessions`, {
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not fetch sessions.' };
  }
}

// Get full session details (student answers, follow-ups, advice sent)
// Usage: const data = await getCounsellorSessionDetail(sessionId)
async function getCounsellorSessionDetail(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/api/counsellor/session/${sessionId}`, {
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not fetch session.' };
  }
}

// Send a follow-up question to a student
// Usage: await askFollowup(sessionId, "How long have you been feeling this way?")
async function askFollowup(sessionId, questionText) {
  try {
    const res = await fetch(`${BASE_URL}/api/counsellor/ask-followup`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ session_id: sessionId, question_text: questionText })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not send question.' };
  }
}

// Send advice/guidance to a student
// Usage: await sendAdvice(sessionId, "Here is my advice for you...")
async function sendAdvice(sessionId, message) {
  try {
    const res = await fetch(`${BASE_URL}/api/counsellor/send-advice`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ session_id: sessionId, message })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not send advice.' };
  }
}

// Close/resolve a session
// Usage: await closeSession(sessionId)
async function closeSession(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/api/counsellor/close-session/${sessionId}`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not close session.' };
  }
}

// ─────────────────────────────────────────
// PEER SUPPORT
// ─────────────────────────────────────────

// Get all peer support posts
// Usage: const data = await getPeerPosts()
// Returns: { posts: [...] }
async function getPeerPosts() {
  try {
    const res = await fetch(`${BASE_URL}/api/peer/posts`, {
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not fetch posts.' };
  }
}

// Get a single post with all its replies
// Usage: const data = await getPeerPost(postId)
async function getPeerPost(postId) {
  try {
    const res = await fetch(`${BASE_URL}/api/peer/posts/${postId}`, {
      headers: authHeaders()
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not fetch post.' };
  }
}

// Create a new peer support post
// Usage: await createPeerPost("I have been feeling really stressed lately...")
async function createPeerPost(content) {
  try {
    const res = await fetch(`${BASE_URL}/api/peer/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not create post.' };
  }
}

// Reply to a peer support post
// Usage: await replyToPeerPost(postId, "I felt the same way, here is what helped me...")
async function replyToPeerPost(postId, content) {
  try {
    const res = await fetch(`${BASE_URL}/api/peer/posts/${postId}/reply`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Could not post reply.' };
  }
}
