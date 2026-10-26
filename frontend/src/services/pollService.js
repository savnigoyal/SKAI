/**
 * Menu Polling & Voting API Service
 * Handles live backend requests with robust fallback to demo data for college presentations.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

/**
 * In-Memory Demo Polls state for seamless offline demonstration
 */
export let DEMO_POLLS_STORE = [
  {
    poll_id: 1,
    title: "Vote for Next Sunday's Special Breakfast",
    meal_type: 'Breakfast',
    opens_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    closes_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_by: 'Mess Manager',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    total_votes: 68,
    eligible_voters: 120,
    participation_rate: 56.7,
    has_voted: false,
    voted_option_id: null,
    options: [
      {
        option_id: 1,
        food_name: 'Aloo Paratha with Curd & Amul Butter',
        image_url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&q=80',
        votes_count: 32,
        percentage: 47.1
      },
      {
        option_id: 2,
        food_name: 'Masala Dosa with Sambar & Coconut Chutney',
        image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80',
        votes_count: 22,
        percentage: 32.4
      },
      {
        option_id: 3,
        food_name: 'Chole Bhature with Pickled Onions',
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80',
        votes_count: 10,
        percentage: 14.7
      },
      {
        option_id: 4,
        food_name: 'Indori Poha with Sev & Masala Chai',
        image_url: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80',
        votes_count: 4,
        percentage: 5.9
      }
    ],
    winner: {
      option_id: 1,
      food_name: 'Aloo Paratha with Curd & Amul Butter',
      votes_count: 32,
      percentage: 47.1
    },
    is_tie: false,
    winners: []
  },
  {
    poll_id: 2,
    title: 'Wednesday Mid-Week Lunch Special',
    meal_type: 'Lunch',
    opens_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    closes_at: new Date(Date.now() + 60 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_by: 'Mess Manager',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    total_votes: 52,
    eligible_voters: 120,
    participation_rate: 43.3,
    has_voted: false,
    voted_option_id: null,
    options: [
      {
        option_id: 5,
        food_name: 'Paneer Butter Masala + Garlic Naan',
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
        votes_count: 24,
        percentage: 46.2
      },
      {
        option_id: 6,
        food_name: 'Hyderabadi Veg Dum Biryani + Mirchi Ka Salan',
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
        votes_count: 20,
        percentage: 38.5
      },
      {
        option_id: 7,
        food_name: 'Punjabi Rajma Chawal with Desi Ghee',
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
        votes_count: 8,
        percentage: 15.4
      }
    ],
    winner: {
      option_id: 5,
      food_name: 'Paneer Butter Masala + Garlic Naan',
      votes_count: 24,
      percentage: 46.2
    },
    is_tie: false,
    winners: []
  },
  {
    poll_id: 3,
    title: 'Friday Feast Dinner Dessert Special',
    meal_type: 'Dinner',
    opens_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    closes_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'closed',
    created_by: 'Mess Manager',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    total_votes: 94,
    eligible_voters: 120,
    participation_rate: 78.3,
    has_voted: true,
    voted_option_id: 10,
    options: [
      {
        option_id: 8,
        food_name: 'Hot Gulab Jamun with Rabri',
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80',
        votes_count: 36,
        percentage: 38.3
      },
      {
        option_id: 9,
        food_name: 'Desi Ghee Moong Dal Halwa',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
        votes_count: 22,
        percentage: 23.4
      },
      {
        option_id: 10,
        food_name: 'Kesar Pista Rasmalai',
        image_url: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80',
        votes_count: 36,
        percentage: 38.3
      }
    ],
    winner: null,
    is_tie: true,
    winners: [
      { option_id: 8, food_name: 'Hot Gulab Jamun with Rabri', votes_count: 36, percentage: 38.3 },
      { option_id: 10, food_name: 'Kesar Pista Rasmalai', votes_count: 36, percentage: 38.3 }
    ]
  }
];

function recalculateDemoPollMetrics(poll) {
  const total = poll.options.reduce((acc, opt) => acc + (opt.votes_count || 0), 0);
  poll.total_votes = total;
  poll.participation_rate = poll.eligible_voters > 0
    ? Number(((total / poll.eligible_voters) * 100).toFixed(1))
    : 0;

  poll.options.forEach(opt => {
    opt.percentage = total > 0 ? Number(((opt.votes_count / total) * 100).toFixed(1)) : 0;
  });

  if (total === 0) {
    poll.winner = null;
    poll.is_tie = false;
    poll.winners = [];
    return;
  }

  let maxVotes = -1;
  poll.options.forEach(opt => {
    if (opt.votes_count > maxVotes) maxVotes = opt.votes_count;
  });

  const top = poll.options.filter(opt => opt.votes_count === maxVotes);
  if (top.length > 1) {
    poll.is_tie = true;
    poll.winner = null;
    poll.winners = top;
  } else {
    poll.is_tie = false;
    poll.winner = top[0];
    poll.winners = [top[0]];
  }
}

/**
 * Fetch polls
 */
export async function fetchPolls({ meal_type, status, student_id, isDemoMode = false } = {}) {
  if (isDemoMode) {
    let result = [...DEMO_POLLS_STORE];
    if (meal_type) {
      result = result.filter(p => p.meal_type.toLowerCase() === meal_type.toLowerCase());
    }
    if (status && status !== 'all') {
      result = result.filter(p => p.status === status);
    }
    return { polls: result };
  }

  const params = new URLSearchParams();
  if (meal_type) params.append('meal_type', meal_type);
  if (status) params.append('status', status);
  if (student_id) params.append('student_id', student_id);

  const headers = {};
  if (student_id) headers['x-student-id'] = student_id;

  const res = await fetch(`${API_BASE_URL}/polls?${params.toString()}`, { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch polls from server');
  }
  return data;
}

/**
 * Fetch single poll details
 */
export async function fetchPollById(pollId, { student_id, isDemoMode = false } = {}) {
  if (isDemoMode) {
    const poll = DEMO_POLLS_STORE.find(p => p.poll_id === Number(pollId));
    if (!poll) throw new Error('Poll not found');
    return { poll };
  }

  const headers = {};
  if (student_id) headers['x-student-id'] = student_id;

  const res = await fetch(`${API_BASE_URL}/polls/${pollId}`, { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch poll details');
  }
  return data;
}

/**
 * Submit vote
 */
export async function submitVote({ pollId, optionId, studentId, isDemoMode = false }) {
  if (!studentId) throw new Error('Student identity is required to vote');
  if (!optionId) throw new Error('Please select an option to vote');

  if (isDemoMode) {
    const poll = DEMO_POLLS_STORE.find(p => p.poll_id === Number(pollId));
    if (!poll) throw new Error('Poll not found in demo data');
    if (poll.status === 'closed') throw new Error('Voting is closed for this poll');
    if (poll.has_voted) throw new Error('You have already voted in this poll');

    const opt = poll.options.find(o => o.option_id === Number(optionId));
    if (!opt) throw new Error('Selected option does not belong to this poll');

    opt.votes_count = (opt.votes_count || 0) + 1;
    poll.has_voted = true;
    poll.voted_option_id = Number(optionId);
    recalculateDemoPollMetrics(poll);

    return {
      message: 'Vote submitted successfully (Demo Mode)',
      vote: { poll_id: poll.poll_id, option_id: optionId, student_id: studentId },
      total_votes: poll.total_votes,
      options: poll.options,
      winner: poll.winner,
      is_tie: poll.is_tie,
      winners: poll.winners
    };
  }

  const res = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-student-id': studentId
    },
    body: JSON.stringify({
      option_id: optionId,
      student_id: studentId
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit vote');
  }
  return data;
}

/**
 * Fetch poll results
 */
export async function fetchPollResults(pollId, { isDemoMode = false } = {}) {
  if (isDemoMode) {
    const poll = DEMO_POLLS_STORE.find(p => p.poll_id === Number(pollId));
    if (!poll) throw new Error('Poll not found');
    return {
      poll_id: poll.poll_id,
      title: poll.title,
      meal_type: poll.meal_type,
      status: poll.status,
      total_votes: poll.total_votes,
      eligible_voters: poll.eligible_voters,
      participation_rate: poll.participation_rate,
      options: poll.options,
      winner: poll.winner,
      is_tie: poll.is_tie,
      winners: poll.winners
    };
  }

  const res = await fetch(`${API_BASE_URL}/polls/${pollId}/results`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch poll results');
  }
  return data;
}

/**
 * Create a new poll (Manager)
 */
export async function createPoll(pollData, { isDemoMode = false } = {}) {
  if (isDemoMode) {
    const newId = Date.now();
    const newPoll = {
      poll_id: newId,
      title: pollData.title,
      meal_type: pollData.meal_type,
      opens_at: pollData.opens_at,
      closes_at: pollData.closes_at,
      status: 'active',
      created_by: 'Mess Manager',
      created_at: new Date().toISOString(),
      total_votes: 0,
      eligible_voters: 120,
      participation_rate: 0,
      has_voted: false,
      voted_option_id: null,
      options: pollData.options.map((opt, idx) => ({
        option_id: newId + idx + 1,
        food_name: opt.food_name,
        image_url: opt.image_url || null,
        votes_count: 0,
        percentage: 0
      })),
      winner: null,
      is_tie: false,
      winners: []
    };
    DEMO_POLLS_STORE.unshift(newPoll);
    return { message: 'Poll created successfully (Demo Mode)', poll_id: newId };
  }

  const res = await fetch(`${API_BASE_URL}/polls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'manager'
    },
    body: JSON.stringify(pollData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create poll');
  }
  return data;
}

/**
 * Edit poll details (Manager)
 */
export async function updatePoll(pollId, pollData, { isDemoMode = false } = {}) {
  if (isDemoMode) {
    const poll = DEMO_POLLS_STORE.find(p => p.poll_id === Number(pollId));
    if (!poll) throw new Error('Poll not found');
    if (pollData.title) poll.title = pollData.title;
    if (pollData.meal_type) poll.meal_type = pollData.meal_type;
    if (pollData.opens_at) poll.opens_at = pollData.opens_at;
    if (pollData.closes_at) poll.closes_at = pollData.closes_at;
    return { message: 'Poll updated successfully', poll_id: pollId };
  }

  const res = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'manager'
    },
    body: JSON.stringify(pollData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update poll');
  }
  return data;
}

/**
 * Close or reopen poll (Manager)
 */
export async function updatePollStatus(pollId, status, { isDemoMode = false } = {}) {
  if (isDemoMode) {
    const poll = DEMO_POLLS_STORE.find(p => p.poll_id === Number(pollId));
    if (!poll) throw new Error('Poll not found');
    poll.status = status;
    return { message: `Poll status updated to ${status}`, poll_id: pollId, status };
  }

  const res = await fetch(`${API_BASE_URL}/polls/${pollId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'manager'
    },
    body: JSON.stringify({ status })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update poll status');
  }
  return data;
}

/**
 * Delete poll (Manager)
 */
export async function deletePoll(pollId, { isDemoMode = false } = {}) {
  if (isDemoMode) {
    DEMO_POLLS_STORE = DEMO_POLLS_STORE.filter(p => p.poll_id !== Number(pollId));
    return { message: 'Poll deleted successfully', poll_id: pollId };
  }

  const res = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
    method: 'DELETE',
    headers: {
      'x-user-role': 'manager'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete poll');
  }
  return data;
}
