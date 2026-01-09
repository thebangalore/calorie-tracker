const foodKeys = ["rice","oats","chicken","wholeEgg","eggWhite","whey","gainer","milk"];

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark"));
}

if (localStorage.getItem("theme") === "true") {
  document.body.classList.add("dark");
}

document.getElementById("dayType")?.addEventListener("change", e => {
  document.getElementById("targetCalories").value = TARGETS[e.target.value];
});

function calculate() {
  let calories = 0, protein = 0;

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

  calProgress.style.width = Math.min(100,(calories/targetCalories.value)*100) + "%";

  caloriesEl.innerText = `Calories: ${calories}`;
  proteinEl.innerText = `Protein: ${protein}`;

  let diff = calories - targetCalories.value;
  statusBadge.className = "badge";

  if (diff < -200) {
    statusBadge.innerText = "Under Target";
    statusBadge.classList.add("under");
    suggestion.innerText = "Add rice or liquid calories";
  } else if (Math.abs(diff) <= 200) {
    statusBadge.innerText = "On Track";
    statusBadge.classList.add("ontrack");
    suggestion.innerText = "Perfect execution today";
  } else {
    statusBadge.innerText = "Over Target";
    statusBadge.classList.add("over");
    suggestion.innerText = "Control liquid calories";
  }

  return { calories, protein };
}

document.addEventListener("input", calculate);

function saveDay() {
  if (!logDate.value) return alert("Select date");
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
}

if (location.pathname.includes("weekly")) {
  let log = JSON.parse(localStorage.getItem("log") || "[]");
  if (log.length < 7) return;

  let labels = log.map(d=>d.date);
  let w = log.map(d=>d.weight);
  let c = log.map(d=>d.calories);

  new Chart(weightChart,{type:"line",data:{labels,datasets:[{label:"Weight",data:w}]}})
  new Chart(calorieChart,{type:"line",data:{labels,datasets:[{label:"Calories",data:c}]}})

  let last = w.slice(-7), prev = w.slice(-14,-7);
  let change = (last.reduce((a,b)=>a+b,0)/7)-(prev.reduce((a,b)=>a+b,0)/7||0);

  decisionBox.innerHTML = `
    <h2>Coach Verdict</h2>
    <p>Weekly Change: ${change.toFixed(2)} kg</p>
    <strong>${change<0.3?"Increase food":change<=0.6?"Perfect bulk":"Control intake"}</strong>
  `;
}
