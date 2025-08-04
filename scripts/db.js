const db = {
    dbKey: 'prospectFlowDB',
    _db: null,

    /**
     * Loads the database from localStorage or initializes a new one.
     * @returns {object} The database object.
     */
    loadDB() {
        try {
            const storedDB = localStorage.getItem(this.dbKey);
            return storedDB ? JSON.parse(storedDB) : {
                accounts: [],
                toDos: [],
                stats: { coldCalls: 0, emailsSent: 0, linkedinMessages: 0, successfulInteractions: 0 }
            };
        } catch (error) {
            console.error('Error loading database from local storage:', error);
            return {
                accounts: [],
                toDos: [],
                stats: { coldCalls: 0, emailsSent: 0, linkedinMessages: 0, successfulInteractions: 0 }
            };
        }
    },
    
    /**
     * Saves the current database state to localStorage.
     */
    saveDB() {
        try {
            localStorage.setItem(this.dbKey, JSON.stringify(this._db));
        } catch (error) {
            console.error('Error saving database to local storage:', error);
        }
    },

    /**
     * Gets the in-memory database object, loading it if necessary.
     * @returns {object} The database object.
     */
    getDB() {
        if (!this._db) {
            this._db = this.loadDB();
        }
        return this._db;
    },

    /**
     * Finds an account by its ID.
     * @param {string} accountId The ID of the account.
     * @returns {object|null} The account object or null if not found.
     */
    getAccountById(accountId) {
        return this.getDB().accounts.find(acc => acc.id === accountId);
    },

    /**
     * Adds or updates an account.
     * @param {object} accountData The account data to save.
     */
    saveAccount(accountData) {
        if (accountData.id) {
            const accountIndex = this._db.accounts.findIndex(acc => acc.id === accountData.id);
            if (accountIndex > -1) Object.assign(this._db.accounts[accountIndex], accountData);
        } else {
            accountData.id = crypto.randomUUID();
            accountData.prospects = [];
            this._db.accounts.push(accountData);
        }
        this.saveDB();
    },

    /**
     * Deletes an account and its related to-dos.
     * @param {string} accountId The ID of the account to delete.
     */
    deleteAccount(accountId) {
        this._db.accounts = this._db.accounts.filter(acc => acc.id !== accountId);
        this._db.toDos = this._db.toDos.filter(todo => todo.accountId !== accountId);
        this.saveDB();
    },

    /**
     * Finds a prospect by its ID within a given account.
     * @param {string} accountId The parent account's ID.
     * @param {string} prospectId The prospect's ID.
     * @returns {object|null} The prospect object or null if not found.
     */
    getProspectById(accountId, prospectId) {
        const account = this.getAccountById(accountId);
        return account ? account.prospects.find(p => p.id === prospectId) : null;
    },

    /**
     * Adds or updates a prospect for a specific account.
     * @param {string} accountId The parent account's ID.
     * @param {object} prospectData The prospect data to save.
     */
    saveProspect(accountId, prospectData) {
        const account = this.getAccountById(accountId);
        if (!account) return;
        if (prospectData.id) {
            const prospectIndex = account.prospects.findIndex(p => p.id === prospectData.id);
            if (prospectIndex > -1) Object.assign(account.prospects[prospectIndex], prospectData);
        } else {
            prospectData.id = crypto.randomUUID();
            prospectData.interactions = [];
            account.prospects.push(prospectData);
        }
        this.saveDB();
    },

    /**
     * Deletes a prospect from an account.
     * @param {string} accountId The parent account's ID.
     * @param {string} prospectId The prospect's ID to delete.
     */
    deleteProspect(accountId, prospectId) {
        const account = this.getAccountById(accountId);
        if (!account) return;
        account.prospects = account.prospects.filter(p => p.id !== prospectId);
        this.saveDB();
    },

    /**
     * Adds a new interaction to a prospect and updates stats.
     * @param {string} accountId The parent account's ID.
     * @param {string} prospectId The prospect's ID.
     * @param {object} interactionData The interaction data.
     * @param {object|null} toDoItem An optional to-do item to add.
     */
    addInteraction(accountId, prospectId, interactionData, toDoItem = null) {
        const prospect = this.getProspectById(accountId, prospectId);
        if (!prospect) return;
        interactionData.id = crypto.randomUUID();
        interactionData.timestamp = new Date().toISOString();
        prospect.interactions.push(interactionData);

        if (interactionData.type === 'Cold Call') this._db.stats.coldCalls++;
        if (interactionData.type === 'Email') this._db.stats.emailsSent++;
        if (interactionData.type === 'LinkedIn Message') this._db.stats.linkedinMessages++;
        if (interactionData.feedback === 'Book Next Meeting') this._db.stats.successfulInteractions++;
        
        if (toDoItem) {
            toDoItem.id = crypto.randomUUID();
            this._db.toDos.push(toDoItem);
        }
        this.saveDB();
    },

    /**
     * Marks a to-do item as completed.
     * @param {string} toDoId The ID of the to-do item.
     */
    completeToDo(toDoId) {
        const todo = this._db.toDos.find(t => t.id === toDoId);
        if (todo) todo.completed = true;
        this.saveDB();
    }
};
