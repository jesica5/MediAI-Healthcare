/**
 * MediAI Centralized JavaScript API Client Module
 * Provides unified fetch wrappers, auth state, and clinical calculators.
 */

const API_BASE = '/api/v1';

const MediAPI = {
  // Authentication & Token Management
  auth: {
    getToken() {
      return localStorage.getItem('mediai_staff_token');
    },
    setToken(token) {
      if (token) localStorage.setItem('mediai_staff_token', token);
      else localStorage.removeItem('mediai_staff_token');
    },
    getUser() {
      const u = localStorage.getItem('mediai_staff_user');
      return u ? JSON.parse(u) : null;
    },
    setUser(user) {
      if (user) localStorage.setItem('mediai_staff_user', JSON.stringify(user));
      else localStorage.removeItem('mediai_staff_user');
    },
    async signIn(email, password) {
      const res = await MediAPI.request('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.data) {
        MediAPI.auth.setToken(res.data.token);
        MediAPI.auth.setUser(res.data.user);
      }
      return res;
    },
    async loginStep1(email, password) {
      return MediAPI.request('/auth/login-step1', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    async verifyOtp(tempToken, otp) {
      const res = await MediAPI.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ temp_token: tempToken, otp })
      });
      if (res.data) {
        MediAPI.auth.setToken(res.data.token);
        MediAPI.auth.setUser(res.data.user);
      }
      return res;
    },
    async resendOtp(tempToken) {
      return MediAPI.request('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ temp_token: tempToken })
      });
    },
    signOut() {
      MediAPI.auth.setToken(null);
      MediAPI.auth.setUser(null);
      window.location.href = '/signin.html';
    }
  },

  // HTTP Request Helper
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = MediAPI.auth.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const user = MediAPI.auth.getUser();
    if (user && user.role) {
      headers['x-user-role'] = user.role;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.error?.message || `Server error (${response.status})`;
        const errorObj = new Error(errorMsg);
        errorObj.code = json?.error?.code || 'HTTP_ERROR';
        errorObj.details = json?.error?.details || [];
        errorObj.status = response.status;
        throw errorObj;
      }

      return json;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Patients API
  patients: {
    register(payload) {
      return MediAPI.request('/patients', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    getMe() {
      return MediAPI.request('/patients/me');
    },
    getById(id) {
      return MediAPI.request(`/patients/${id}`);
    }
  },

  // Triage Engine API
  triage: {
    assess(payload) {
      return MediAPI.request('/triage/assess', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  },

  // AI Risk Prediction API
  ai: {
    predictRisk(payload) {
      return MediAPI.request('/ai/risk-prediction', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  },

  // Doctor Emergency Workstation API
  doctor: {
    getQueue(filter = {}) {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.search) params.append('search', filter.search);
      return MediAPI.request(`/doctor/queue?${params.toString()}`);
    },
    getPatientAssessment(id) {
      return MediAPI.request(`/doctor/patient/${id}`);
    },
    submitOverride(payload) {
      return MediAPI.request('/doctor/override', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    getMetrics() {
      return MediAPI.request('/doctor/metrics');
    },
    getAnalytics() {
      return MediAPI.request('/doctor/analytics');
    },
    getMedications(patientId) {
      const q = patientId ? `?patientId=${patientId}` : '';
      return MediAPI.request(`/doctor/medications${q}`);
    }
  },

  // Clinical Calculators & Validation
  clinical: {
    /**
     * Phase 7: Dynamic Age Calculation from Date of Birth
     * Calculates completed years using day and month.
     * Example: DOB 15-Oct-2005 on 12-Oct-2026 -> 20 years.
     */
    calculateAge(dobString, referenceDate = new Date()) {
      if (!dobString) return null;
      const dob = new Date(dobString);
      if (isNaN(dob.getTime())) return null;

      const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
      if (dob > ref) return null; // Future DOB invalid

      let age = ref.getFullYear() - dob.getFullYear();
      const monthDiff = ref.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    },

    /**
     * Phase 8: Clinical Measurement Ranges & Validation
     */
    validateVitals(vitals) {
      const errors = {};

      // Heart Rate: 20 - 300 bpm
      if (vitals.heartRate !== null && vitals.heartRate !== undefined && vitals.heartRate !== '') {
        const val = Number(vitals.heartRate);
        if (isNaN(val) || val < 20 || val > 300) {
          errors.heartRate = 'Heart rate must be between 20 and 300 bpm';
        }
      }

      // Respiratory Rate: 4 - 80 breaths/min
      if (vitals.respiratoryRate !== null && vitals.respiratoryRate !== undefined && vitals.respiratoryRate !== '') {
        const val = Number(vitals.respiratoryRate);
        if (isNaN(val) || val < 4 || val > 80) {
          errors.respiratoryRate = 'Respiratory rate must be between 4 and 80 breaths/min';
        }
      }

      // Systolic BP: 40 - 300 mmHg
      if (vitals.systolicBp !== null && vitals.systolicBp !== undefined && vitals.systolicBp !== '') {
        const val = Number(vitals.systolicBp);
        if (isNaN(val) || val < 40 || val > 300) {
          errors.systolicBp = 'Systolic BP must be between 40 and 300 mmHg';
        }
      }

      // Diastolic BP: 20 - 200 mmHg
      if (vitals.diastolicBp !== null && vitals.diastolicBp !== undefined && vitals.diastolicBp !== '') {
        const val = Number(vitals.diastolicBp);
        if (isNaN(val) || val < 20 || val > 200) {
          errors.diastolicBp = 'Diastolic BP must be between 20 and 200 mmHg';
        }
      }

      // Logical BP Constraint: Diastolic must be lower than Systolic
      if (vitals.systolicBp && vitals.diastolicBp) {
        const s = Number(vitals.systolicBp);
        const d = Number(vitals.diastolicBp);
        if (!isNaN(s) && !isNaN(d) && d >= s) {
          errors.diastolicBp = 'Diastolic BP must be lower than Systolic BP';
        }
      }

      // Oxygen Saturation: 40.0 - 100.0 %
      if (vitals.oxygenSaturation !== null && vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation !== '') {
        const val = Number(vitals.oxygenSaturation);
        if (isNaN(val) || val < 40.0 || val > 100.0) {
          errors.oxygenSaturation = 'SpO2 must be between 40.0% and 100.0%';
        }
      }

      // Temperature: 30.0 - 45.0 C
      if (vitals.temperatureCelsius !== null && vitals.temperatureCelsius !== undefined && vitals.temperatureCelsius !== '') {
        const val = Number(vitals.temperatureCelsius);
        if (isNaN(val) || val < 30.0 || val > 45.0) {
          errors.temperatureCelsius = 'Body temperature must be between 30.0°C and 45.0°C';
        }
      }

      // Capillary Blood Glucose (Optional): 10.0 - 1000.0 mg/dL
      if (vitals.capillaryBloodGlucose !== null && vitals.capillaryBloodGlucose !== undefined && vitals.capillaryBloodGlucose !== '') {
        const val = Number(vitals.capillaryBloodGlucose);
        if (isNaN(val) || val < 10.0 || val > 1000.0) {
          errors.capillaryBloodGlucose = 'Blood glucose must be between 10.0 and 1000.0 mg/dL';
        }
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }
  },

  // Feature 2: Notifications & Clinical Alerts API
  notifications: {
    getAll(role = 'ALL') {
      return MediAPI.request(`/notifications?role=${encodeURIComponent(role)}`);
    },
    getUnreadCount(role = 'ALL') {
      return MediAPI.request(`/notifications/unread-count?role=${encodeURIComponent(role)}`);
    },
    markAsRead(id) {
      return MediAPI.request(`/notifications/${id}/read`, { method: 'PUT' });
    },
    markAllAsRead() {
      return MediAPI.request('/notifications/read-all', { method: 'PUT' });
    }
  },

  // Feature 4: User Feedback & Ratings API
  feedback: {
    submit(payload) {
      return MediAPI.request('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    getSummary() {
      return MediAPI.request('/feedback/summary');
    }
  },

  // Feature 1: Web Speech API Voice Recognition Helper
  voice: {
    isSupported() {
      return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    },
    createRecognizer(options = {}) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return null;
      const recognizer = new SpeechRecognition();
      recognizer.continuous = options.continuous || false;
      recognizer.interimResults = options.interimResults || false;
      // Default to Tamil if Tamil mode is selected in UI, otherwise English
      const lang = options.lang || (window.MediI18N && MediI18N.getLanguage() === 'ta' ? 'ta-IN' : 'en-US');
      recognizer.lang = lang;
      return recognizer;
    }
  },

  // Global Notification Bell Navigation Injector (Preserves existing navbar layout)
  initNotifications() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions || document.getElementById('notifBellBtn')) return;

    // Create Notification Bell Container
    const bellWrapper = document.createElement('div');
    bellWrapper.style.position = 'relative';
    bellWrapper.style.display = 'inline-flex';
    bellWrapper.style.alignItems = 'center';
    bellWrapper.id = 'notifWrapper';

    bellWrapper.innerHTML = `
      <button id="notifBellBtn" class="btn btn-outline btn-sm" title="Clinical Notifications" style="padding: 0.4rem 0.65rem; display: inline-flex; align-items: center; gap: 0.35rem; position: relative;">
        <span style="font-size: 1rem;">🔔</span>
        <span id="notifBadge" style="display: none; background: #ef4444; color: #fff; font-size: 0.6875rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 9999px; line-height: 1;">0</span>
      </button>

      <!-- Dropdown Drawer -->
      <div id="notifDropdown" style="display: none; position: absolute; right: 0; top: calc(100% + 0.5rem); width: 340px; background: var(--card-bg, #1e293b); border: 1px solid var(--border-subtle, #334155); border-radius: 0.75rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); z-index: 1000; overflow: hidden;">
        <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-subtle, #334155); display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-primary, #f8fafc); display: flex; align-items: center; gap: 0.35rem;">
            <span>🔔</span> <span>Clinical Alerts</span>
          </div>
          <button id="notifMarkAllReadBtn" style="background: none; border: none; font-size: 0.75rem; color: #38bdf8; cursor: pointer; text-decoration: underline;">Mark all read</button>
        </div>
        <div id="notifList" style="max-height: 280px; overflow-y: auto; padding: 0.5rem 0;">
          <div style="padding: 1rem; text-align: center; color: var(--text-muted, #94a3b8); font-size: 0.75rem;">Loading alerts...</div>
        </div>
      </div>
    `;

    navActions.insertBefore(bellWrapper, navActions.firstChild);

    const btn = document.getElementById('notifBellBtn');
    const dropdown = document.getElementById('notifDropdown');
    const markAllBtn = document.getElementById('notifMarkAllReadBtn');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      if (dropdown.style.display === 'block') {
        MediAPI.refreshNotifications();
      }
    });

    document.addEventListener('click', (e) => {
      if (!bellWrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    markAllBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await MediAPI.notifications.markAllAsRead();
        await MediAPI.refreshNotifications();
      } catch (err) {}
    });

    // Initial load and periodic refresh
    MediAPI.refreshNotifications();
    setInterval(MediAPI.refreshNotifications, 30000);
  },

  async refreshNotifications() {
    try {
      const user = MediAPI.auth.getUser();
      const role = user?.role ? (user.role.toUpperCase().includes('DOCTOR') ? 'DOCTOR' : (user.role.toUpperCase().includes('NURSE') ? 'NURSE' : 'ALL')) : 'ALL';
      const res = await MediAPI.notifications.getAll(role);
      const list = res.data || [];
      const unread = list.filter(n => !n.isRead).length;

      const badge = document.getElementById('notifBadge');
      if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'inline-block' : 'none';
      }

      const container = document.getElementById('notifList');
      if (container && document.getElementById('notifDropdown').style.display === 'block') {
        if (list.length === 0) {
          container.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted, #94a3b8); font-size: 0.8125rem;">No notifications at this time.</div>';
          return;
        }

        container.innerHTML = list.slice(0, 15).map(n => {
          const priorityColor = n.priority === 'CRITICAL' ? '#ef4444' : (n.priority === 'HIGH' ? '#f59e0b' : '#38bdf8');
          const unreadDot = !n.isRead ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${priorityColor}; display: inline-block;"></span>` : '';
          return `
            <div style="padding: 0.65rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); background: ${!n.isRead ? 'rgba(56, 189, 248, 0.05)' : 'transparent'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <strong style="font-size: 0.8125rem; color: var(--text-primary, #f8fafc);">${n.title}</strong>
                ${unreadDot}
              </div>
              <p style="font-size: 0.75rem; color: var(--text-secondary, #cbd5e1); margin: 0.25rem 0; line-height: 1.4;">${n.message}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
                <span style="font-size: 0.6875rem; color: var(--text-muted, #94a3b8);">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                ${!n.isRead ? `<button onclick="MediAPI.markNotificationRead('${n.id}', event)" style="background: none; border: none; font-size: 0.6875rem; color: #38bdf8; cursor: pointer;">Mark read</button>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {}
  },

  async markNotificationRead(id, e) {
    if (e) e.stopPropagation();
    try {
      await MediAPI.notifications.markAsRead(id);
      await MediAPI.refreshNotifications();
    } catch (err) {}
  },

  // Feature: Chatbot API Client
  chat: {
    sendMessage(message, language = 'en', conversationId = null) {
      return MediAPI.request('/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          message,
          language,
          conversation_id: conversationId,
          user_role: MediAPI.auth.getUser()?.role || 'PATIENT'
        })
      });
    },
    getHistory(conversationId) {
      return MediAPI.request(`/chat/history/${encodeURIComponent(conversationId)}`);
    },
    clearHistory(conversationId) {
      return MediAPI.request(`/chat/history/${encodeURIComponent(conversationId)}`, {
        method: 'DELETE'
      });
    }
  },

  // Feature: Clinical Chatbot Floating Widget Injector
  initChatbot() {
    if (typeof document === 'undefined' || document.getElementById('mediaiChatbotLauncher')) return;

    let chatLang = (window.MediI18N && MediI18N.getLanguage() === 'ta') ? 'ta' : 'en';
    let convId = sessionStorage.getItem('mediai_chat_conv_id');
    if (!convId) {
      convId = 'conv_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('mediai_chat_conv_id', convId);
    }

    // 1. Floating Launcher Button
    const launcher = document.createElement('div');
    launcher.id = 'mediaiChatbotLauncher';
    launcher.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9998;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    launcher.innerHTML = `
      <div id="chatbotTooltip" style="display: none; background: rgba(15, 23, 42, 0.95); color: #e2e8f0; font-size: 0.75rem; padding: 0.35rem 0.75rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none; white-space: nowrap;">
        MediAI Assistant • மருத்துவர் AI
      </div>
      <button id="chatbotToggleBtn" title="MediAI Clinical Assistant" style="
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0ea5e9, #0284c7);
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 24px rgba(14, 165, 233, 0.45);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      ">
        <svg id="chatbotOpenIcon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    `;

    document.body.appendChild(launcher);

    // 2. Chatbot Dialog Drawer
    const drawer = document.createElement('div');
    drawer.id = 'mediaiChatbotDrawer';
    drawer.style.cssText = `
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 110px);
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65);
      display: none;
      flex-direction: column;
      z-index: 9999;
      overflow: hidden;
      font-family: inherit;
    `;

    drawer.innerHTML = `
      <!-- Header -->
      <div style="background: rgba(30, 41, 59, 0.85); padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(14, 165, 233, 0.2); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 1rem;">
            🩺
          </div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 700; color: #f8fafc; line-height: 1.2;">MediAI Assistant</div>
            <div style="font-size: 0.6875rem; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e; display: inline-block;"></span>
              <span id="chatLangIndicator">Clinical Triage AI (${chatLang.toUpperCase()})</span>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button id="chatLangToggle" class="btn btn-outline btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.72rem; border-color: rgba(255,255,255,0.15);">${chatLang === 'ta' ? 'EN' : 'தமிழ்'}</button>
          <button id="chatClearBtn" title="Clear chat" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; font-size: 0.8rem;">🗑️</button>
          <button id="chatCloseBtn" title="Close" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; font-size: 1.1rem; line-height: 1;">✕</button>
        </div>
      </div>

      <!-- Emergency Disclaimer -->
      <div style="background: rgba(239, 68, 68, 0.1); border-bottom: 1px solid rgba(239, 68, 68, 0.2); padding: 0.35rem 0.75rem; font-size: 0.6875rem; color: #fca5a5; display: flex; align-items: center; gap: 6px;">
        <span>⚠️</span>
        <span id="chatDisclaimerText">Decision support assistant. For medical emergencies, call 108 / 911 immediately.</span>
      </div>

      <!-- Messages Stream -->
      <div id="chatMessagesStream" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <!-- Initial Welcome Message -->
      </div>

      <!-- Suggested Chips -->
      <div id="chatChipsContainer" style="padding: 0.4rem 0.75rem; display: flex; gap: 0.35rem; overflow-x: auto; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(15, 23, 42, 0.5);">
      </div>

      <!-- Input Area -->
      <form id="chatInputForm" style="padding: 0.65rem 0.75rem; background: rgba(30, 41, 59, 0.6); border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 0.5rem;" onsubmit="event.preventDefault();">
        <button type="button" id="chatMicBtn" title="Speak symptoms (EN / தமிழ்)" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: #38bdf8; cursor: pointer;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
        </button>
        <input type="text" id="chatMessageInput" placeholder="Ask symptoms, vitals, triage..." autocomplete="off" style="
          flex: 1;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 0.45rem 0.85rem;
          color: #f8fafc;
          font-size: 0.8125rem;
          outline: none;
        ">
        <button type="submit" id="chatSendBtn" style="
          background: #0ea5e9;
          border: none;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    `;

    document.body.appendChild(drawer);

    // Event Handlers
    const toggleBtn = document.getElementById('chatbotToggleBtn');
    const closeBtn = document.getElementById('chatCloseBtn');
    const clearBtn = document.getElementById('chatClearBtn');
    const langBtn = document.getElementById('chatLangToggle');
    const inputEl = document.getElementById('chatMessageInput');
    const formEl = document.getElementById('chatInputForm');
    const streamEl = document.getElementById('chatMessagesStream');
    const chipsEl = document.getElementById('chatChipsContainer');
    const micBtn = document.getElementById('chatMicBtn');

    function toggleChat(open) {
      const isVisible = drawer.style.display === 'flex';
      const target = open !== undefined ? open : !isVisible;
      drawer.style.display = target ? 'flex' : 'none';
      if (target) {
        inputEl.focus();
        if (streamEl.children.length === 0) {
          renderWelcomeMessage();
        }
      }
    }

    toggleBtn.addEventListener('click', () => toggleChat());
    closeBtn.addEventListener('click', () => toggleChat(false));

    langBtn.addEventListener('click', () => {
      chatLang = chatLang === 'ta' ? 'en' : 'ta';
      langBtn.textContent = chatLang === 'ta' ? 'EN' : 'தமிழ்';
      document.getElementById('chatLangIndicator').textContent = `Clinical Triage AI (${chatLang.toUpperCase()})`;
      inputEl.placeholder = chatLang === 'ta' ? 'அறிகுறிகள், அளவுகள் பற்றிக் கேட்க...' : 'Ask symptoms, vitals, triage...';
      document.getElementById('chatDisclaimerText').textContent = chatLang === 'ta' 
        ? 'மருத்துவ முடிவு மாதிரி. அவசர சிகிச்சைக்கு 108 / 112 அழைக்கவும்.'
        : 'Decision support assistant. For medical emergencies, call 108 / 911 immediately.';
      renderWelcomeMessage();
    });

    clearBtn.addEventListener('click', async () => {
      try {
        await MediAPI.chat.clearHistory(convId);
      } catch (e) {}
      streamEl.innerHTML = '';
      renderWelcomeMessage();
    });

    function renderWelcomeMessage() {
      const isTa = chatLang === 'ta';
      const welcomeText = isTa
        ? "வணக்கம்! நான் உங்கள் **MediAI மருத்துவ உதவியாளர்**.\n\nகாய்ச்சல், உடல் வலி, நாடித் துடிப்பு, இரத்த அழுத்த இயல்பு நிலைகள் அல்லது மருத்துவமனை அவசர முன்னுரிமை பற்றி என்னிடம் கேட்கலாம்."
        : "Hello! I am your **MediAI Clinical Assistant**.\n\nAsk me about clinical symptoms, vital signs reference ranges, triage acuity priorities (P1-P4), or navigating your health assessment.";

      const chips = isTa
        ? ["🌡️ காய்ச்சல் வழிகாட்டல்", "📊 உடலியல் அளவுகள்", "🧭 மதிப்பீடு தொடங்கு", "🚨 அவசர உதவி"]
        : ["🌡️ Fever Guidance", "📊 Normal Vital Signs", "🧭 Start Intake", "🚨 Emergency Help"];

      appendMessage('ASSISTANT', welcomeText, false);
      renderChips(chips);
    }

    function renderChips(chips) {
      chipsEl.innerHTML = '';
      chips.forEach(chip => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = chip;
        btn.style.cssText = `
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 9999px;
          padding: 0.2rem 0.55rem;
          color: #94a3b8;
          font-size: 0.7rem;
          cursor: pointer;
          white-space: nowrap;
        `;
        btn.onmouseover = () => btn.style.color = '#38bdf8';
        btn.onmouseout = () => btn.style.color = '#94a3b8';
        btn.onclick = () => {
          inputEl.value = chip.replace(/[🌡️📊🧭🚨]/g, '').trim();
          handleSendMessage();
        };
        chipsEl.appendChild(btn);
      });
    }

    function appendMessage(sender, text, isEmergency) {
      const bubble = document.createElement('div');
      const isUser = sender === 'USER';

      bubble.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: ${isUser ? 'flex-end' : 'flex-start'};
        margin-bottom: 0.25rem;
      `;

      let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      const contentBox = document.createElement('div');
      if (isUser) {
        contentBox.style.cssText = `
          background: #0284c7;
          color: #ffffff;
          padding: 0.55rem 0.85rem;
          border-radius: 14px 14px 2px 14px;
          font-size: 0.8125rem;
          max-width: 82%;
          line-height: 1.4;
          word-break: break-word;
        `;
      } else {
        const bg = isEmergency ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 41, 59, 0.8)';
        const border = isEmergency ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.06)';
        const color = isEmergency ? '#fecaca' : '#f1f5f9';
        contentBox.style.cssText = `
          background: ${bg};
          border: ${border};
          color: ${color};
          padding: 0.65rem 0.85rem;
          border-radius: 14px 14px 14px 2px;
          font-size: 0.8125rem;
          max-width: 88%;
          line-height: 1.45;
          word-break: break-word;
        `;
      }

      contentBox.innerHTML = formattedText;
      bubble.appendChild(contentBox);

      const timeSpan = document.createElement('span');
      timeSpan.style.cssText = 'font-size: 0.65rem; color: #64748b; margin-top: 2px; padding: 0 4px;';
      timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      bubble.appendChild(timeSpan);

      streamEl.appendChild(bubble);
      streamEl.scrollTop = streamEl.scrollHeight;
    }

    async function handleSendMessage() {
      const msg = inputEl.value.trim();
      if (!msg) return;

      inputEl.value = '';
      appendMessage('USER', msg, false);

      // Typing indicator
      const typingEl = document.createElement('div');
      typingEl.id = 'chatTypingIndicator';
      typingEl.style.cssText = 'font-size: 0.75rem; color: #94a3b8; font-style: italic; padding: 0.25rem 0;';
      typingEl.textContent = chatLang === 'ta' ? 'பதிலளிக்கிறது...' : 'MediAI Assistant thinking...';
      streamEl.appendChild(typingEl);
      streamEl.scrollTop = streamEl.scrollHeight;

      try {
        const res = await MediAPI.chat.sendMessage(msg, chatLang, convId);
        if (document.getElementById('chatTypingIndicator')) {
          document.getElementById('chatTypingIndicator').remove();
        }
        if (res.data) {
          appendMessage('ASSISTANT', res.data.reply, res.data.is_emergency);
          if (res.data.suggested_actions && res.data.suggested_actions.length > 0) {
            renderChips(res.data.suggested_actions);
          }
        }
      } catch (err) {
        if (document.getElementById('chatTypingIndicator')) {
          document.getElementById('chatTypingIndicator').remove();
        }
        appendMessage('ASSISTANT', 'Error reaching MediAI Assistant: ' + (err.message || 'Please try again.'), false);
      }
    }

    formEl.addEventListener('submit', handleSendMessage);

    // Voice recognition dictation button for Chatbot
    let chatVoiceRec = null;
    let isRecChat = false;

    micBtn.addEventListener('click', () => {
      if (!MediAPI.voice || !MediAPI.voice.isSupported()) {
        alert('Voice speech recognition is not supported in this browser.');
        return;
      }

      if (isRecChat && chatVoiceRec) {
        try { chatVoiceRec.stop(); } catch (e) {}
        isRecChat = false;
        micBtn.style.color = '#38bdf8';
        micBtn.style.background = 'rgba(255,255,255,0.05)';
        return;
      }

      const speechLang = chatLang === 'ta' ? 'ta-IN' : 'en-US';
      try {
        chatVoiceRec = MediAPI.voice.createRecognizer({
          lang: speechLang,
          continuous: false,
          interimResults: true
        });

        if (!chatVoiceRec) return;

        micBtn.style.color = '#ef4444';
        micBtn.style.background = 'rgba(239, 68, 68, 0.2)';
        isRecChat = true;

        chatVoiceRec.onresult = (e) => {
          let text = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            text += e.results[i][0].transcript;
          }
          if (text.trim()) inputEl.value = text.trim();
        };

        chatVoiceRec.onend = () => {
          isRecChat = false;
          micBtn.style.color = '#38bdf8';
          micBtn.style.background = 'rgba(255,255,255,0.05)';
        };

        chatVoiceRec.onerror = () => {
          isRecChat = false;
          micBtn.style.color = '#38bdf8';
          micBtn.style.background = 'rgba(255,255,255,0.05)';
        };

        chatVoiceRec.start();
      } catch (e) {
        isRecChat = false;
        micBtn.style.color = '#38bdf8';
      }
    });
  }
};

// Auto-mount Notification Bell & Chatbot when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    MediAPI.initNotifications();
    MediAPI.initChatbot();
  });
}

