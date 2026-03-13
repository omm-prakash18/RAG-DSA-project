// DSA Learning Website - Main Application
const App = {
  currentProblem: null,
  currentLanguage: 'python',
  solvedProblems: JSON.parse(localStorage.getItem('solved_problems') || '[]'),
  bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '[]'),
  chatHistory: [],
  hintLevel: 0,
  theme: localStorage.getItem('theme') || 'dark',

  init() {
    this.applyTheme();
    this.renderProblems();
    this.setupEventListeners();
    this.checkAPIKey();
    this.updateStats();
    this.setupMobileNav();
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  },

  checkAPIKey() {
    const key = getAPIKey();
    const badge = document.getElementById('api-status');
    if (badge) {
      badge.className = key ? 'api-badge connected' : 'api-badge disconnected';
      badge.innerHTML = key ? '<i class="fas fa-circle"></i> AI Connected' : '<i class="fas fa-circle"></i> No API Key';
    }
  },

  renderProblems(filter = {}) {
    const grid = document.getElementById('problems-grid');
    if (!grid) return;

    let problems = DSA_PROBLEMS;
    if (filter.category) problems = problems.filter(p => p.category === filter.category);
    if (filter.difficulty) problems = problems.filter(p => p.difficulty === filter.difficulty);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      problems = problems.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    grid.innerHTML = problems.map(p => this.renderProblemCard(p)).join('');
  },

  renderProblemCard(problem) {
    const solved = this.solvedProblems.includes(problem.id);
    const bookmarked = this.bookmarks.includes(problem.id);
    const diffClass = problem.difficulty.toLowerCase();
    
    return `
      <div class="problem-card ${solved ? 'solved' : ''}" data-id="${problem.id}">
        <div class="card-header">
          <span class="category-badge">${problem.category}</span>
          <div class="card-actions">
            ${solved ? '<span class="solved-badge"><i class="fas fa-check"></i></span>' : ''}
            <button class="bookmark-btn ${bookmarked ? 'active' : ''}" onclick="App.toggleBookmark(${problem.id})" title="Bookmark">
              <i class="fa${bookmarked ? 's' : 'r'} fa-bookmark"></i>
            </button>
          </div>
        </div>
        <h3 class="problem-title">${problem.id}. ${problem.title}</h3>
        <div class="problem-tags">
          ${problem.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="card-footer">
          <span class="difficulty-badge ${diffClass}">${problem.difficulty}</span>
          <div class="card-btns">
            <button class="btn-hint" onclick="App.quickHint(${problem.id})">
              <i class="fas fa-lightbulb"></i> Hint
            </button>
            <button class="btn-solve" onclick="App.openProblem(${problem.id})">
              <i class="fas fa-code"></i> Solve
            </button>
          </div>
        </div>
      </div>
    `;
  },

  openProblem(id) {
    const problem = DSA_PROBLEMS.find(p => p.id === id);
    if (!problem) return;
    
    this.currentProblem = problem;
    this.hintLevel = 0;
    this.chatHistory = [];
    
    // Navigate to compiler section
    document.getElementById('compiler').scrollIntoView({ behavior: 'smooth' });
    
    // Update problem display
    this.renderProblemDetail(problem);
    this.resetEditor();
    this.renderChat([]);
    
    // Show problem panel
    document.getElementById('problem-panel').classList.add('active');
  },

  renderProblemDetail(problem) {
    const panel = document.getElementById('problem-detail');
    if (!panel) return;
    
    const solved = this.solvedProblems.includes(problem.id);
    
    panel.innerHTML = `
      <div class="problem-header">
        <div class="problem-meta">
          <span class="difficulty-badge ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
          <span class="category-badge">${problem.category}</span>
          ${solved ? '<span class="solved-badge"><i class="fas fa-check-circle"></i> Solved</span>' : ''}
        </div>
        <h2>${problem.id}. ${problem.title}</h2>
      </div>
      <div class="problem-description">${problem.description}</div>
      <div class="examples-section">
        <h4>Examples</h4>
        ${problem.examples.map((ex, i) => `
          <div class="example">
            <div class="example-label">Example ${i + 1}:</div>
            <div class="io-block">
              <div><span class="io-label">Input:</span> <code>${ex.input}</code></div>
              <div><span class="io-label">Output:</span> <code>${ex.output}</code></div>
              ${ex.explanation ? `<div><span class="io-label">Explanation:</span> ${ex.explanation}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="constraints-section">
        <h4>Constraints</h4>
        <ul>${problem.constraints.map(c => `<li><code>${c}</code></li>`).join('')}</ul>
      </div>
      <div class="problem-actions">
        <button class="btn-action" onclick="App.aiExplain()"><i class="fas fa-brain"></i> Explain</button>
        <button class="btn-action" onclick="App.aiHint()"><i class="fas fa-lightbulb"></i> Get Hint</button>
        <button class="btn-action btn-danger" onclick="App.aiSolution()"><i class="fas fa-eye"></i> Solution</button>
        <button class="btn-action btn-success" onclick="App.markSolved(${problem.id})">
          <i class="fas fa-check"></i> Mark Solved
        </button>
      </div>
    `;
  },

  resetEditor() {
    const editor = document.getElementById('code-editor');
    if (editor && this.currentProblem) {
      editor.value = this.currentProblem.templates[this.currentLanguage] || '// Write your solution here';
    }
    document.getElementById('output-area').textContent = 'Output will appear here...';
  },

  changeLanguage(lang) {
    this.currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-lang="${lang}"]`)?.classList.add('active');
    if (this.currentProblem) this.resetEditor();
  },

  runCode() {
    const code = document.getElementById('code-editor').value;
    const output = document.getElementById('output-area');
    
    if (!code.trim()) {
      output.textContent = 'Please write some code first!';
      return;
    }

    output.textContent = '⏳ Running...';

    if (this.currentLanguage === 'javascript') {
      try {
        const logs = [];
        const origLog = console.log;
        console.log = (...args) => logs.push(args.map(a => 
          typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        
        const fn = new Function(code);
        fn();
        console.log = origLog;
        
        output.textContent = logs.length ? logs.join('\n') : '✅ Code ran successfully (no output)';
      } catch (e) {
        console.log = console.log;
        output.textContent = `❌ Error: ${e.message}`;
      }
    } else {
      // Simulate for other languages
      output.textContent = `⚡ ${this.currentLanguage.toUpperCase()} simulation:\nCode accepted! (Real execution requires a backend)\n\nFor ${this.currentLanguage}, use an online judge like LeetCode, HackerRank, or repl.it to test your solution.\n\nYour code looks ${code.length > 50 ? 'well-structured' : 'brief'} - use the AI assistant to verify your approach!`;
    }
  },

  resetCode() {
    if (this.currentProblem) {
      this.resetEditor();
    }
  },

  copyCode() {
    const code = document.getElementById('code-editor').value;
    navigator.clipboard.writeText(code).then(() => {
      this.showToast('Code copied to clipboard!', 'success');
    });
  },

  markSolved(id) {
    if (!this.solvedProblems.includes(id)) {
      this.solvedProblems.push(id);
      localStorage.setItem('solved_problems', JSON.stringify(this.solvedProblems));
      this.showToast('Problem marked as solved! 🎉', 'success');
      this.renderProblems();
      this.updateStats();
      if (this.currentProblem?.id === id) {
        this.renderProblemDetail(this.currentProblem);
      }
    }
  },

  toggleBookmark(id) {
    const idx = this.bookmarks.indexOf(id);
    if (idx === -1) {
      this.bookmarks.push(id);
      this.showToast('Problem bookmarked!', 'success');
    } else {
      this.bookmarks.splice(idx, 1);
      this.showToast('Bookmark removed', 'info');
    }
    localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    this.renderProblems();
  },

  updateStats() {
    const solved = document.getElementById('stat-solved');
    const total = document.getElementById('stat-total');
    const pct = document.getElementById('stat-pct');
    
    if (solved) solved.textContent = this.solvedProblems.length;
    if (total) total.textContent = DSA_PROBLEMS.length;
    if (pct) {
      const p = Math.round((this.solvedProblems.length / DSA_PROBLEMS.length) * 100);
      pct.textContent = p + '%';
      const bar = document.getElementById('progress-bar');
      if (bar) bar.style.width = p + '%';
    }
  },

  // AI Functions
  async aiExplain() {
    if (!this.currentProblem) {
      this.addChatMessage('assistant', '⚠️ Please select a problem first!');
      return;
    }
    this.addChatMessage('user', `📖 Explain the approach for "${this.currentProblem.title}"`);
    await this.aiRespond(async () => await explainSolution(this.currentProblem));
  },

  async aiHint() {
    if (!this.currentProblem) {
      this.addChatMessage('assistant', '⚠️ Please select a problem first!');
      return;
    }
    this.hintLevel = Math.min(this.hintLevel + 1, 3);
    this.addChatMessage('user', `💡 Give me hint ${this.hintLevel}/3`);
    await this.aiRespond(async () => await generateHints(this.currentProblem, this.hintLevel));
  },

  async aiSolution() {
    if (!this.currentProblem) {
      this.addChatMessage('assistant', '⚠️ Please select a problem first!');
      return;
    }
    const confirmed = confirm('⚠️ Viewing the solution will reveal the answer. Try to solve it yourself first!\n\nAre you sure you want to see the solution?');
    if (!confirmed) return;
    this.addChatMessage('user', `👁️ Show me the solution approach`);
    await this.aiRespond(async () => {
      const sol = this.currentProblem.solution;
      const response = await explainSolution(this.currentProblem);
      return response + `\n\n---\n**Reference Solution (${this.currentLanguage}):**\n\`\`\`${this.currentLanguage}\n${sol.python || 'See solution in your preferred language'}\n\`\`\`\n\n**Complexity:** Time: ${sol.complexity.time}, Space: ${sol.complexity.space}`;
    });
  },

  async aiDebug() {
    if (!this.currentProblem) {
      this.addChatMessage('assistant', '⚠️ Please select a problem first!');
      return;
    }
    const code = document.getElementById('code-editor').value;
    const error = document.getElementById('output-area').textContent;
    this.addChatMessage('user', `🐛 Debug my code`);
    await this.aiRespond(async () => await debugCode(this.currentProblem, code, error, this.currentLanguage));
  },

  async aiComplexity() {
    if (!this.currentProblem) {
      this.addChatMessage('assistant', '⚠️ Please select a problem first!');
      return;
    }
    const code = document.getElementById('code-editor').value;
    if (!code.trim() || code === this.currentProblem.templates[this.currentLanguage]) {
      this.addChatMessage('assistant', 'Please write your solution first, then I can analyze its complexity! 📊');
      return;
    }
    this.addChatMessage('user', `📊 Analyze complexity of my solution`);
    await this.aiRespond(async () => await analyzeComplexity(this.currentProblem, code, this.currentLanguage));
  },

  async aiVisualize() {
    if (!this.currentProblem) {
      this.addChatMessage('assistant', '⚠️ Please select a problem first!');
      return;
    }
    this.addChatMessage('user', `🎨 Visualize the algorithm`);
    await this.aiRespond(async () => await visualizeAlgorithm(this.currentProblem));
  },

  async sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    this.addChatMessage('user', message);

    // Parse commands
    const lower = message.toLowerCase();
    
    await this.aiRespond(async () => {
      if (lower.startsWith('/explain')) {
        if (!this.currentProblem) throw new Error('NO_PROBLEM_SELECTED');
        return await explainSolution(this.currentProblem);
      }
      if (lower.startsWith('/hint')) {
        if (!this.currentProblem) throw new Error('NO_PROBLEM_SELECTED');
        return await generateHints(this.currentProblem, ++this.hintLevel);
      }
      if (lower.startsWith('/debug')) {
        if (!this.currentProblem) throw new Error('NO_PROBLEM_SELECTED');
        const code = document.getElementById('code-editor').value;
        return await debugCode(this.currentProblem, code, '', this.currentLanguage);
      }
      if (lower.startsWith('/complexity')) {
        if (!this.currentProblem) throw new Error('NO_PROBLEM_SELECTED');
        const code = document.getElementById('code-editor').value;
        return await analyzeComplexity(this.currentProblem, code, this.currentLanguage);
      }
      if (lower.startsWith('/visualize')) {
        if (!this.currentProblem) throw new Error('NO_PROBLEM_SELECTED');
        return await visualizeAlgorithm(this.currentProblem);
      }
      
      // General help with context
      if (this.currentProblem) {
        const code = document.getElementById('code-editor').value;
        return await getDSAHelp(this.currentProblem, code, message);
      } else {
        return await getGeneralDSAHelp(message);
      }
    });
  },

  async aiRespond(fn) {
    const apiKey = getAPIKey();
    if (!apiKey) {
      this.addChatMessage('assistant', `⚙️ Please set your Gemini API key first!\n\nClick **Settings** (gear icon) in the top right to add your API key. Get one free at [Google AI Studio](https://makersuite.google.com/app/apikey).`);
      return;
    }

    const typingId = this.addTypingIndicator();
    
    try {
      if (!rateLimiter.canCall()) {
        throw new Error('RATE_LIMIT_LOCAL');
      }
      rateLimiter.record();
      
      const response = await fn();
      this.removeTypingIndicator(typingId);
      this.addChatMessage('assistant', response);
    } catch (err) {
      this.removeTypingIndicator(typingId);
      let errorMsg = '❌ Something went wrong. Please try again.';
      if (err.message === 'NO_API_KEY') errorMsg = '⚙️ Please set your Gemini API key in Settings.';
      else if (err.message === 'INVALID_API_KEY') errorMsg = '🔑 Invalid API key. Please check your key in Settings.';
      else if (err.message === 'RATE_LIMIT' || err.message === 'RATE_LIMIT_LOCAL') errorMsg = '⏳ Rate limit reached. Please wait a moment before asking again.';
      else if (err.message === 'NO_PROBLEM_SELECTED') errorMsg = '⚠️ Please select a problem first!';
      this.addChatMessage('assistant', errorMsg);
    }
  },

  addChatMessage(role, content) {
    const chat = document.getElementById('chat-messages');
    if (!chat) return;

    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    
    // Simple markdown rendering
    const rendered = this.renderMarkdown(content);
    div.innerHTML = `
      <div class="message-avatar">${role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'}</div>
      <div class="message-content">${rendered}</div>
    `;
    
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    
    this.chatHistory.push({ role, content });
    return div;
  },

  addTypingIndicator() {
    const chat = document.getElementById('chat-messages');
    if (!chat) return null;
    
    const div = document.createElement('div');
    div.className = 'chat-message assistant typing';
    div.id = 'typing-' + Date.now();
    div.innerHTML = `
      <div class="message-avatar"><i class="fas fa-robot"></i></div>
      <div class="message-content">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div.id;
  },

  removeTypingIndicator(id) {
    if (id) document.getElementById(id)?.remove();
  },

  renderMarkdown(text) {
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => 
        `<pre><code class="lang-${lang || ''}">${this.escapeHtml(code.trim())}</code></pre>`)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h5>$1</h5>')
      .replace(/^## (.+)$/gm, '<h4>$1</h4>')
      .replace(/^# (.+)$/gm, '<h3>$1</h3>')
      .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hp\w])/gm, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  },

  escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  async quickHint(id) {
    const problem = DSA_PROBLEMS.find(p => p.id === id);
    if (!problem) return;
    
    // Show hint in a modal
    const modal = document.getElementById('hint-modal');
    const content = document.getElementById('hint-content');
    if (!modal || !content) return;
    
    content.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    modal.classList.add('open');
    document.getElementById('hint-modal-title').textContent = `💡 Hint for: ${problem.title}`;
    
    try {
      const apiKey = getAPIKey();
      if (apiKey) {
        const hint = await generateHints(problem, 1);
        content.innerHTML = this.renderMarkdown(hint);
      } else {
        content.innerHTML = `<p><strong>Hint 1:</strong> ${problem.hints[0]}</p>
          <p><strong>Hint 2:</strong> ${problem.hints[1]}</p>
          <p><em>💡 Set your Gemini API key for AI-powered adaptive hints!</em></p>`;
      }
    } catch (e) {
      content.innerHTML = `<p><strong>Hint:</strong> ${problem.hints[0]}</p>`;
    }
  },

  closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
  },

  setupEventListeners() {
    // Search
    const search = document.getElementById('problem-search');
    if (search) {
      let debounce;
      search.addEventListener('input', e => {
        clearTimeout(debounce);
        debounce = setTimeout(() => this.filterProblems(), 300);
      });
    }

    // Category filter
    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterProblems();
      });
    });

    // Difficulty filter
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterProblems();
      });
    });

    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => this.changeLanguage(btn.dataset.lang));
    });

    // Chat input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendChatMessage();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'Enter') this.runCode();
      if (e.ctrlKey && e.key === 'h') { e.preventDefault(); this.aiHint(); }
      if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    });

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

    // Settings
    document.getElementById('settings-btn')?.addEventListener('click', () => this.openSettings());
    document.getElementById('save-api-key')?.addEventListener('click', () => this.saveAPIKey());
  },

  filterProblems() {
    const search = document.getElementById('problem-search')?.value || '';
    const category = document.querySelector('[data-category].active')?.dataset.category;
    const difficulty = document.querySelector('[data-difficulty].active')?.dataset.difficulty;
    
    this.renderProblems({
      search,
      category: category === 'all' ? null : category,
      difficulty: difficulty === 'all' ? null : difficulty,
    });
  },

  openSettings() {
    const modal = document.getElementById('settings-modal');
    const input = document.getElementById('api-key-input');
    if (modal) {
      modal.classList.add('open');
      if (input) input.value = getAPIKey();
    }
  },

  saveAPIKey() {
    const input = document.getElementById('api-key-input');
    if (input) {
      configureAPI(input.value.trim());
      this.checkAPIKey();
      this.closeModal('settings-modal');
      this.showToast('API key saved! 🔑', 'success');
    }
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
      });
    }
  },

  exportChat() {
    const md = this.chatHistory.map(m => 
      `**${m.role === 'user' ? 'You' : 'AI Assistant'}:**\n${m.content}`
    ).join('\n\n---\n\n');
    
    const blob = new Blob([`# DSA Chat Export\n\nProblem: ${this.currentProblem?.title || 'General'}\n\n---\n\n${md}`], 
      { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dsa-chat-${Date.now()}.md`;
    a.click();
  },

  renderChat(history) {
    const chat = document.getElementById('chat-messages');
    if (!chat) return;
    
    chat.innerHTML = '';
    
    if (this.currentProblem) {
      const div = document.createElement('div');
      div.className = 'chat-message assistant';
      div.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
          <p>👋 I'm your DSA tutor! I'm here to help you solve <strong>${this.currentProblem.title}</strong>.</p>
          <p>Try these commands:</p>
          <ul>
            <li><code>/explain</code> - Understand the approach</li>
            <li><code>/hint</code> - Get progressive hints</li>
            <li><code>/debug</code> - Debug your code</li>
            <li><code>/complexity</code> - Analyze complexity</li>
            <li><code>/visualize</code> - See a visualization</li>
          </ul>
          <p>Or just ask me anything! 🚀</p>
        </div>
      `;
      chat.appendChild(div);
    } else {
      const div = document.createElement('div');
      div.className = 'chat-message assistant';
      div.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
          <p>👋 Hi! I'm your DSA tutor. Select a problem and I'll help you solve it using the Socratic method — guiding you to the answer rather than just giving it away!</p>
          <p>Set your <strong>Gemini API key</strong> in Settings to enable AI features.</p>
        </div>
      `;
      chat.appendChild(div);
    }
    
    // Add history messages if provided
    if (Array.isArray(history) && history.length > 0) {
      history.forEach(m => this.addChatMessage(m.role, m.content));
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
