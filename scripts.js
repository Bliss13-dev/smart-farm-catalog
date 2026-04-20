/*
   Smart Farm Catalog 

   Growing up close to my grandmother's farm, I witnessed firsthand
   how inefficient manual labor could be and how a lack of access to
   industrialized technology impacted her crop production. I noticed
   how hard it is to find affordable, high-impact tools without
   spending hours researching.
   This catalog is my attempt to bridge that gap. It is a simple,
   filterable tool guide built specifically for small-scale and
   family-managed farming operations.
   Data model: each tool is an object with a name, category,
   price, efficiency rating (out of 10), and an image URL.
   I chose this structure because it makes filtering by category
   and sorting by price or efficiency straightforward using
   JavaScript array methods.
*/

// DATA

const tools = [
  { name: "Drip Irrigation Kit", category: "water", price: 50,  efficiency: 9, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80" },
  { name: "Sprinkler System",    category: "water", price: 80,  efficiency: 7, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { name: "Organic Compost",     category: "soil",  price: 30,  efficiency: 8, image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&q=80" },
  { name: "Soil pH Tester",      category: "soil",  price: 20,  efficiency: 7, image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80" },
  { name: "Pesticide Spray",     category: "pest",  price: 25,  efficiency: 7, image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80" },
  { name: "Neem Oil",            category: "pest",  price: 15,  efficiency: 8, image: "https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=400&q=80" },
  { name: "Water Pump",          category: "water", price: 120, efficiency: 9, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80" },
  { name: "Mulching Sheet",      category: "soil",  price: 40,  efficiency: 6, image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=80" }
];

// Maps each category to an emoji for the card badge
const categoryIcons = { water: "💧", soil: "🪱", pest: "🐛" };

// STATE

// These two variables track what the user has selected so that
// filter and sort always work together, not against each other.
let activeFilter = "all";
let sortAscending = null; // null = no sort applied, true = low-to-high, false = high-to-low

// HELPERS

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  // Auto-clear the error after 3 seconds so it doesn't linger
  setTimeout(() => { el.textContent = ""; }, 3000);
}

function clearError(id) {
  document.getElementById(id).textContent = "";
}

// RENDER

/*
  I use template.cloneNode(true) here instead of building HTML strings
  with template literals. The reason: cloneNode copies the existing DOM
  element cleanly, which avoids accidentally injecting unsafe HTML and
  keeps the card structure in one place (the HTML file) rather than
  scattered across JavaScript strings.
*/
function renderCatalog(dataArray) {
  const container = document.getElementById("card-container");
  container.innerHTML = "";

  if (dataArray.length === 0) {
    container.innerHTML = `<div class="empty-state">😕<p>No tools found for this budget.</p></div>`;
    return;
  }

  const template = document.querySelector(".card");

  dataArray.forEach(tool => {
    const card = template.cloneNode(true);
    card.style.display = "block";

    card.querySelector("img").src = tool.image;
    card.querySelector("img").alt = tool.name;

    const badge = card.querySelector(".card-badge");
    badge.textContent = `${categoryIcons[tool.category]} ${tool.category}`;
    badge.className = `card-badge badge-${tool.category}`;

    card.querySelector("h2").textContent = tool.name;
    card.querySelector("ul").innerHTML = `
      <li>Price: <strong>$${tool.price}</strong></li>
      <li>Efficiency: <strong>${tool.efficiency}/10</strong></li>
    `;

    // Width is a percentage of the 10-point efficiency scale
    card.querySelector(".efficiency-fill").style.width = `${tool.efficiency * 10}%`;

    container.appendChild(card);
  });
}

// FILTER & SORT

/*
  refreshCatalog() is the single function that rebuilds the displayed list.
  I call it any time the user changes the filter or sort so both
  settings are always applied together and never overwrite each other.
*/
function refreshCatalog() {
  // Start from the full tools array every time
  let data = activeFilter === "all"
    ? [...tools]
    : tools.filter(tool => tool.category === activeFilter);

  // Apply price sort only if the user has clicked the sort button
  if (sortAscending === true)  data.sort((a, b) => a.price - b.price);
  if (sortAscending === false) data.sort((a, b) => b.price - a.price);

  renderCatalog(data);
}

function setupFilter() {
  document.getElementById("filter").addEventListener("change", (e) => {
    activeFilter = e.target.value;
    refreshCatalog();
  });
}

function setupSort() {
  const btn = document.getElementById("sort");
  btn.addEventListener("click", () => {
    // Toggle between ascending and descending on each click
    sortAscending = sortAscending === true ? false : true;
    btn.textContent = sortAscending ? "⬆ Price: Low to High" : "⬇ Price: High to Low";
    refreshCatalog();
  });
}

// RECOMMENDER

function setupRecommend() {
  document.getElementById("recommend").addEventListener("click", () => {
    const budget = parseInt(document.getElementById("budget").value);

    if (isNaN(budget) || budget <= 0) {
      showError("budget-error", "⚠ Please enter a valid budget greater than $0");
      return;
    }

    clearError("budget-error");

    // Step 1: Find all tools the user can actually afford
    const affordableTools = tools.filter(tool => tool.price <= budget);

    // Step 2: Sort those tools by efficiency, highest rated first
    affordableTools.sort((a, b) => b.efficiency - a.efficiency);

    // Step 3: Take only the top 3 so the result feels curated, not overwhelming
    const topPicks = affordableTools.slice(0, 3);

    renderCatalog(topPicks);
  });
}

// CLEAR FILTERS

function setupClear() {
  document.getElementById("clear").addEventListener("click", () => {
    // Reset all state back to defaults
    activeFilter = "all";
    sortAscending = null;

    // Reset the UI controls to match
    document.getElementById("filter").value = "all";
    document.getElementById("budget").value = "";
    document.getElementById("sort").textContent = "⬆ Sort by Price";
    clearError("budget-error");

    refreshCatalog();
  });
}

// RAIN GAUGE

/*
  rainLogs stores each reading as an object { val, time } rather than
  a plain number. I made this choice so each entry carries its own
  timestamp. If I stored just numbers, I would lose the time the moment
  the list re-renders.
*/
let rainLogs = [];

function updateGauge() {
  const total = rainLogs.reduce((sum, entry) => sum + entry.val, 0);
  const avg = rainLogs.length ? (total / rainLogs.length).toFixed(1) : 0;
  const latest = rainLogs.length ? rainLogs[rainLogs.length - 1].val : 0;

  // Scale the tube fill: latest reading as a % of the 100mm max
  document.getElementById("gauge-fill").style.height = `${Math.min(latest, 100)}%`;
  document.getElementById("gauge-reading").textContent = `${latest} mm`;

  const status = document.getElementById("gauge-status");
  if (latest === 0) {
    status.textContent = "No rainfall";
    status.className = "gauge-status";
  } else if (latest < 20) {
    status.textContent = "Light rain 🌤";
    status.className = "gauge-status status-light";
  } else if (latest < 50) {
    status.textContent = "Moderate rain 🌧";
    status.className = "gauge-status status-moderate";
  } else {
    status.textContent = "Heavy rain ⛈";
    status.className = "gauge-status status-heavy";
  }

  document.getElementById("total-rain").textContent = total.toFixed(1);
  document.getElementById("avg-rain").textContent = avg;
  document.getElementById("log-count").textContent = rainLogs.length;

  renderRainLog();
}

function renderRainLog() {
  const list = document.getElementById("rain-log-list");
  list.innerHTML = "";

  if (rainLogs.length === 0) {
    list.innerHTML = `<li class="log-empty">No readings yet</li>`;
    return;
  }

  // Reverse so the most recent entry always appears at the top
  rainLogs.slice().reverse().forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="log-mm">${entry.val} mm</span>
      <span class="log-time">${entry.time}</span>
      ${index === 0 ? `<span class="log-latest">Latest</span>` : ""}
    `;
    list.appendChild(li);
  });
}

function setupRainGauge() {
  document.getElementById("rain-log-btn").addEventListener("click", () => {
    const value = parseFloat(document.getElementById("rain-input").value);

    if (isNaN(value) || value < 0) {
      showError("rain-error", "⚠ Enter a valid rainfall amount (0 or more)");
      return;
    }

    clearError("rain-error");

    // Store the value alongside the time it was logged
    rainLogs.push({
      val: value,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    document.getElementById("rain-input").value = "";
    updateGauge();
  });

  document.getElementById("rain-clear-btn").addEventListener("click", () => {
    rainLogs = [];
    updateGauge();
  });
}

// INIT

document.addEventListener("DOMContentLoaded", () => {
  // Populate header stats dynamically so they always reflect the actual data
  document.querySelector(".header-stats .stat:nth-child(1) span").textContent = tools.length;
  document.querySelector(".header-stats .stat:nth-child(2) span").textContent = new Set(tools.map(tool => tool.category)).size;
  document.querySelector(".header-stats .stat:nth-child(3) span").textContent = `$${Math.min(...tools.map(tool => tool.price))}+`;

  refreshCatalog();
  setupFilter();
  setupSort();
  setupRecommend();
  setupClear();
  setupRainGauge();
});
