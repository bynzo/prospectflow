// A global object for the main application logic
const App = {
    // Application state variables
    state: {
        currentView: 'accounts',
        selectedAccountId: null,
        selectedProspectId: null,
    },

    // A map of DOM elements for easy access
    elements: {
        appContainer: document.getElementById('app-container'),
        bottomNav: document.getElementById('bottom-nav'),
        addButton: document.getElementById('add-button'),
        modalOverlay: document.getElementById('custom-modal'),
        modalMessage: document.getElementById('modal-message'),
        modalConfirm: document.getElementById('modal-confirm'),
        modalCancel: document.getElementById('modal-cancel'),
        modalInput: document.getElementById('modal-input'),
        todoBadge: document.getElementById('todo-badge')
    },

    // A reference to the database functions
    db: db,

    // --- Initialization ---
    init() {
        this.db.getDB();
        this.addEventListeners();
        this.renderView(this.state.currentView);
    },

    // --- Routing & Rendering ---
    /**
     * Renders a specific view of the application.
     * @param {string} view The name of the view to render.
     * @param {string|null} data Optional primary data (e.g., account ID).
     * @param {string|null} data2 Optional secondary data (e.g., prospect ID).
     */
    renderView(view, data = null, data2 = null) {
        this.state.currentView = view;
        this.elements.appContainer.innerHTML = '';
        this.updateNavButtons();
        this.updateAddButton();

        switch (view) {
            case 'accounts':
                this.renderAccountsList();
                break;
            case 'add-account':
                this.renderAccountForm(data);
                break;
            case 'account-details':
                this.renderAccountDetails(data);
                break;
            case 'prospects':
                this.renderProspectsList();
                break;
            case 'add-prospect':
                this.renderProspectForm(data, data2);
                break;
            case 'prospect-details':
                this.renderProspectDetails(data, data2);
                break;
            case 'todos':
                this.renderToDosList();
                break;
            case 'stats':
                this.renderStatsDashboard();
                break;
            default:
                this.renderAccountsList();
                break;
        }
    },
    
    /**
     * Updates the active state of the bottom navigation buttons and the to-do badge.
     */
    updateNavButtons() {
        const pendingToDos = this.db.getDB().toDos.filter(todo => !todo.completed).length;
        if (pendingToDos > 0) {
            this.elements.todoBadge.classList.remove('hidden');
        } else {
            this.elements.todoBadge.classList.add('hidden');
        }

        document.querySelectorAll('#bottom-nav button').forEach(button => {
            if (button.dataset.view === this.state.currentView) {
                button.classList.add('text-violet-700');
                button.classList.remove('text-gray-500');
            } else {
                button.classList.remove('text-violet-700');
                button.classList.add('text-gray-500');
            }
        });
    },

    /**
     * Shows or hides the floating add button based on the current view.
     */
    updateAddButton() {
        if (this.state.currentView === 'accounts' || this.state.currentView === 'account-details') {
            this.elements.addButton.style.display = 'flex';
        } else {
            this.elements.addButton.style.display = 'none';
        }
    },
    
    /**
     * Helper function to get an icon for an interaction type.
     * @param {string} type The interaction type.
     * @returns {string} The SVG icon.
     */
    getInteractionIcon(type) {
        switch (type) {
            case 'Call':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone-call"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M18.18 2a15 15 0 0 1 4 11.94"/></svg>`;
            case 'Email':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 7L2 7"/></svg>`;
            case 'LinkedIn':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>`;
            case 'Meeting':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-check"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 14 2 2 4-4"/></svg>`;
            default:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-2 3-3 3"/><path d="M12 17h.01"/></svg>`;
        }
    },
    
    // --- View Rendering Functions ---
    renderAccountsList() {
        const dbData = this.db.getDB();
        const accountsHtml = dbData.accounts.map(account => `
            <div class="bg-white p-4 rounded-xl shadow-sm mb-4 cursor-pointer hover:bg-gray-50 transition-colors animated-card" data-id="${account.id}" data-type="account">
                <h4 class="text-lg font-semibold text-gray-800">${account.companyName}</h4>
                <small class="text-sm text-gray-500">${account.industry} <span class="ml-2 text-violet-500 font-bold">${account.prospects?.length || 0} Prospects</span></small>
            </div>
        `).join('');

        this.elements.appContainer.innerHTML = `
            <div class="px-2">
                <h2 class="text-2xl font-bold mb-6 text-gray-800">Accounts</h2>
                <div>${accountsHtml || '<p class="text-gray-500 text-center mt-8">No accounts added yet. Tap the + to add one!</p>'}</div>
            </div>
        `;
    },

    renderProspectsList() {
        const dbData = this.db.getDB();
        const allProspects = [];
        dbData.accounts.forEach(account => {
            (account.prospects || []).forEach(prospect => {
                allProspects.push({
                    ...prospect,
                    accountId: account.id
                });
            });
        });

        // Helper to get sort priority based on last interaction
        const getSortPriority = (prospect) => {
            const latestInteraction = (prospect.interactions || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            const feedback = latestInteraction ? latestInteraction.feedback : 'No Interaction';

            switch (feedback) {
                case 'Successful qualification': return 0;
                case 'Book Next Meeting': return 1;
                case 'Send More Information': return 2;
                case 'No Answer': return 3;
                case 'No Interaction': return 4;
                case 'Not Interested': return 5;
                default: return 6;
            }
        };

        const sortedProspects = allProspects.sort((a, b) => {
            return getSortPriority(a) - getSortPriority(b);
        });

        const prospectsHtml = sortedProspects.map(prospect => {
            const latestInteraction = (prospect.interactions || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            const interactionCount = prospect.interactions?.length || 0;
            let interactionInfoHtml;
            if (latestInteraction) {
                const icon = this.getInteractionIcon(latestInteraction.type);
                interactionInfoHtml = `
                    <div class="flex items-center text-sm text-gray-600 mt-2">
                        <span class="mr-2 text-violet-600">${icon}</span>
                        <span class="font-medium">${latestInteraction.feedback}</span>
                    </div>
                `;
            } else {
                interactionInfoHtml = `<span class="text-sm text-gray-500 mt-2">Not contacted yet.</span>`;
            }

            return `
                <div class="bg-white p-4 rounded-xl shadow-sm mb-4 cursor-pointer hover:bg-gray-50 transition-colors animated-card" data-account-id="${prospect.accountId}" data-prospect-id="${prospect.id}" data-type="prospect-list">
                    <h4 class="text-lg font-semibold text-gray-800">${prospect.fullName}</h4>
                    <small class="text-sm text-gray-500">${prospect.position} at ${this.db.getAccountById(prospect.accountId)?.companyName || 'N/A'}</small>
                    <div class="flex justify-between items-center mt-2">
                        ${interactionInfoHtml}
                        <span class="text-sm text-gray-500 font-medium">${interactionCount} interactions</span>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.appContainer.innerHTML = `
            <div class="px-2">
                <h2 class="text-2xl font-bold mb-6 text-gray-800">All Prospects</h2>
                <div>${prospectsHtml || '<p class="text-gray-500 text-center mt-8">No prospects added yet.</p>'}</div>
            </div>
        `;
    },

    renderAccountForm(accountId = null) {
        const isEditing = !!accountId;
        const account = isEditing ? this.db.getAccountById(accountId) : {};

        this.elements.appContainer.innerHTML = `
            <button class="flex items-center text-gray-500 hover:text-violet-700 transition-colors mb-4 px-2" data-action="back-to-accounts">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Back
            </button>
            <div class="animated-card bg-white p-6 rounded-xl shadow-sm">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">${isEditing ? 'Edit Account' : 'New Account'}</h2>
                <form id="account-form">
                    <input type="hidden" name="id" value="${accountId || ''}">
                    <div class="mb-4">
                        <label for="companyName" class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input type="text" id="companyName" name="companyName" value="${account.companyName || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" required>
                    </div>
                    <div class="mb-4">
                        <label for="industry" class="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <input type="text" id="industry" name="industry" value="${account.industry || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                    </div>
                    <div class="mb-4">
                        <label for="companyInfo" class="block text-sm font-medium text-gray-700 mb-1">Company Info</label>
                        <textarea id="companyInfo" name="companyInfo" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">${account.companyInfo || ''}</textarea>
                    </div>
                    <div class="mb-4">
                        <label for="painPoints" class="block text-sm font-medium text-gray-700 mb-1">Pain Points</label>
                        <textarea id="painPoints" name="painPoints" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">${account.painPoints || ''}</textarea>
                    </div>
                    <div class="mb-6">
                        <label for="impact" class="block text-sm font-medium text-gray-700 mb-1">Impact of your solution</label>
                        <textarea id="impact" name="impact" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">${account.impact || ''}</textarea>
                    </div>
                    <div class="flex gap-4">
                        <button type="submit" class="flex-1 bg-violet-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-violet-700 transition-colors">Save Account</button>
                        ${isEditing ? `<button type="button" class="flex-1 bg-red-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-red-600 transition-colors" data-action="delete-account">Delete</button>` : ''}
                    </div>
                </form>
            </div>
        `;
    },

    renderAccountDetails(accountId) {
        const account = this.db.getAccountById(accountId);
        if (!account) { this.renderView('accounts'); return; }
        this.state.selectedAccountId = accountId;

        const prospectsHtml = (account.prospects || []).map(prospect => `
            <div class="bg-gray-100 p-4 rounded-xl shadow-sm mb-3 cursor-pointer hover:bg-gray-200 transition-colors animated-card" data-id="${prospect.id}" data-type="prospect">
                <h4 class="text-md font-medium text-gray-800">${prospect.fullName}</h4>
                <small class="text-xs text-gray-500">${prospect.position}</small>
            </div>
        `).join('');

        this.elements.appContainer.innerHTML = `
            <button class="flex items-center text-gray-500 hover:text-violet-700 transition-colors mb-4 px-2" data-action="back-to-accounts">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Back
            </button>
            <div class="animated-card bg-white p-6 rounded-xl shadow-sm mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">${account.companyName}</h2>
                    <button data-action="edit-account" class="p-2 text-gray-500 hover:text-violet-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                </div>
                <small class="text-sm font-medium text-gray-500">${account.industry}</small>
                <p class="mt-4 text-gray-700 leading-relaxed"><strong>Info:</strong> ${account.companyInfo || 'N/A'}</p>
                <p class="mt-2 text-gray-700 leading-relaxed"><strong>Pain Points:</strong> ${account.painPoints || 'N/A'}</p>
                <p class="mt-2 text-gray-700 leading-relaxed"><strong>Impact:</strong> ${account.impact || 'N/A'}</p>
            </div>

            <div class="px-2">
                <h3 class="text-xl font-bold mb-4 text-gray-800">Key Prospects</h3>
                <div>${prospectsHtml || '<p class="text-gray-500 text-center mt-8">No prospects added yet.</p>'}</div>
            </div>
        `;
    },

    renderProspectForm(accountId, prospectId = null) {
        const isEditing = !!prospectId;
        const prospect = isEditing ? this.db.getProspectById(accountId, prospectId) : {};

        this.elements.appContainer.innerHTML = `
            <button class="flex items-center text-gray-500 hover:text-violet-700 transition-colors mb-4 px-2" data-action="back-to-account-details">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Back
            </button>
            <div class="animated-card bg-white p-6 rounded-xl shadow-sm">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">${isEditing ? 'Edit Prospect' : 'New Prospect'}</h2>
                <form id="prospect-form" data-account-id="${accountId}">
                    <input type="hidden" name="id" value="${prospectId || ''}">
                    <div class="mb-4">
                        <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" id="fullName" name="fullName" value="${prospect.fullName || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" required>
                    </div>
                    <div class="mb-4">
                        <label for="position" class="block text-sm font-medium text-gray-700 mb-1">Position/Role</label>
                        <input type="text" id="position" name="position" value="${prospect.position || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                    </div>
                    <div class="mb-4">
                        <label for="contactInfo" class="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                        <input type="text" id="contactInfo" name="contactInfo" value="${prospect.contactInfo || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                    </div>
                    <div class="mb-4">
                        <label for="linkedinProfile" class="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                        <input type="url" id="linkedinProfile" name="linkedinProfile" value="${prospect.linkedinProfile || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                    </div>
                    <div class="mb-6">
                        <label for="personality" class="block text-sm font-medium text-gray-700 mb-1">Personality Type</label>
                        <input type="text" id="personality" name="personality" value="${prospect.personality || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                    </div>
                    <div class="flex gap-4">
                        <button type="submit" class="flex-1 bg-violet-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-violet-700 transition-colors">Save Prospect</button>
                        ${isEditing ? `<button type="button" class="flex-1 bg-red-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-red-600 transition-colors" data-action="delete-prospect">Delete</button>` : ''}
                    </div>
                </form>
            </div>
        `;
    },

    renderProspectDetails(accountId, prospectId) {
        const prospect = this.db.getProspectById(accountId, prospectId);
        if (!prospect) {
            // Check if coming from the all prospects page
            if (this.state.currentView === 'prospects') {
                this.renderView('prospects');
            } else {
                this.renderView('account-details', accountId);
            }
            return;
        }
        this.state.selectedAccountId = accountId;
        this.state.selectedProspectId = prospectId;

        const interactionsHtml = (prospect.interactions || []).reverse().map(interaction => `
            <div class="bg-gray-100 p-4 rounded-lg mb-3 shadow-sm animated-card">
                <div class="flex justify-between items-center mb-2">
                    <small class="text-xs text-gray-500">${new Date(interaction.timestamp).toLocaleString()}</small>
                    <span class="text-sm font-medium text-violet-600">${interaction.type}</span>
                </div>
                <p class="text-sm font-medium text-gray-800">Feedback: <span class="text-gray-600 font-normal">${interaction.feedback}</span></p>
                <p class="text-sm text-gray-600 mt-2">${interaction.notes || 'No notes.'}</p>
            </div>
        `).join('');
        
        // Determine the back button action based on the previous view
        const backButtonAction = this.state.currentView === 'prospects' ? 'back-to-prospects' : 'back-to-account-details';

        this.elements.appContainer.innerHTML = `
            <button class="flex items-center text-gray-500 hover:text-violet-700 transition-colors mb-4 px-2" data-action="${backButtonAction}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Back
            </button>
            <div class="animated-card bg-white p-6 rounded-xl shadow-sm mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">${prospect.fullName}</h2>
                    <button data-action="edit-prospect" class="p-2 text-gray-500 hover:text-violet-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                </div>
                <small class="text-sm font-medium text-gray-500">${prospect.position}</small>
                <p class="mt-4 text-gray-700 leading-relaxed"><strong>Contact:</strong> ${prospect.contactInfo || 'N/A'}</p>
                <p class="mt-2 text-gray-700 leading-relaxed"><strong>LinkedIn:</strong> <a href="${prospect.linkedinProfile}" target="_blank" class="text-violet-600 hover:underline">${prospect.linkedinProfile || 'N/A'}</a></p>
                <p class="mt-2 text-gray-700 leading-relaxed"><strong>Personality:</strong> ${prospect.personality || 'N/A'}</p>
            </div>
            
            <div class="px-2">
                <h3 class="text-xl font-bold mb-4 text-gray-800">Log Interaction</h3>
                <div class="animated-card bg-white p-6 rounded-xl shadow-sm mb-6">
                    <form id="interaction-form">
                        <div class="mb-4">
                            <label for="interactionType" class="block text-sm font-medium text-gray-700 mb-1">Type of Interaction</label>
                            <select id="interactionType" name="type" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="Call">Call</option>
                                <option value="Email">Email</option>
                                <option value="Meeting">Meeting</option>
                                <option value="LinkedIn">LinkedIn</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label for="interactionFeedback" class="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                            <select id="interactionFeedback" name="feedback" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="No Answer">No Answer</option>
                                <option value="Not Interested">Not Interested</option>
                                <option value="Send More Information">Send More Information</option>
                                <option value="Book Next Meeting">Book Next Meeting</option>
                                <option value="Successful qualification">Successful qualification</option>
                            </select>
                        </div>
                        <div class="mb-4 hidden" id="deadline-input-group">
                            <label for="deadline" class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                            <input type="date" id="deadline" name="deadline" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                        </div>
                        <div class="mb-6">
                            <label for="interactionNotes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea id="interactionNotes" name="notes" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-orange-400 text-white font-semibold py-3 px-6 rounded-full hover:bg-orange-500 transition-colors">Log Interaction</button>
                    </form>
                </div>
            </div>
            
            <div class="px-2">
                <h3 class="text-xl font-bold mb-4 text-gray-800">Interaction History</h3>
                <div>${interactionsHtml || '<p class="text-gray-500 text-center mt-8">No interactions logged yet.</p>'}</div>
            </div>
        `;
        
        // Add event listener for the feedback dropdown
        document.getElementById('interactionFeedback').addEventListener('change', (e) => {
            const deadlineGroup = document.getElementById('deadline-input-group');
            const requiresDeadline = ['Send More Information', 'Book Next Meeting'].includes(e.target.value);
            if (requiresDeadline) {
                deadlineGroup.classList.remove('hidden');
            } else {
                deadlineGroup.classList.add('hidden');
            }
        });
    },

    renderToDosList() {
        const dbData = this.db.getDB();
        const toDosHtml = dbData.toDos
            .filter(todo => !todo.completed)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .map(todo => `
            <div class="bg-white p-4 rounded-xl shadow-sm mb-4 flex items-center justify-between animated-card">
                <div>
                    <h4 class="text-md font-semibold text-gray-800">${todo.description}</h4>
                    <small class="text-xs text-gray-500 block">Client: ${this.db.getAccountById(todo.accountId)?.companyName || 'N/A'}</small>
                    <small class="text-xs text-red-500 font-bold block">Deadline: ${new Date(todo.deadline).toLocaleDateString()}</small>
                </div>
                <button class="flex-shrink-0 bg-violet-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-violet-700 transition-colors text-sm" data-action="complete-todo" data-id="${todo.id}">Done</button>
            </div>
        `).join('');

        this.elements.appContainer.innerHTML = `
            <div class="px-2">
                <h2 class="text-2xl font-bold mb-6 text-gray-800">To-Do List</h2>
                <div>${toDosHtml || '<p class="text-gray-500 text-center mt-8">No pending to-do items. Great job!</p>'}</div>
            </div>
        `;
    },

    renderStatsDashboard() {
        const dbData = this.db.getDB();
        const stats = dbData.stats;
        const totalInteractions = stats.coldCalls + stats.emailsSent + stats.linkedinMessages;
        const successRate = totalInteractions > 0 ? ((stats.successfulInteractions / totalInteractions) * 100).toFixed(2) : 0;
        
        this.elements.appContainer.innerHTML = `
            <div class="px-2">
                <h2 class="text-2xl font-bold mb-6 text-gray-800">Stats Dashboard</h2>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div class="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center animated-card">
                        <div class="text-4xl font-bold text-violet-600">${totalInteractions}</div>
                        <div class="text-sm font-medium text-gray-500 mt-2">Total Interactions</div>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center animated-card">
                        <div class="text-4xl font-bold text-green-500">${stats.successfulInteractions}</div>
                        <div class="text-sm font-medium text-gray-500 mt-2">Successful Interactions</div>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center animated-card sm:col-span-2">
                        <div class="text-4xl font-bold text-orange-400">${successRate}%</div>
                        <div class="text-sm font-medium text-gray-500 mt-2">Success Rate</div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm animated-card">
                    <h3 class="text-lg font-bold mb-4 text-gray-800">Interaction Breakdown</h3>
                    <div class="relative h-64 w-full">
                        <canvas id="interaction-breakdown-chart"></canvas>
                    </div>
                </div>
            </div>
        `;

        const ctx = document.getElementById('interaction-breakdown-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Calls', 'Emails', 'LinkedIn'],
                datasets: [{
                    label: 'Number of Interactions',
                    data: [stats.coldCalls, stats.emailsSent, stats.linkedinMessages],
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(91, 33, 186, 0.8)',
                        'rgba(251, 191, 36, 0.8)'
                    ],
                    borderColor: [
                        'rgba(139, 92, 246, 1)',
                        'rgba(91, 33, 186, 1)',
                        'rgba(251, 191, 36, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // --- Custom Modal Logic ---
    showModal(message, confirmText = 'Confirm', cancelText = 'Cancel', showInput = false, callback) {
        this.elements.modalMessage.textContent = message;
        this.elements.modalConfirm.textContent = confirmText;
        this.elements.modalConfirm.onclick = () => {
            this.hideModal();
            if (callback) callback(true, this.elements.modalInput.value);
        };
        if (cancelText) {
            this.elements.modalCancel.textContent = cancelText;
            this.elements.modalCancel.classList.remove('hidden');
            this.elements.modalCancel.onclick = () => {
                this.hideModal();
                if (callback) callback(false);
            };
        } else {
            this.elements.modalCancel.classList.add('hidden');
        }
        
        if (showInput) {
            this.elements.modalInput.classList.remove('hidden');
            this.elements.modalInput.value = '';
        } else {
            this.elements.modalInput.classList.add('hidden');
        }
        this.elements.modalOverlay.classList.add('visible');
    },

    hideModal() {
        this.elements.modalOverlay.classList.remove('visible');
    },

    // --- Event Handling ---
    addEventListeners() {
        this.elements.bottomNav.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (button) {
                this.renderView(button.dataset.view);
            }
        });

        this.elements.addButton.addEventListener('click', () => {
            if (this.state.currentView === 'accounts') {
                this.renderView('add-account');
            } else if (this.state.currentView === 'account-details') {
                this.renderView('add-prospect', this.state.selectedAccountId);
            }
        });

        this.elements.appContainer.addEventListener('click', (event) => {
            const target = event.target;
            const action = target.dataset.action || target.closest('[data-action]')?.dataset.action;
            const id = target.dataset.id || target.closest('[data-id]')?.dataset.id;
            const type = target.dataset.type || target.closest('[data-type]')?.dataset.type;

            if (type === 'account') {
                this.renderView('account-details', id);
            } else if (type === 'prospect') {
                this.renderView('prospect-details', this.state.selectedAccountId, id);
            } else if (type === 'prospect-list') {
                const accountId = target.dataset.accountId || target.closest('[data-account-id]')?.dataset.accountId;
                const prospectId = target.dataset.prospectId || target.closest('[data-prospect-id]')?.dataset.prospectId;
                this.renderView('prospect-details', accountId, prospectId);
            } else if (action === 'back-to-accounts') {
                this.renderView('accounts');
            } else if (action === 'back-to-account-details') {
                this.renderView('account-details', this.state.selectedAccountId);
            } else if (action === 'back-to-prospects') {
                this.renderView('prospects');
            } else if (action === 'edit-account') {
                this.renderView('add-account', this.state.selectedAccountId);
            } else if (action === 'delete-account') {
                this.showModal('Are you sure you want to delete this account and all related prospects?', 'Delete', 'Cancel', false, (result) => {
                    if (result) {
                        this.db.deleteAccount(this.state.selectedAccountId);
                        this.renderView('accounts');
                    }
                });
            } else if (action === 'edit-prospect') {
                this.renderView('add-prospect', this.state.selectedAccountId, this.state.selectedProspectId);
            } else if (action === 'delete-prospect') {
                this.showModal('Are you sure you want to delete this prospect?', 'Delete', 'Cancel', false, (result) => {
                    if (result) {
                        this.db.deleteProspect(this.state.selectedAccountId, this.state.selectedProspectId);
                        this.renderView('account-details', this.state.selectedAccountId);
                    }
                });
            } else if (action === 'complete-todo') {
                this.db.completeToDo(id);
                this.renderView('todos');
            }
        });
        
        this.elements.appContainer.addEventListener('submit', (event) => {
            event.preventDefault();
            const form = event.target.closest('form');
            if (!form) return;

            const formId = form.getAttribute('id');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            switch (formId) {
                case 'account-form':
                    this.db.saveAccount(data);
                    this.renderView('accounts');
                    break;
                case 'prospect-form':
                    const accountId = form.dataset.accountId;
                    this.db.saveProspect(accountId, data);
                    this.renderView('account-details', accountId);
                    break;
                case 'interaction-form':
                    let toDoItem = null;
                    if (data.deadline) {
                        toDoItem = {
                            description: data.feedback,
                            deadline: data.deadline,
                            completed: false,
                            accountId: this.state.selectedAccountId,
                            prospectId: this.state.selectedProspectId
                        };
                    }
                    this.db.addInteraction(this.state.selectedAccountId, this.state.selectedProspectId, data, toDoItem);
                    this.renderView('prospect-details', this.state.selectedAccountId, this.state.selectedProspectId);
                    break;
                default:
                    console.warn(`No handler for form with ID: ${formId}`);
            }
        });
    }
};

// Start the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
