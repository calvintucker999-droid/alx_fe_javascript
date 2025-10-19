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