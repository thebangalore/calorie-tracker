document.addEventListener("DOMContentLoaded", () => {

  const foodKeys = ["rice","oats","chicken","wholeEgg","eggWhite","whey","gainer","milk"];

  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  // Apply saved theme
  if (localStorage.getItem("darkMode") === "true") {
    root.classList.add("dark");
  }

  // Toggle theme
  themeToggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("darkMode", root.classList.contains("dark"));
  });

  // Day type target logic
  const dayType = document.getElementById("dayType");
  const targetCalories = document.getElementById("targetCalories");

  dayType.addEventListener("change", () => {
    targetCalories.value = TARGETS[dayType.value];
  });

  function calculate() {
    let calories = 0;
    let protein = 0;

    foodKeys.forEach(k => {
      const input = document.getElementById(k);
      const v = Number(input.value || 0);
      const f =
        ["rice","oats","chicken"].includes(k) ? v / 100 :
        k === "milk" ? v / 100 : v;

      calories += f * FOOD_DATA[k].calories;
      protein += f * FOOD_DATA[k].protein;
    });

    calories += Number(extraCalories.value || 0);
    protein += Number(extraProtein.value || 0);

    calories = Math.round(calories);
    protein = Math.round(protein);

    caloriesText.innerText = `Calories: ${calories}`;
    proteinText.innerText = `Protein: ${protein}`;

    const target = Number(targetCalories.value || 1);
    calorieBar.style.width = Math.min(100, (calories / target) * 100) + "%";

    const diff = calories - target;
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

    // Progress score
    let calorieScore = Math.max(0, 50 - Math.abs(diff) / 4);
    let proteinScore = Math.min(30, (protein / PROTEIN_TARGET) * 30);

    let weeklyScore = 20;
    const log = JSON.parse(localStorage.getItem("log") || "[]");

    if (log.length >= 14) {
      const last = log.slice(-7).reduce((a,b)=>a+b.weight,0)/7;
      const prev = log.slice(-14,-7).reduce((a,b)=>a+b.weight,0)/7;
      const change = last - prev;
      weeklyScore = change >= 0.3 && change <= 0.6 ? 20 : 10;
    }

    score.innerText = Math.min(100, Math.round(calorieScore + proteinScore + weeklyScore));

    return { calories, protein };
  }

  document.addEventListener("input", calculate);

  saveBtn.addEventListener("click", () => {
    if (!logDate.value) return alert("Select a date");

    const totals = calculate();
    const log = JSON.parse(localStorage.getItem("log") || "[]");

    const entry = {
      date: logDate.value,
      calories: totals.calories,
      protein: totals.protein,
      weight: Number(weight.value || 0)
    };

    const index = log.findIndex(d => d.date === entry.date);
    if (index >= 0) log[index] = entry;
    else log.push(entry);

    localStorage.setItem("log", JSON.stringify(log));
    alert("Saved");
  });

});
