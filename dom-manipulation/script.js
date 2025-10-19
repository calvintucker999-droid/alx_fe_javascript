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