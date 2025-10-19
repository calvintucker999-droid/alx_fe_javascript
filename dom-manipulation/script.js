// Step 1: Store some sample quotes
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", category: "Life" },
  { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];

// Step 2: Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;
}

// Step 3: Add event listener to the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

function addQuote() {
  // Get user input values
  const quoteText = document.getElementById("newQuoteText").value;
  const quoteCategory = document.getElementById("newQuoteCategory").value;

  // Check if both fields are filled
  if (quoteText === "" || quoteCategory === "") {
    alert("Please enter both a quote and a category!");
    return;
  }

  // Create a new quote object and add it to the array
  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newQuote = {
    text: textInput.value,
    category: categoryInput.value
  };

  // Add the new quote to the quotes array
  quotes.push(newQuote);

  // Optionally, show confirmation or clear the form
  textInput.value = "";
  categoryInput.value = "";
  
  // Update the DOM
  showRandomQuote();
}

/* script.js
  Dynamic Quote Generator with:
   - localStorage persistence
   - optional sessionStorage for last viewed quote
   - JSON export
   - JSON import
   - addQuote() and showRandomQuote()
*/

// ---------- Constants & selectors ----------
const STORAGE_KEY = 'dynamicQuotes_v1';     // localStorage key
const SESSION_LAST_QUOTE = 'lastViewedQuoteIndex'; // sessionStorage key

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const importFileInput = document.getElementById('importFile');
const statusEl = document.getElementById('status');

// ---------- Initial sample quotes (fallback) ----------
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", category: "Life" },
  { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];

// ---------- Utility: show status to user ----------
function setStatus(message, isError = false, timeout = 3000) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? 'crimson' : 'green';
  if (timeout) {
    setTimeout(() => { statusEl.textContent = ''; }, timeout);
  }
}

// ---------- Persistence: save and load ----------
function saveQuotes() {
  try {
    const json = JSON.stringify(quotes);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (err) {
    console.error('Failed to save quotes', err);
    setStatus('Error saving quotes to localStorage.', true);
  }
}

function loadQuotes() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        quotes = parsed;
      } else {
        console.warn('Stored quotes invalid, using default list.');
      }
    }
  } catch (err) {
    console.error('Failed to load quotes', err);
    setStatus('Error loading quotes from localStorage.', true);
  }
}

// ---------- Optional: session storage for last viewed quote ----------
function saveLastViewedIndex(index) {
  try {
    sessionStorage.setItem(SESSION_LAST_QUOTE, String(index));
  } catch (e) {
    /* ignore session storage errors */
  }
}
function getLastViewedIndex() {
  const v = sessionStorage.getItem(SESSION_LAST_QUOTE);
  return v === null ? null : Number(v);
}

// ---------- Display logic ----------
function renderQuote(quoteObj) {
  if (!quoteObj) {
    quoteDisplay.innerHTML = '<p>No quotes available.</p>';
    return;
  }
  quoteDisplay.innerHTML = `
    <blockquote style="font-style:italic; margin:0 0 8px 0;">"${escapeHtml(quoteObj.text)}"</blockquote>
    <p style="margin:0;"><strong>Category:</strong> ${escapeHtml(quoteObj.category)}</p>
  `;
}

// small helper to avoid simple HTML injection (safe display)
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// show a random quote and save its index to sessionStorage
function showRandomQuote() {
  if (!quotes.length) {
    renderQuote(null);
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const q = quotes[randomIndex];
  renderQuote(q);
  saveLastViewedIndex(randomIndex);
}

// ---------- Add new quote ----------
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim() || 'Uncategorized';

  // Basic validation
  if (!text) {
    setStatus('Please enter a quote text.', true);
    return;
  }

  // Simple duplicate check: same text (case-insensitive)
  const exists = quotes.some(q => q.text.trim().toLowerCase() === text.toLowerCase());
  if (exists) {
    setStatus('Quote already exists.', true);
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();           // persist to localStorage
  setStatus('Quote added!', false, 2000);

  // Optionally show the newly added quote immediately:
  renderQuote(newQuote);

  // Clear inputs
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

// ---------- Export quotes to JSON file ----------
function exportQuotesToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const filename = `quotes_export_${new Date().toISOString().slice(0,10)}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus('Quotes exported as JSON file.');
  } catch (err) {
    console.error('Export error', err);
    setStatus('Failed to export quotes.', true);
  }
}

// ---------- Import quotes from JSON file ----------
function importFromJsonFile(file) {
  if (!file) {
    setStatus('No file selected.', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) {
        setStatus('Invalid file format: expected an array of quotes.', true);
        return;
      }
      // Validate each item (basic)
      const valid = imported.every(item =>
        item && typeof item.text === 'string' && item.text.trim().length > 0
      );
      if (!valid) {
        setStatus('Invalid JSON structure. Each item must contain a text string.', true);
        return;
      }

      // Merge while avoiding exact duplicates (by text)
      let added = 0;
      imported.forEach(item => {
        const text = item.text.trim();
        const category = (item.category && String(item.category).trim()) || 'Uncategorized';
        const exists = quotes.some(q => q.text.trim().toLowerCase() === text.toLowerCase());
        if (!exists) {
          quotes.push({ text, category });
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        setStatus(`Imported ${added} new quote(s).`);
      } else {
        setStatus('No new quotes to import (duplicates skipped).');
      }
    } catch (err) {
      console.error('Import error', err);
      setStatus('Failed to import JSON: invalid file.', true);
    }
  };

  reader.onerror = function() {
    setStatus('Error reading file.', true);
  };

  reader.readAsText(file);
}

// ---------- Wiring events ----------
function wireUp() {
  // show new quote button
  newQuoteBtn.addEventListener('click', showRandomQuote);

  // add quote
  addQuoteBtn.addEventListener('click', addQuote);

  // export
  exportJsonBtn.addEventListener('click', exportQuotesToJson);

  // import
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    importFromJsonFile(file);
    importFileInput.value = ''; // reset input
  });
}

// ---------- Initialization ----------
function init() {
  loadQuotes(); // load from localStorage if present
  wireUp();

  // If there was a last viewed quote in sessionStorage, show it; else show a random one
  const lastIdx = getLastViewedIndex();
  if (lastIdx !== null && quotes[lastIdx]) {
    renderQuote(quotes[lastIdx]);
  } else {
    showRandomQuote();
  }
}

// Run init on DOMContentLoaded to ensure elements are available
document.addEventListener('DOMContentLoaded', init);

function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  const selectedCategory = localStorage.getItem('selectedCategory') || 'all';

  // Clear old options (except the "All" one)
  categorySelect.innerHTML = '<option value="all">All Categories</option>';

  // Get unique category list
  const categories = [...new Set(quotes.map(q => q.category))];

  // Add each category as an option
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    if (category === selectedCategory) {
      option.selected = true;
    }
    categorySelect.appendChild(option);
  });
}
2️⃣ Filter Quotes Based on Category
javascript
Copy code
function filterQuotes() {
  const categorySelect = document.getElementById('categoryFilter');
  const selectedCategory = categorySelect.value;

  // Save filter preference to local storage
  localStorage.setItem('selectedCategory', selectedCategory);

  let filteredQuotes;
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  // If no quotes match, show a message
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available for "${selectedCategory}".</p>`;
  } else {
    // Show one random quote from the filtered list
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    renderQuote(filteredQuotes[randomIndex]);
  }
}
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim() || 'Uncategorized';

  if (!text) {
    setStatus('Please enter a quote text.', true);
    return;
  }

  const exists = quotes.some(q => q.text.trim().toLowerCase() === text.toLowerCase());
  if (exists) {
    setStatus('Quote already exists.', true);
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  setStatus('Quote added successfully!');

  renderQuote(newQuote);
  populateCategories(); // 👈 Update dropdown list
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}
function init() {
  loadQuotes();
  wireUp();
  populateCategories(); // 👈 Build dropdown list

  // Restore last filter or show random
  const lastCategory = localStorage.getItem('selectedCategory') || 'all';
  document.getElementById('categoryFilter').value = lastCategory;
  filterQuotes(); // 👈 Show filtered quotes immediately
}
{
  id: "uuid-or-number",
  text: "Quote text",
  category: "Motivation",
  lastModified: 1660000000000  // UNIX ms timestamp
}
/***** Sync & Conflict Handling for Dynamic Quote Generator *****/

/* CONFIG: set your server endpoint here (must return JSON array of quote objects) */
const SERVER_URL = 'https://my-mock-server.example.com/quotes'; // <- replace with real endpoint
const SYNC_INTERVAL_MS = 1000 * 60 * 1; // 1 minute polling (change as needed)

/* UI elements for notifications / conflict review (create these in index.html or dynamically) */
const syncStatusEl = document.getElementById('syncStatus') || createSyncStatusEl();
const conflictReviewEl = document.getElementById('conflictReview') || createConflictReviewEl();

function createSyncStatusEl() {
  const el = document.createElement('div');
  el.id = 'syncStatus';
  el.style.position = 'fixed';
  el.style.right = '12px';
  el.style.bottom = '12px';
  el.style.background = 'rgba(0,0,0,0.8)';
  el.style.color = 'white';
  el.style.padding = '8px 12px';
  el.style.borderRadius = '6px';
  el.style.display = 'none';
  document.body.appendChild(el);
  return el;
}

function createConflictReviewEl() {
  const container = document.createElement('div');
  container.id = 'conflictReview';
  container.style.position = 'fixed';
  container.style.left = '12px';
  container.style.bottom = '12px';
  container.style.width = '320px';
  container.style.maxHeight = '60vh';
  container.style.overflow = 'auto';
  container.style.background = '#fff';
  container.style.border = '1px solid #ccc';
  container.style.padding = '10px';
  container.style.borderRadius = '6px';
  container.style.display = 'none';
  container.innerHTML = `<h4 style="margin:0 0 8px 0;">Conflict Review</h4><div id="conflictsList"></div>`;
  document.body.appendChild(container);
  return container;
}

function showSyncStatus(msg, timeout = 4000) {
  syncStatusEl.textContent = msg;
  syncStatusEl.style.display = 'block';
  setTimeout(() => syncStatusEl.style.display = 'none', timeout);
}

/* Fetch server quotes (GET) - simple fetch with error handling */
async function fetchServerQuotes() {
  try {
    const resp = await fetch(SERVER_URL, { cache: 'no-store' });
    if (!resp.ok) throw new Error('Network error: ' + resp.status);
    const serverData = await resp.json();
    // Expect serverData to be an array of quote objects
    return Array.isArray(serverData) ? serverData : [];
  } catch (err) {
    console.error('fetchServerQuotes error', err);
    return null; // null indicates fetch failed
  }
}

/* Merge server data into local quotes with conflict detection */
function mergeServerData(serverQuotes) {
  if (!Array.isArray(serverQuotes)) return { added: 0, updated: 0, conflicts: [] };

  const localById = new Map(quotes.map(q => [String(q.id), q]));
  const serverById = new Map(serverQuotes.map(q => [String(q.id), q]));

  const conflicts = [];
  let added = 0, updated = 0;

  // 1) Add or update from server
  serverQuotes.forEach(sq => {
    const id = String(sq.id);
    const local = localById.get(id);

    if (!local) {
      // new on server -> add locally
      quotes.push(sq);
      added++;
    } else {
      // both exist -> check lastModified
      const localTS = Number(local.lastModified) || 0;
      const serverTS = Number(sq.lastModified) || 0;

      if (serverTS > localTS) {
        // server is newer -> overwrite local (server wins)
        // store local copy for conflict review
        conflicts.push({ id, localCopy: { ...local }, serverCopy: { ...sq }, actionTaken: 'server-applied' });
        // apply server copy
        const idx = quotes.findIndex(q => String(q.id) === id);
        if (idx >= 0) { quotes[idx] = sq; }
        updated++;
      } else if (serverTS < localTS) {
        // local is newer than server — according to requirement we still accept server automatically,
        // but keep a record for user's review so they can restore local if desired.
        conflicts.push({ id, localCopy: { ...local }, serverCopy: { ...sq }, actionTaken: 'server-applied' });
        const idx = quotes.findIndex(q => String(q.id) === id);
        if (idx >= 0) { quotes[idx] = sq; }
        updated++;
      } else {
        // equal timestamps -> nothing to do
      }
    }
  });

  // 2) Optionally: detect items that exist locally but not on server (we keep local copies)
  // (No automatic deletion to avoid data loss)

  // save local storage after merging
  saveQuotes();

  return { added, updated, conflicts };
}

/* Show conflict review UI where user can restore local copies if they prefer */
function showConflictReview(conflicts) {
  if (!conflicts || conflicts.length === 0) return;
  const list = document.getElementById('conflictsList');
  list.innerHTML = ''; // clear
  conflicts.forEach(c => {
    const item = document.createElement('div');
    item.style.marginBottom = '8px';
    item.style.borderBottom = '1px solid #eee';
    item.innerHTML = `
      <p style="margin:0;"><strong>ID:</strong> ${c.id}</p>
      <p style="margin:0 0 6px 0;"><strong>Server:</strong> ${escapeHtml(c.serverCopy.text)} <em>(${escapeHtml(c.serverCopy.category)})</em></p>
      <p style="margin:0 0 6px 0;"><strong>Your local:</strong> ${escapeHtml(c.localCopy.text)} <em>(${escapeHtml(c.localCopy.category)})</em></p>
    `;
    const btnKeepLocal = document.createElement('button');
    btnKeepLocal.textContent = 'Restore Local';
    btnKeepLocal.style.marginRight = '6px';
    btnKeepLocal.onclick = () => {
      // restore local version
      const idx = quotes.findIndex(q => String(q.id) === c.id);
      if (idx >= 0) quotes[idx] = c.localCopy;
      saveQuotes();
      setStatus(`Local quote restored for id ${c.id}`);
      // remove item from UI
      item.remove();
    };

    const btnAcceptServer = document.createElement('button');
    btnAcceptServer.textContent = 'Keep Server';
    btnAcceptServer.onclick = () => {
      // server already applied; just remove UI item
      item.remove();
    };

    item.appendChild(btnKeepLocal);
    item.appendChild(btnAcceptServer);
    list.appendChild(item);
  });

  conflictReviewEl.style.display = 'block';
}

/* High-level sync flow: fetch -> merge -> notify user */
async function performSync() {
  const serverQuotes = await fetchServerQuotes();
  if (serverQuotes === null) {
    showSyncStatus('Sync failed (server unreachable).');
    return;
  }

  const result = mergeServerData(serverQuotes);
  if ((result.added + result.updated) > 0) {
    showSyncStatus(`Synced: +${result.added} added, ${result.updated} updated`);
  } else {
    showSyncStatus('No updates from server.');
  }

  if (result.conflicts && result.conflicts.length > 0) {
    // show conflict review so user can restore local if desired
    showConflictReview(result.conflicts);
  }
}

/* Start periodic sync */
let syncTimer = null;
function startPeriodicSync(intervalMs = SYNC_INTERVAL_MS) {
  if (syncTimer) clearInterval(syncTimer);
  // run initial sync immediately
  performSync();
  syncTimer = setInterval(performSync, intervalMs);
}
function stopPeriodicSync() {
  if (syncTimer) clearInterval(syncTimer);
}

/* For manual sync button you might wire it up to call performSync() */

/* Hook into your app initialization */
document.addEventListener('DOMContentLoaded', () => {
  // existing init stuff...
  // after loading local quotes, start sync
  startPeriodicSync();
});
