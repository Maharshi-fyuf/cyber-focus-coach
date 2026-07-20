-- Cyber Focus Coach: Database Seed

-- 1. Default User
INSERT OR IGNORE INTO users (id, name, timezone, daily_target_minutes, created_at, updated_at) 
VALUES ('default-user-id-001', 'Agent', 'UTC', 60, datetime('now'), datetime('now'));

-- 2. Default Settings
INSERT OR IGNORE INTO settings (id, user_id, camera_enabled, screen_capture_enabled, focus_threshold, idle_threshold_seconds, grace_period_seconds, privacy_mode, created_at)
VALUES ('default-settings-id-001', 'default-user-id-001', 0, 0, 50, 30, 10, 0, datetime('now'));

-- 3. Default Streaks
INSERT OR IGNORE INTO streaks (id, user_id, current_streak_days, best_streak_days, last_active_date, updated_at)
VALUES ('default-streaks-id-001', 'default-user-id-001', 0, 0, NULL, datetime('now'));

-- 4. Roadmap Topics (30 Modules)
INSERT OR IGNORE INTO roadmap_topics (id, title, description, category, sequence_order, prerequisite_topic_id, estimated_days, is_locked) VALUES
(1, 'Introduction to Cyber Security', 'Core concepts: CIA triad, authentication vs authorization, threat actors.', 'Foundations', 1, NULL, 1, 0),
(2, 'Networking Fundamentals', 'OSI model, TCP/IP, DNS, HTTP/S, common ports.', 'Foundations', 2, 1, 2, 1),
(3, 'Linux Basics', 'Command line, file permissions, basic bash scripting, SSH.', 'Foundations', 3, 1, 2, 1),
(4, 'Windows Internals', 'Active Directory basics, Registry, Windows event logs, PowerShell.', 'Foundations', 4, 1, 2, 1),
(5, 'Cryptography Basics', 'Symmetric vs Asymmetric, hashing, salts, digital signatures, certificates.', 'Foundations', 5, 2, 3, 1),
(6, 'Web Application Architecture', 'Frontend vs Backend, APIs, databases, sessions vs tokens.', 'Web Security', 6, 2, 2, 1),
(7, 'OWASP Top 10 Overview', 'Introduction to the most critical web application security risks.', 'Web Security', 7, 6, 1, 1),
(8, 'SQL Injection (SQLi)', 'Understanding and preventing SQL injection attacks.', 'Web Security', 8, 7, 2, 1),
(9, 'Cross-Site Scripting (XSS)', 'Reflected, Stored, and DOM-based XSS mechanisms and prevention.', 'Web Security', 9, 7, 2, 1),
(10, 'Cross-Site Request Forgery (CSRF)', 'How CSRF works and mitigation strategies (Anti-CSRF tokens, SameSite).', 'Web Security', 10, 7, 1, 1),
(11, 'Authentication & Session Flaws', 'Broken authentication, JWT vulnerabilities, session fixation.', 'Web Security', 11, 7, 2, 1),
(12, 'Insecure Direct Object References (IDOR)', 'Understanding access control failures.', 'Web Security', 12, 7, 1, 1),
(13, 'Network Scanning & Reconnaissance', 'Using Nmap, OSINT techniques, DNS enumeration.', 'Network Security', 13, 2, 2, 1),
(14, 'Vulnerability Scanning', 'Nessus, OpenVAS, interpreting scan results.', 'Network Security', 14, 13, 2, 1),
(15, 'Firewalls & Intrusion Detection (IDS/IPS)', 'Rules, Snort, Suricata, WAFs.', 'Network Security', 15, 2, 2, 1),
(16, 'Wireless Security', 'WEP/WPA/WPA2/WPA3, Evil Twin attacks, rogue access points.', 'Network Security', 16, 2, 1, 1),
(17, 'Malware Analysis Basics', 'Static vs dynamic analysis, sandboxing, packed executables.', 'Threats & Defenses', 17, 4, 3, 1),
(18, 'Phishing & Social Engineering', 'Email headers, SPF/DKIM/DMARC, psychological manipulation.', 'Threats & Defenses', 18, 1, 1, 1),
(19, 'Endpoint Protection', 'Antivirus vs EDR, host-based firewalls, sysmon.', 'Threats & Defenses', 19, 4, 2, 1),
(20, 'Identity & Access Management (IAM)', 'SSO, SAML, OAuth, Multi-Factor Authentication (MFA).', 'Enterprise Security', 20, 5, 2, 1),
(21, 'Cloud Security Basics', 'Shared responsibility model, AWS/Azure IAM, misconfigured storage buckets.', 'Enterprise Security', 21, 20, 3, 1),
(22, 'Incident Response Pipeline', 'Preparation, identification, containment, eradication, recovery, lessons learned.', 'Security Operations', 22, 1, 2, 1),
(23, 'Log Analysis & SIEM', 'Splunk, ELK stack, writing detection rules.', 'Security Operations', 23, 22, 3, 1),
(24, 'Digital Forensics Fundamentals', 'Chain of custody, disk imaging, memory forensics volatility.', 'Security Operations', 24, 22, 3, 1),
(25, 'Penetration Testing Frameworks', 'Metasploit, Cobalt Strike, red team methodologies.', 'Offensive Security', 25, 14, 3, 1),
(26, 'Privilege Escalation', 'Linux SUID, Windows misconfigurations, token impersonation.', 'Offensive Security', 26, 25, 3, 1),
(27, 'Buffer Overflows (Intro)', 'Stack architecture, registers, overwriting EIP.', 'Offensive Security', 27, 3, 4, 1),
(28, 'Secure Coding Practices', 'Input validation, parameterized queries, least privilege.', 'DevSecOps', 28, 6, 2, 1),
(29, 'CI/CD Pipeline Security', 'SAST, DAST, secret scanning in Git, supply chain attacks.', 'DevSecOps', 29, 28, 2, 1),
(30, 'Compliance & Risk Management', 'GDPR, HIPAA, PCI-DSS, risk assessments, SOC 2.', 'Governance', 30, 1, 2, 1);

-- 5. Sample Quizzes for Topic 1
INSERT OR IGNORE INTO quizzes (id, topic_id, question, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
('q1_1', 1, 'Which component of the CIA triad ensures that data is not altered by unauthorized individuals?', 'Confidentiality', 'Integrity', 'Availability', 'Authentication', 1, 'Integrity guarantees that data has not been tampered with or altered.'),
('q1_2', 1, 'What is the primary difference between Authentication and Authorization?', 'Authentication proves who you are; Authorization determines what you can do.', 'Authentication is for systems; Authorization is for users.', 'They are the exact same thing.', 'Authentication determines what you can do; Authorization proves who you are.', 0, 'Authentication verifies identity (e.g., password). Authorization verifies permissions (e.g., admin access).');
