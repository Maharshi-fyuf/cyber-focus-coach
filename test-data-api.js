const fetch = globalThis.fetch;

const BASE_URL = 'http://127.0.0.1:3001/api';

async function test() {
    console.log('\n--- 1. DASHBOARD ---');
    let res = await fetch(`${BASE_URL}/dashboard/today`);
    console.log(await res.json());

    console.log('\n--- 2. ROADMAP ---');
    res = await fetch(`${BASE_URL}/roadmap`);
    const roadmap = await res.json();
    console.log(`Topics count: ${roadmap.length}, First topic:`, roadmap[0]);

    console.log('\n--- 3. SETTINGS GET ---');
    res = await fetch(`${BASE_URL}/settings`);
    console.log(await res.json());

    console.log('\n--- 4. SETTINGS PUT ---');
    res = await fetch(`${BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus_threshold: 42 })
    });
    console.log(await res.json());

    console.log('\n--- 5. STREAKS ---');
    res = await fetch(`${BASE_URL}/streaks`);
    console.log(await res.json());

    console.log('\n--- 6. LOGS CREATE ---');
    res = await fetch(`${BASE_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            log_date: '2026-07-20',
            summary: 'Tested data routes',
            wins: 'Everything works',
            blockers: 'None'
        })
    });
    console.log(await res.json());

    console.log('\n--- 7. LOGS GET ALL ---');
    res = await fetch(`${BASE_URL}/logs`);
    const logs = await res.json();
    console.log(logs);
    
    console.log('\n--- 8. FOCUS EVENT ---');
    // We need a real session to satisfy the foreign key constraint
    let sessionRes = await fetch(`${BASE_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: 1, planned_minutes: 30 })
    });
    
    // If a session is already active, fetch that instead
    if (sessionRes.status === 400) {
        sessionRes = await fetch(`${BASE_URL}/session/active`);
    }
    
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.id;

    res = await fetch(`${BASE_URL}/focus-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            event_type: 'tab_hidden'
        })
    });
    console.log(await res.json());

    // Clean up the session
    await fetch(`${BASE_URL}/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Cleanup from test script' })
    });

    console.log('\n--- 9. QUIZZES GET ---');
    res = await fetch(`${BASE_URL}/quizzes/topic/1`);
    const quizzes = await res.json();
    console.log(quizzes);
}

test().catch(console.error);
