const foodKeys = ["rice","oats","chicken","wholeEgg","eggWhite","whey","gainer","milk"];

const themeToggle = document.getElementById("themeToggle");
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
};

dayType.onchange = () => {
  targetCalories.value = TARGETS[dayType.value];
};

function calculate() {
  let calories = 0;
  let protein = 0;

  foodKeys.forEach(k => {
    let v = Number(document.getElementById(k).value || 0);
    let f = ["rice","oats","chicken"].includes(k) ? v/100 : k==="milk" ? v/100 : v;
    calories += f * FOOD_DATA[k].calories;
    protein += f * FOOD_DATA[k].protein;
  });

  calories += Number(extraCalories.value || 0);
  protein += Number(extraProtein.value || 0);

  calories = Math.round(calories);
  protein = Math.round(protein);

  caloriesText.innerText = `Calories: ${calories}`;
  proteinText.innerText = `Protein: ${protein}`;

  let target = Number(targetCalories.value || 1);
  calorieBar.style.width = Math.min(100, (calories / target) * 100) + "%";

  let diff = calories - target;
  statusBadge.className = "badge";

  if (diff < -200) {
    statusBadge.innerText = "Under Target";
    statusBadge.classList.add("under");
  } else if (Math.abs(diff) <= 200) {
    statusBadge.innerText = "On Track";
    statusBadge.classList.add("ontrack");
  } else {
    statusBadge.innerText = "Over Target";
    statusBadge.classList.add("over");
  }

  let calorieScore = Math.max(0, 50 - Math.abs(diff) / 4);
  let proteinScore = Math.min(30, (protein / PROTEIN_TARGET) * 30);

  let weeklyScore = 20;
  let log = JSON.parse(localStorage.getItem("log") || "[]");
  if (log.length >= 14) {
    let last = log.slice(-7).reduce((a,b)=>a+b.weight,0)/7;
    let prev = log.slice(-14,-7).reduce((a,b)=>a+b.weight,0)/7;
    let change = last - prev;
    weeklyScore = change >= 0.3 && change <= 0.6 ? 20 : 10;
  }

  let totalScore = Math.round(calorieScore + proteinScore + weeklyScore);
  score.innerText = Math.min(100, totalScore);

  return { calories, protein };
}

document.addEventListener("input", calculate);

saveBtn.onclick = () => {
  if (!logDate.value) return alert("Select a date");
  let totals = calculate();
  let log = JSON.parse(localStorage.getItem("log") || "[]");

  let entry = {
    date: logDate.value,
    calories: totals.calories,
    protein: totals.protein,
    weight: Number(weight.value || 0)
  };

  let i = log.findIndex(d => d.date === entry.date);
  if (i >= 0) log[i] = entry;
  else log.push(entry);

  localStorage.setItem("log", JSON.stringify(log));
  alert("Saved");
};

if (location.pathname.includes("weekly")) {
  let log = JSON.parse(localStorage.getItem("log") || "[]");
  if (log.length < 7) return;

  let labels = log.map(d=>d.date);
  let weights = log.map(d=>d.weight);
  let calories = log.map(d=>d.calories);

  new Chart(weightChart,{type:"line",data:{labels,datasets:[{label:"Weight",data:weights}]}})
  new Chart(calorieChart,{type:"line",data:{labels,datasets:[{label:"Calories",data:calories}]}})

  let last = weights.slice(-7);
  let prev = weights.slice(-14,-7);
  let change = (last.reduce((a,b)=>a+b,0)/7) - (prev.reduce((a,b)=>a+b,0)/7 || 0);

  decisionBox.innerHTML = `
    <h2>Coach Verdict</h2>
    <p>Weekly Change: ${change.toFixed(2)} kg</p>
    <strong>${change<0.3?"Increase food":change<=0.6?"Perfect bulk":"Control intake"}</strong>
  `;
}
