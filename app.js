const foodInputs = ["rice","oats","chicken","wholeEgg","eggWhite","whey","gainer","milk"];

function calculateTotals() {
  let calories = 0;
  let protein = 0;

  foodInputs.forEach(key => {
    let val = Number(document.getElementById(key).value || 0);
    let factor =
      ["rice","oats","chicken"].includes(key) ? val / 100 :
      key === "milk" ? val / 100 : val;

    calories += factor * FOOD_DATA[key].calories;
    protein += factor * FOOD_DATA[key].protein;
  });

  let extraCalories = Number(document.getElementById("extraCalories").value || 0);
  let extraProtein = Number(document.getElementById("extraProtein").value || 0);

  calories += extraCalories;
  protein += extraProtein;

  document.getElementById("calories").innerText = `Calories: ${Math.round(calories)}`;
  document.getElementById("protein").innerText = `Protein: ${Math.round(protein)}`;

  let target = Number(document.getElementById("targetCalories").value || 0);
  let diff = calories - target;

  let status = document.getElementById("status");
  status.className = "";

  if (diff < -200) {
    status.innerText = "Under";
    status.classList.add("under");
  } else if (Math.abs(diff) <= 200) {
    status.innerText = "On Track";
    status.classList.add("ontrack");
  } else {
    status.innerText = "Over";
    status.classList.add("over");
  }

  return { calories, protein, extraCalories, extraProtein };
}

document.addEventListener("input", calculateTotals);

document.getElementById("dayType")?.addEventListener("change", e => {
  document.getElementById("targetCalories").value = TARGETS[e.target.value];
});

function saveDay() {
  const date = document.getElementById("logDate").value;
  if (!date) { alert("Select a date"); return; }

  let totals = calculateTotals();
  let log = JSON.parse(localStorage.getItem("log") || "[]");

  let entry = {
    date,
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    weight: Number(document.getElementById("weight").value || 0),
    target: Number(document.getElementById("targetCalories").value || 0),
    extraCalories: totals.extraCalories,
    extraProtein: totals.extraProtein
  };

  let index = log.findIndex(d => d.date === date);
  if (index >= 0) log[index] = entry;
  else log.push(entry);

  localStorage.setItem("log", JSON.stringify(log));
  alert("Saved / Updated");
}

if (window.location.pathname.includes("weekly")) {
  let log = JSON.parse(localStorage.getItem("log") || "[]");
  if (log.length < 7) return;

  let labels = log.map(d => d.date);
  let weight = log.map(d => d.weight);
  let calories = log.map(d => d.calories);
  let protein = log.map(d => d.protein);

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

  decisionBox.innerHTML = `
    <h2>Weekly Decision</h2>
    <p>Weekly Weight Change: ${change.toFixed(2)} kg</p>
    <strong>${decision}</strong>
  `;
}
