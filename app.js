function calculate() {
  let calories = 0;
  let protein = 0;

  for (let key in FOOD_DATA) {
    let input = document.getElementById(key);
    if (!input) continue;

    let value = Number(input.value || 0);
    let factor =
      key === "rice" || key === "oats" || key === "chicken"
        ? value / 100
        : key === "milk"
        ? value / 100
        : value;

    calories += factor * FOOD_DATA[key].calories;
    protein += factor * FOOD_DATA[key].protein;
  }

  document.getElementById("calories").innerText =
    "Calories: " + Math.round(calories);
  document.getElementById("protein").innerText =
    "Protein: " + Math.round(protein);

  let target = Number(document.getElementById("targetCalories").value || 0);
  let diff = calories - target;

  let statusEl = document.getElementById("status");
  statusEl.className = "";

  if (diff < -200) {
    statusEl.innerText = "Under";
    statusEl.classList.add("under");
  } else if (Math.abs(diff) <= 200) {
    statusEl.innerText = "On Track";
    statusEl.classList.add("ontrack");
  } else {
    statusEl.innerText = "Over";
    statusEl.classList.add("over");
  }
}

document.addEventListener("input", calculate);

document.getElementById("dayType")?.addEventListener("change", e => {
  document.getElementById("targetCalories").value =
    TARGETS[e.target.value];
});

function saveDay() {
  let log = JSON.parse(localStorage.getItem("log") || "[]");

  log.push({
    date: new Date().toISOString().slice(0, 10),
    calories: document.getElementById("calories").innerText.replace(/\D/g,""),
    protein: document.getElementById("protein").innerText.replace(/\D/g,""),
    weight: Number(document.getElementById("weight").value || 0)
  });

  localStorage.setItem("log", JSON.stringify(log));
  alert("Saved");
}

if (window.location.pathname.includes("weekly")) {
  let log = JSON.parse(localStorage.getItem("log") || "[]");
  if (log.length < 7) return;

  let labels = log.map(d => d.date);
  let calories = log.map(d => Number(d.calories));
  let protein = log.map(d => Number(d.protein));
  let weight = log.map(d => d.weight);

  new Chart(weightChart, {
    type: "line",
    data: { labels, datasets: [{ label: "Weight (kg)", data: weight }] }
  });

  new Chart(calorieChart, {
    type: "line",
    data: { labels, datasets: [{ label: "Calories", data: calories }] }
  });

  new Chart(proteinChart, {
    type: "line",
    data: { labels, datasets: [{ label: "Protein (g)", data: protein }] }
  });

  let last7 = weight.slice(-7);
  let prev7 = weight.slice(-14, -7);

  let avgLast = last7.reduce((a,b)=>a+b,0)/last7.length;
  let avgPrev = prev7.length ? prev7.reduce((a,b)=>a+b,0)/prev7.length : avgLast;
  let change = avgLast - avgPrev;

  let decision =
    change < 0.3 ? "Add +30 g rice" :
    change <= 0.6 ? "Maintain" :
    "Reduce liquid calories";

  document.getElementById("decisionBox").innerHTML = `
    <h2>Weekly Decision</h2>
    <p>Weekly Weight Change: ${change.toFixed(2)} kg</p>
    <p><strong>${decision}</strong></p>
  `;
}
