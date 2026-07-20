/**
 * seed.js — Seeds the DB with default user, 30 roadmap topics, quizzes, settings
 * Only runs on first launch (isFirstLaunch check)
 */

const ROADMAP_TOPICS = [
  { id: 1,  title: 'Networking Fundamentals',       desc: 'OSI model, TCP/IP, subnetting, CIDR, ARP, DNS, DHCP', days: 3, category: 'Foundations' },
  { id: 2,  title: 'Linux Command Line Basics',     desc: 'File system, permissions, users, cron, bash scripting', days: 3, category: 'Foundations' },
  { id: 3,  title: 'Wireshark & Packet Analysis',  desc: 'Capture filters, dissectors, protocol analysis, pcap files', days: 2, category: 'Foundations' },
  { id: 4,  title: 'Cryptography Essentials',      desc: 'Symmetric/asymmetric encryption, hashing, PKI, TLS/SSL', days: 3, category: 'Foundations' },
  { id: 5,  title: 'Web Application Basics',        desc: 'HTTP/S, cookies, sessions, REST APIs, OWASP Top 10 overview', days: 2, category: 'Web Security' },
  { id: 6,  title: 'SQL Injection',                 desc: 'Union-based, blind, time-based injection, SQLMap, mitigation', days: 2, category: 'Web Security' },
  { id: 7,  title: 'Cross-Site Scripting (XSS)',   desc: 'Reflected, stored, DOM XSS; payloads, bypass techniques', days: 2, category: 'Web Security' },
  { id: 8,  title: 'Authentication Attacks',        desc: 'Brute force, credential stuffing, JWT attacks, MFA bypass', days: 2, category: 'Web Security' },
  { id: 9,  title: 'Burp Suite Mastery',            desc: 'Proxy, Repeater, Intruder, Scanner, extensions, workflow', days: 3, category: 'Web Security' },
  { id: 10, title: 'IDOR & Access Control',         desc: 'Horizontal & vertical privilege escalation, parameter tampering', days: 2, category: 'Web Security' },
  { id: 11, title: 'Linux Privilege Escalation',   desc: 'SUID/GUID, sudo misconfig, cron jobs, kernel exploits, PATH abuse', days: 3, category: 'Exploitation' },
  { id: 12, title: 'Windows Privilege Escalation', desc: 'AlwaysInstallElevated, token impersonation, DLL hijacking, UAC bypass', days: 3, category: 'Exploitation' },
  { id: 13, title: 'Metasploit Framework',          desc: 'Modules, exploits, payloads, meterpreter, post-exploitation', days: 3, category: 'Exploitation' },
  { id: 14, title: 'Buffer Overflow Basics',        desc: 'Stack smashing, EIP control, shellcode, NOP sleds, ASLR bypass', days: 4, category: 'Exploitation' },
  { id: 15, title: 'Active Directory Attacks',      desc: 'Kerberoasting, AS-REP roasting, Pass-the-Hash, BloodHound', days: 4, category: 'Exploitation' },
  { id: 16, title: 'Network Scanning & Recon',     desc: 'Nmap, Masscan, Shodan, banner grabbing, OS fingerprinting', days: 2, category: 'Recon' },
  { id: 17, title: 'OSINT Techniques',              desc: 'Google dorking, Maltego, theHarvester, WHOIS, certificate transparency', days: 2, category: 'Recon' },
  { id: 18, title: 'Password Cracking',             desc: 'Hashcat, John the Ripper, wordlists, rule-based attacks, rainbow tables', days: 2, category: 'Recon' },
  { id: 19, title: 'Reverse Engineering Basics',   desc: 'Ghidra, strings, ltrace/strace, file format analysis, patching', days: 3, category: 'Reverse Engineering' },
  { id: 20, title: 'Binary Exploitation (PWN)',    desc: 'ret2libc, format strings, heap basics, pwntools workflow', days: 4, category: 'Reverse Engineering' },
  { id: 21, title: 'Malware Analysis Fundamentals',desc: 'Static vs dynamic analysis, sandbox, YARA rules, IOC extraction', days: 3, category: 'Blue Team' },
  { id: 22, title: 'SIEM & Log Analysis',           desc: 'Splunk/ELK basics, log correlation, alert tuning, threat hunting', days: 3, category: 'Blue Team' },
  { id: 23, title: 'Incident Response',             desc: 'IR lifecycle, containment, forensic imaging, chain of custody', days: 2, category: 'Blue Team' },
  { id: 24, title: 'Firewall & IDS/IPS',            desc: 'iptables, pfSense, Snort/Suricata rules, WAF evasion', days: 2, category: 'Blue Team' },
  { id: 25, title: 'Docker & Container Security',  desc: 'Container escapes, image scanning, Kubernetes misconfigs, Trivy', days: 2, category: 'Cloud' },
  { id: 26, title: 'AWS Cloud Security',            desc: 'IAM misconfig, S3 buckets, CloudTrail, SSRF to metadata, Pacu', days: 3, category: 'Cloud' },
  { id: 27, title: 'CTF Methodology',               desc: 'Recon flow, steganography, crypto challenges, OSINT challenges', days: 2, category: 'CTF' },
  { id: 28, title: 'Forensics & Steganography',    desc: 'binwalk, exiftool, volatility, network forensics, hidden data', days: 2, category: 'CTF' },
  { id: 29, title: 'Scripting for Hackers',         desc: 'Python exploit scripts, bash automation, pwntools, requests + BeautifulSoup', days: 3, category: 'CTF' },
  { id: 30, title: 'Bug Bounty Workflow',            desc: 'Scope review, recon automation, report writing, disclosure process', days: 3, category: 'Career' },
];

const QUIZZES = [
  // Topic 1 – Networking
  { id: 'q1a', topic_id: 1, question: 'Which OSI layer is responsible for logical addressing (IP addresses)?', opts: ['Layer 2 – Data Link','Layer 3 – Network','Layer 4 – Transport','Layer 7 – Application'], correct: 1, explanation: 'The Network layer (Layer 3) handles logical addressing via IP. Layer 2 uses MAC addresses.' },
  { id: 'q1b', topic_id: 1, question: 'What is the subnet mask for a /24 CIDR block?', opts: ['255.255.0.0','255.255.255.128','255.255.255.0','255.0.0.0'], correct: 2, explanation: '/24 means 24 bits are network bits, leaving 8 host bits. That maps to 255.255.255.0.' },
  // Topic 2 – Linux
  { id: 'q2a', topic_id: 2, question: 'What does `chmod 755 file.sh` do?', opts: ['Owner: rwx, Group: r-x, Others: r-x','Owner: rwx, Group: rwx, Others: rwx','Owner: r-x, Group: r-x, Others: r-x','Owner: rw-, Group: r--, Others: r--'], correct: 0, explanation: '7=rwx (owner), 5=r-x (group), 5=r-x (others). The owner can read, write, and execute.' },
  { id: 'q2b', topic_id: 2, question: 'Which command lists all running processes with their PIDs?', opts: ['ls -la','ps aux','top -d','netstat -tulpn'], correct: 1, explanation: '`ps aux` lists all processes with user, PID, CPU, memory and command columns.' },
  // Topic 4 – Crypto
  { id: 'q4a', topic_id: 4, question: 'SHA-256 is a:', opts: ['Symmetric cipher','Asymmetric cipher','Cryptographic hash function','Key exchange protocol'], correct: 2, explanation: 'SHA-256 is a one-way hash function — it produces a fixed 256-bit digest and cannot be reversed.' },
  { id: 'q4b', topic_id: 4, question: 'Which protocol provides forward secrecy by generating ephemeral session keys?', opts: ['RSA key exchange','Static Diffie-Hellman','Ephemeral ECDH (ECDHE)','MD5 HMAC'], correct: 2, explanation: 'ECDHE generates a fresh key pair per session, so compromising the long-term key does not expose past sessions.' },
  // Topic 5 – Web
  { id: 'q5a', topic_id: 5, question: 'Which HTTP status code means "resource not found"?', opts: ['200','301','403','404'], correct: 3, explanation: '404 Not Found means the server could not locate the requested resource.' },
  { id: 'q5b', topic_id: 5, question: 'What does the Secure flag on a cookie do?', opts: ['Encrypts the cookie value','Prevents JavaScript from reading the cookie','Ensures the cookie is only sent over HTTPS','Makes the cookie expire after the session ends'], correct: 2, explanation: 'The Secure flag tells the browser to only transmit the cookie over encrypted (HTTPS) connections.' },
  // Topic 6 – SQLi
  { id: 'q6a', topic_id: 6, question: "In a UNION-based SQL injection, what must match between the original query and injected query?", opts: ['Table names','Number and type of columns','Database user privileges','HTTP method'], correct: 1, explanation: 'UNION requires both SELECT statements to have the same number of columns with compatible data types.' },
  { id: 'q6b', topic_id: 6, question: "Which SQLi technique infers data by observing whether a page behaves differently based on a true/false condition?", opts: ['Union-based','Error-based','Boolean-based blind','Time-based blind'], correct: 2, explanation: 'Boolean-based blind SQLi sends conditions like 1=1 vs 1=2 and observes differences in the response.' },
  // Topic 7 – XSS
  { id: 'q7a', topic_id: 7, question: 'Which type of XSS is stored in the application\'s database and delivered to victims on subsequent requests?', opts: ['Reflected XSS','DOM-based XSS','Stored (Persistent) XSS','Self-XSS'], correct: 2, explanation: 'Stored XSS persists in the server\'s database (e.g., in a comment field) and executes for every user who views it.' },
  // Topic 11 – Linux PrivEsc
  { id: 'q11a', topic_id: 11, question: 'A SUID binary runs with whose privileges?', opts: ['The calling user\'s privileges','Root\'s privileges always','The file owner\'s privileges','The group\'s privileges'], correct: 2, explanation: 'SUID (Set User ID) causes the program to execute with the privileges of the file\'s owner, not the calling user.' },
  // Topic 15 – AD
  { id: 'q15a', topic_id: 15, question: 'Kerberoasting targets service accounts by requesting:', opts: ['NTLM hashes','AS-REP responses','TGS tickets encrypted with the service account\'s password hash','Kerberos TGTs for all users'], correct: 2, explanation: 'Kerberoasting requests TGS tickets for SPNs. The ticket is encrypted with the service account\'s hash and can be cracked offline.' },
  // Topic 18 – Password
  { id: 'q18a', topic_id: 18, question: 'Which Hashcat attack mode uses a wordlist combined with rule-based mutations?', opts: ['Mode 0 – Straight','Mode 1 – Combination','Mode 3 – Brute-Force','Mode 6 – Hybrid Wordlist + Mask'], correct: 3, explanation: 'Mode 6 takes a wordlist and appends a mask (e.g., word + ?d?d) to generate variants. Mode 0 with -r rules is also common.' },
];

const TUTOR_HINTS = {
  1:  ['Think about the 7-layer model: each layer has a specific job.', 'ARP resolves IP to MAC — which layer handles each?', 'Subnetting: borrow host bits to create network segments.'],
  2:  ['Try `man <command>` to read the manual for any command.', 'File permissions: think of rwx as binary 111 = 7.', 'Use `sudo -l` to list what commands a user can run with sudo.'],
  3:  ['Apply a display filter like `http` or `tcp.port==80` to reduce noise.', 'Right-click a packet → Follow TCP Stream to see full conversation.', 'The "Statistics > Protocol Hierarchy" view shows traffic breakdown.'],
  4:  ['Symmetric = same key for encrypt/decrypt. Asymmetric = public/private pair.', 'Hashing is one-way — you cannot reverse SHA-256.', 'TLS handshake: client hello → server hello → key exchange → finished.'],
  5:  ['Use browser DevTools → Network tab to inspect HTTP requests/responses.', 'Check for sensitive data in cookies, local storage, and session tokens.', 'The `Host` header tells the server which virtual host to serve.'],
  6:  ['Try a simple test first: append a single quote `\'` and observe the error.', 'UNION SELECT: match the column count with NULL placeholders first.', 'Use `--dbs` with SQLMap to enumerate databases after confirming injection.'],
  7:  ['XSS goal: get `alert(1)` or `document.cookie` to execute in victim\'s browser.', 'Try `<script>alert(1)</script>` — if filtered, try `<img src=x onerror=alert(1)>`.', 'DOM XSS: look for `document.write`, `innerHTML`, and `eval` with user input.'],
  8:  ['Check if there\'s account lockout — if not, brute force is possible.', 'JWT: base64-decode the header and payload; look for `alg: none` vulnerability.', 'Test for username enumeration: do invalid username vs invalid password give different errors?'],
  9:  ['Burp Proxy: set your browser proxy to 127.0.0.1:8080 and trust Burp\'s CA cert.', 'Intruder: use "Sniper" mode for single-parameter fuzzing.', 'Right-click any request → "Send to Repeater" to tweak and resend.'],
  10: ['IDOR: change a numeric ID in the URL/body and see if you get another user\'s data.', 'Try changing `user_id=1` to `user_id=2` — do you see someone else\'s profile?', 'Also test with encoded IDs (base64, UUID) — decode, modify, re-encode.'],
  11: ['Run `sudo -l` first — any NOPASSWD commands?', 'Check `find / -perm -4000 2>/dev/null` for SUID binaries — cross-reference GTFOBins.', 'Look at cron jobs in /etc/cron* — are any scripts writable?'],
  12: ['Run `whoami /priv` — look for SeImpersonatePrivilege or SeDebugPrivilege.', 'Check `AlwaysInstallElevated` registry key on both HKCU and HKLM.', 'Unquoted service paths + writable directories = instant PrivEsc.'],
  13: ['`use exploit/...` → `show options` → `set RHOSTS` → `run`.', 'After a shell: `background` saves the session; `sessions -l` lists all.', 'Meterpreter: `getsystem` tries auto-privilege escalation.'],
  14: ['Find the offset first: use `cyclic` (pwntools) or `pattern_create` (Metasploit).', 'Overwrite EIP with the address of a `JMP ESP` gadget from the binary or DLL.', 'NOP sled before shellcode gives the instruction pointer a landing zone.'],
  15: ['BloodHound + SharpHound: collect AD data, visualize attack paths visually.', 'Kerberoasting: `GetUserSPNs.py domain/user:pass -dc-ip <IP>` → crack the TGS hash offline.', 'Pass-the-Hash with `evil-winrm -u admin -H <NTLM_hash> -i <IP>`.'],
  16: ['Start with `nmap -sV -sC -p- <target>` for full port scan with service detection.', '`-oA` saves output in all formats (nmap, gnmap, xml) simultaneously.', 'Shodan: `hostname:<company>.com` or `org:<company>` to find internet-facing assets.'],
  17: ['Google dork: `site:example.com filetype:pdf` finds PDFs on a specific domain.', 'theHarvester: `theHarvester -d example.com -b all` for email, subdomain recon.', 'Certificate Transparency: `crt.sh/?q=%.example.com` reveals all issued certs.'],
  18: ['Identify hash type first: `hashcat --example-hashes | grep -i md5`.', 'Rule-based attack: `hashcat -a 0 -r rules/best64.rule hash.txt wordlist.txt`.', 'Always try `rockyou.txt` first, then `SecLists/Passwords/Common-Credentials`.'],
  19: ['`strings binary | grep -i flag` is always worth trying first.', 'In Ghidra: Functions window → look for `main`. Double-click to decompile.', '`ltrace ./binary` shows library calls (strcmp, malloc); `strace` shows syscalls.'],
  20: ['Find offset with pwntools `cyclic(200)`, run, get crash offset with `cyclic_find(eip_val)`.', '`ret2libc`: leak libc address via puts/printf, calculate system() offset, call with `/bin/sh`.', 'Format string: `%p %p %p` leaks stack; `%n` writes to memory.'],
  21: ['Static: `strings`, `file`, `hexdump`, `objdump` — no execution needed.', 'Dynamic: run in a sandbox (Cuckoo, ANY.RUN), monitor API calls, network traffic.', 'YARA: write rules matching strings/byte patterns to detect malware families.'],
  22: ['Splunk SPL: `index=main sourcetype=syslog "failed password" | stats count by src_ip`.', 'Look for high-frequency events from a single IP (brute force pattern).', 'ELK: Kibana Discover → add filters; build a dashboard for repeated event types.'],
  23: ['IR phases: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned.', 'Preserve evidence first — image the disk before cleaning anything.', 'Check Prefetch, event logs (4624, 4625, 4648), and registry Run keys for persistence.'],
  24: ['iptables: `iptables -A INPUT -p tcp --dport 22 -j ACCEPT` allows SSH.', 'Snort rule: `alert tcp any any -> $HOME_NET 80 (msg:"HTTP scan"; flags:S; sid:1001;)`.', 'WAF bypass: try URL encoding, case variation, comment insertion in payloads.'],
  25: ['Escape: `docker run --privileged` is dangerous — the container can mount the host FS.', 'Check if the socket `/var/run/docker.sock` is mounted inside the container.', '`trivy image <image>:latest` scans for CVEs in layers.'],
  26: ['IAM: use `aws iam get-account-authorization-details` to dump all policies.', 'S3: `aws s3 ls s3://bucket-name --no-sign-request` tests public access.', 'SSRF to `http://169.254.169.254/latest/meta-data/iam/security-credentials/` leaks creds.'],
  27: ['Recon: file type, encoding, possible hints in challenge name.', 'Crypto challenges: identify cipher type (Caesar, Vigenère, RSA, XOR) then find key.', 'OSINT: check image metadata, reverse image search, username pivoting.'],
  28: ['`binwalk -e file` extracts embedded files. `file` and `xxd` are always first.', '`exiftool image.jpg` dumps metadata that may contain flags.', 'Volatility: `vol.py -f memory.dmp imageinfo` → `pslist`, `cmdline`, `filescan`.'],
  29: ['`requests.get(url).text` fetches a page; BeautifulSoup parses HTML.', 'pwntools: `from pwn import *; r = remote("host", port); r.sendlineafter(">", payload)`.', 'Automate recon: loop Nmap output, parse open ports, run targeted scans.'],
  30: ['Read the scope carefully — out-of-scope findings will be ignored or penalized.', 'Report structure: Vulnerability Title → Severity → Steps to Reproduce → Impact → Remediation.', 'Use Burp Collaborator/interactsh for SSRF/blind injection proof-of-concept.'],
};

window.ROADMAP_TOPICS  = ROADMAP_TOPICS;
window.QUIZZES         = QUIZZES;
window.TUTOR_HINTS     = TUTOR_HINTS;

async function seedDatabase() {
  const isFirst = await CFC_DB.isFirstLaunch();
  if (!isFirst) return;

  console.log('[CFC] First launch — seeding database…');

  // Default user
  const userId = CFC_DB.uid();
  await CFC_DB.put('users', {
    id: userId,
    name: 'Hacker',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    daily_target_minutes: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Default settings
  await CFC_DB.put('settings', {
    id: CFC_DB.uid(),
    user_id: userId,
    camera_enabled: false,
    screen_capture_enabled: false,
    focus_threshold: 50,
    idle_threshold_seconds: 30,
    grace_period_seconds: 10,
    privacy_mode: false,
    created_at: new Date().toISOString(),
  });

  // Streak record
  await CFC_DB.put('streaks', {
    id: CFC_DB.uid(),
    user_id: userId,
    current_streak_days: 0,
    best_streak_days: 0,
    last_active_date: null,
    updated_at: new Date().toISOString(),
  });

  // Roadmap topics
  for (const topic of ROADMAP_TOPICS) {
    await CFC_DB.put('roadmap_topics', {
      id: topic.id,
      title: topic.title,
      description: topic.desc,
      sequence_order: topic.id,
      prerequisite_topic_id: topic.id > 1 ? topic.id - 1 : null,
      estimated_days: topic.days,
      is_locked: topic.id > 1,  // Only first topic is unlocked by default
      is_completed: false,
      category: topic.category,
    });
  }

  // Quizzes
  for (const q of QUIZZES) {
    await CFC_DB.put('quizzes', {
      id: q.id,
      topic_id: q.topic_id,
      question: q.question,
      option_a: q.opts[0],
      option_b: q.opts[1],
      option_c: q.opts[2],
      option_d: q.opts[3],
      correct_option: q.correct,
      explanation: q.explanation,
    });
  }

  console.log('[CFC] Database seeded ✓');
  return userId;
}

window.seedDatabase = seedDatabase;
