/**
 * roadmap.js — Full cybersecurity roadmap with topic detail panel
 */

const RoadmapPage = {
  _selectedTopic: null,

  async render(container) {
    await CFC_API.loadRoadmap();
    const { topics } = CFC_STATE.getState();
    const categories = [...new Set(topics.map(t => t.category))];
    const completedCount = topics.filter(t => t.is_completed).length;
    const progress = Math.round(completedCount / topics.length * 100);

    container.innerHTML = `
      ${CFC_UI.renderSidebar('roadmap')}
      <main class="main-content">
        <div class="page-header">
          <div class="page-title"><span>🗺</span> Learning Roadmap</div>
          <div class="page-subtitle">30 cybersecurity topics — from fundamentals to bug bounty</div>
        </div>

        <!-- Overall Progress -->
        <div class="card mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="label">Overall Progress</div>
              <div style="font-family:var(--font-mono);font-size:1.5rem;font-weight:700;color:var(--primary)">${completedCount}<span style="color:var(--text-muted);font-size:1rem">/${topics.length}</span></div>
            </div>
            <div class="text-right">
              <div class="label">Completion</div>
              <div style="font-family:var(--font-mono);font-size:1.5rem;font-weight:700;color:var(--accent-blue)">${progress}%</div>
            </div>
          </div>
          <div class="progress-bar" style="height:8px">
            <div class="progress-fill" style="width:${progress}%"></div>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="flex gap-2 mb-6" style="flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm category-filter active" data-cat="all">All (${topics.length})</button>
          ${categories.map(cat => {
            const count = topics.filter(t => t.category === cat).length;
            const done  = topics.filter(t => t.category === cat && t.is_completed).length;
            return `<button class="btn btn-ghost btn-sm category-filter" data-cat="${cat}">${cat} (${done}/${count})</button>`;
          }).join('')}
        </div>

        <div class="grid-2" style="align-items:start;gap:24px">
          <!-- Track -->
          <div id="roadmap-list">
            ${this._renderFilteredTopics(topics, 'all')}
          </div>

          <!-- Detail Panel -->
          <div id="topic-detail-panel">
            ${this._renderDetailPanel(null, topics)}
          </div>
        </div>
      </main>
    `;

    this._attachListeners(container);
  },

  _renderFilteredTopics(topics, cat) {
    const filtered = cat === 'all' ? topics : topics.filter(t => t.category === cat);
    return CFC_UI.renderRoadmapTrack(filtered, true);
  },

  _renderDetailPanel(topic, topics) {
    if (!topic) {
      return `
        <div class="card" style="position:sticky;top:32px">
          <div class="empty-state" style="padding:40px 20px">
            <div class="empty-state-icon">👈</div>
            <div class="empty-state-title">Select a Topic</div>
            <div class="empty-state-desc">Click any topic on the left to see details, hints, and start a session.</div>
          </div>
        </div>
      `;
    }

    const state = topic.is_completed ? 'completed' : topic.is_locked ? 'locked' : 'active';
    const hints = TUTOR_HINTS[topic.id] || [];

    return `
      <div class="card" style="position:sticky;top:32px">
        <div class="card-title">📖 Topic Details</div>

        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge badge-${state === 'completed' ? 'green' : state === 'active' ? 'blue' : 'purple'}">${state.toUpperCase()}</span>
            <span class="badge badge-amber">${topic.category}</span>
          </div>
          <h3 style="font-family:var(--font-mono);font-size:1.1rem;color:var(--text-primary);margin:8px 0">${topic.title}</h3>
          <p class="text-sm text-muted" style="line-height:1.7">${topic.description}</p>
          <div class="text-xs text-muted mt-4 font-mono">Topic #${topic.sequence_order} · Est. ${topic.estimated_days} day${topic.estimated_days !== 1 ? 's' : ''}</div>
        </div>

        <div class="separator"></div>

        <div class="mb-4">
          <div class="label mb-4">Study Resources</div>
          <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-secondary);line-height:2">
            ${_getTopicResources(topic.id)}
          </div>
        </div>

        ${hints.length > 0 ? `
          <div class="separator"></div>
          <div class="mb-4">
            <div class="label mb-4">Tutor Hints (${hints.length})</div>
            ${hints.map((h, i) => `
              <div class="tutor-hint-wrap mb-3">
                <div class="tutor-hint-header" onclick="this.nextElementSibling.classList.toggle('open')">
                  <span>💡 Hint ${i + 1}</span><span>▾</span>
                </div>
                <div class="tutor-hint-body">${h}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="separator"></div>

        <div class="flex gap-3 flex-wrap">
          ${!topic.is_locked ? `
            <button class="btn btn-primary btn-sm" onclick="CFC_ROUTER.navigate('session', {topicId:${topic.id}})">▶ Study This Topic</button>
          ` : ''}
          ${!topic.is_completed && !topic.is_locked ? `
            <button class="btn btn-ghost btn-sm" id="mark-complete-${topic.id}" data-topic="${topic.id}" onclick="RoadmapPage._markComplete(${topic.id})">✓ Mark Complete</button>
          ` : ''}
          ${topic.is_locked ? `
            <button class="btn btn-amber btn-sm" onclick="RoadmapPage._unlock(${topic.id})">🔓 Unlock Manually</button>
          ` : ''}
        </div>
      </div>
    `;
  },

  _attachListeners(container) {
    // Category filter
    container.querySelectorAll('.category-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const cat = e.currentTarget.dataset.cat;
        const { topics } = CFC_STATE.getState();
        const list = container.querySelector('#roadmap-list');
        if (list) list.innerHTML = this._renderFilteredTopics(topics, cat);
        this._attachTopicNodeListeners(container);
      });
    });

    this._attachTopicNodeListeners(container);
  },

  _attachTopicNodeListeners(container) {
    container.querySelectorAll('.roadmap-node').forEach(node => {
      node.addEventListener('click', async (e) => {
        const topicId = parseInt(e.currentTarget.dataset.topic);
        const { topics } = CFC_STATE.getState();
        const topic = topics.find(t => t.id === topicId);
        this._selectedTopic = topic;
        const panel = container.querySelector('#topic-detail-panel');
        if (panel) panel.innerHTML = this._renderDetailPanel(topic, topics);

        // Highlight selected
        container.querySelectorAll('.roadmap-node').forEach(n => n.style.opacity = '1');
        e.currentTarget.style.opacity = '1';
      });
    });
  },

  async _markComplete(topicId) {
    await CFC_API.completeTopic(topicId);
    const { topics } = CFC_STATE.getState();
    const container = document.querySelector('#app');
    if (container) await RoadmapPage.render(container);
  },

  async _unlock(topicId) {
    await CFC_API.unlockTopic(topicId);
    const container = document.querySelector('#app');
    if (container) await RoadmapPage.render(container);
  },
};

function _getTopicResources(topicId) {
  const resources = {
    1:  '• TryHackMe: Pre-Security path<br>• HackTheBox Academy: Networking fundamentals<br>• Professor Messer CompTIA Network+',
    2:  '• OverTheWire: Bandit (wargame)<br>• Linux Journey (linuxjourney.com)<br>• TryHackMe: Linux Fundamentals rooms',
    3:  '• Wireshark official documentation<br>• TryHackMe: Wireshark rooms<br>• YouTube: Chris Greer Wireshark tutorials',
    4:  '• CryptoHack (cryptohack.org)<br>• TryHackMe: Cryptography modules<br>• Computerphile YouTube channel',
    5:  '• OWASP Top 10 (owasp.org)<br>• PortSwigger Web Academy (free)<br>• TryHackMe: Web Fundamentals',
    6:  '• PortSwigger SQLi Labs<br>• HackTheBox: SQL injection challenges<br>• SQLMap documentation',
    7:  '• PortSwigger XSS Labs<br>• PayloadsAllTheThings GitHub (XSS section)<br>• TryHackMe: XSS rooms',
    8:  '• PortSwigger: Authentication vulnerabilities lab<br>• jwt.io (JWT debugger)<br>• TryHackMe: Authentication bypass',
    9:  '• Burp Suite official documentation<br>• TryHackMe: Burp Suite rooms<br>• YouTube: NahamSec Burp Suite tutorials',
    10: '• PortSwigger: IDOR/Access control labs<br>• InsiderPhD IDOR methodology<br>• HackTheBox: IDOR challenges',
    11: '• GTFOBins (gtfobins.github.io)<br>• HackTheBox Academy: Linux PrivEsc<br>• TryHackMe: Linux PrivEsc room',
    12: '• PayloadsAllTheThings: Windows PrivEsc<br>• HackTheBox Academy: Windows PrivEsc<br>• TryHackMe: Windows PrivEsc room',
    13: '• Metasploit Unleashed (free)<br>• TryHackMe: Metasploit rooms<br>• HackTheBox Academy: Metasploit modules',
    14: '• LiveOverflow YouTube: Buffer Overflow series<br>• TryHackMe: Buffer Overflow Prep room<br>• Exploit.education VMs',
    15: '• BloodHound CE documentation<br>• HackTheBox Academy: Active Directory<br>• TryHackMe: Active Directory rooms',
    16: '• Nmap official documentation<br>• TryHackMe: Nmap room<br>• Shodan.io tutorial',
    17: '• OSINT Framework (osintframework.com)<br>• Bellingcat Online Investigation Toolkit<br>• TryHackMe: OSINT challenges',
    18: '• Hashcat documentation (hashcat.net)<br>• SecLists GitHub (password lists)<br>• CrackStation (online lookup)',
    19: '• Ghidra NSA documentation<br>• LiveOverflow RE series<br>• TryHackMe: Reverse Engineering',
    20: '• pwn.college (pwntools, exploitation)<br>• CTF101 (ctf101.org)<br>• pwntools documentation',
    21: '• ANY.RUN sandbox (free tier)<br>• YARA rules GitHub (VirusTotal)<br>• TryHackMe: Malware Analysis rooms',
    22: '• Splunk Free Training<br>• TryHackMe: SOC Level 1 path<br>• ELK Stack documentation',
    23: '• SANS IR Lifecycle guide<br>• TryHackMe: Incident Response rooms<br>• NIST Computer Security Incident Guide',
    24: '• Snort documentation<br>• TryHackMe: Firewall/IDS rooms<br>• pfSense documentation',
    25: '• Docker security best practices<br>• TryHackMe: Docker Rodeo room<br>• Trivy documentation',
    26: '• Pacu AWS exploitation framework<br>• CloudGoat (vulnerable AWS lab)<br>• TryHackMe: AWS rooms',
    27: '• CTFtime.org (upcoming CTFs)<br>• picoCTF (beginner friendly)<br>• HackTheBox Starting Point',
    28: '• Volatility documentation<br>• TryHackMe: Forensics rooms<br>• CyberChef (gchq.github.io/CyberChef)',
    29: '• pwntools documentation<br>• Python requests library docs<br>• HackerOne public reports (examples)',
    30: '• HackerOne Hacktivity (public reports)<br>• Bugcrowd University<br>• NahamSec recon methodology',
  };
  return resources[topicId] || '• TryHackMe<br>• HackTheBox<br>• PortSwigger Web Academy';
}

window.RoadmapPage = RoadmapPage;
