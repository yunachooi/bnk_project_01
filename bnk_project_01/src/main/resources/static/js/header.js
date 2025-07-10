const structure = {
  "외화예금": {
    "예금": ["USD예금", "JPY예금"],
    "적금": ["USD적금", "EUR적금"]
  },
  "기업": {
    "수입서류": ["인보이스", "포장명세서"],
    "수출서류": ["수출계약서"],
    "신용장": ["L/C 개설", "L/C 통지"]
  },
  "환전": {
    "환전상품1": ["소액환전", "중액환전"],
    "환전상품2": ["정기환전"]
  }
};

let currentStep1 = "외화예금";
let currentStep2 = "예금";
let currentStep3 = "USD예금";

function toggleMenu(menuId) {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
  const menu = document.getElementById(menuId);
  if (menu.innerHTML === '') renderMenu(menuId);
  menu.style.display = 'block';
}

function renderMenu(id) {
  const menu = document.getElementById(id);
  menu.innerHTML = '';

  if (id === "menu1") {
    Object.keys(structure).filter(opt => opt !== currentStep1).forEach(option => {
      const a = document.createElement("a");
      a.textContent = option;
      a.onclick = () => selectStep1(option);
      menu.appendChild(a);
    });
  }

  if (id === "menu2") {
    Object.keys(structure[currentStep1]).filter(opt => opt !== currentStep2).forEach(option => {
      const a = document.createElement("a");
      a.textContent = option;
      a.onclick = () => selectStep2(option);
      menu.appendChild(a);
    });
  }

  if (id === "menu3") {
    structure[currentStep1][currentStep2].filter(opt => opt !== currentStep3).forEach(option => {
      const a = document.createElement("a");
      a.textContent = option;
      a.onclick = () => selectStep3(option);
      menu.appendChild(a);
    });
  }
}

function selectStep1(choice) {
  currentStep1 = choice;
  currentStep2 = Object.keys(structure[choice])[0];
  currentStep3 = structure[choice][currentStep2][0];
  document.getElementById("step1-label").textContent = currentStep1;
  document.getElementById("step2-label").textContent = currentStep2;
  updateStep3(currentStep3);
  renderMenu("menu1");
  renderMenu("menu2");
  renderMenu("menu3");
}

function selectStep2(choice) {
  currentStep2 = choice;
  currentStep3 = structure[currentStep1][currentStep2][0];
  document.getElementById("step2-label").textContent = currentStep2;
  updateStep3(currentStep3);
  renderMenu("menu2");
  renderMenu("menu3");
}

function selectStep3(choice) {
  currentStep3 = choice;
  updateStep3(currentStep3);
  renderMenu("menu3");
}

function updateStep3(text) {
  const step3 = document.getElementById("step3-label");
  step3.textContent = text;
  step3.classList.add("final");
}

window.onload = () => {
  renderMenu("menu1");
  renderMenu("menu2");
  renderMenu("menu3");
};

document.addEventListener('click', function (e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});