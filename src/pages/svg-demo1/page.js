// imports
import { FlowerView, AcView } from "@/ui/flower";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { gsap } from "gsap";
import { Animation } from "@/lib/animation.js";

// modèle de gestion des données
let M = {};
// listes utilitaires
const competences = [
  "688548e4666873aa7a49491ba88a7271",
  "786d957f2fd89908751ca0ea0a835a37",
  "6a5a25b106187717ff27758e789dbde8",
  "bdeb25b7e21ebc4dc5f3c0f97db7285e",
  "689e945289af4e30650a910291c38e8a",
];
const annees = ["BUT1", "BUT2", "BUT3"];
const colors = [
  "#ef4444",
  "rgb(255, 128, 0)",
  "rgb(255, 204, 0)",
  "#10b981",
  "#3b82f6",
];

M.getColor = function (ac) {
  const match = ac.match(/AC(\d)(\d)/);
  const competence = match[2];
  let color = colors[competence - 1];
  return color;
}


M.getCompName = function (competence) {
  let comp = M.data.find((x) => x.nom_court === competence);
  return comp;
};
// données sous forme de tableau
M.data = [];

M.loadData = async function () {
  let response = await fetch("/src/data/data.json");
  M.dataJson = await response.json();
  M.data = Object.values(M.dataJson);
  return M.data;
};



M.getAcData = async function (ac) {
  let result = null;
  let data = await M.loadData();
  // console.log(data);

  const match = ac.match(/AC(\d)(\d)/);

  const competence = match[2];
  const annee = match[1];

  let Com = data[competence - 1];
  // console.log(Com);
  let niv = Com.niveaux;
  let niveau = niv[annee - 1];
  let acs = niveau.acs;
  result = acs.find((x) => x.code === ac);

  // console.log(result);
  return result;
};

// contrôleur de la page
let C = {};

C.handler_clickAC = function (ev) {
  if (ev.target.id.startsWith("AC")) {
    ev.stopPropagation();
    let ac = ev.target.id;
    V.renderACDetails(ac);
  }
};

C.handlerZooms = function (ev,root) {
  console.log(ev.target);
  // let id = ev.target.parentElement.id;
  let id = ev.target.closest('#Competence').id;
    console.log("double click on competence");
    root.zoomOnCompetence(id);
  };
// const container = document.querySelector('.svg-demo1-container');

C.init = function () {
  M.loadData();
  return V.init();
};

let V = {
  rootPage: null,
  flowers: null,
};

V.attachEvents = function (root) {
  root.addEventListener("click", C.handler_clickAC);
  console.log(root);
  

  // // gestion des zooms
   let Wall = root.querySelector("#wall");
    let bg = root.querySelector("#prototype");
    console.log(Wall);
    console.log(bg);
    let Entreprendre = root.querySelector("#Entreprendre");
    console.log(Entreprendre);
    let Développer = root.querySelector("#Développer");
    let Exprimer = root.querySelector("#Exprimer");
    let Concevoir = root.querySelector("#Concevoir");
    let Comprendre = root.querySelector("#Comprendre");

    let comps = [Entreprendre, Développer, Exprimer, Concevoir, Comprendre];
    comps.forEach((comp, index) => {
  comp.clicked = false;
  comp.addEventListener("click", (ev)=> {
    if (ev.target.id.startsWith("AC")) return;
    ev.stopPropagation();
    console.log(comp.dataset.box)
    let box = comp.getBBox();
    if(!comp.clicked){

      gsap.to(Wall, {attr:{viewBox:box.x + " " + box.y + " " + box.width + " " + box.height}})
      console.log(comp.getBBox());
      comp.clicked = true
      
      // Afficher les labels des AC
      const labels = document.querySelectorAll('.ac-label');
      labels.forEach(label => {
        gsap.to(label, {attr:{opacity: 1}, duration: 0.5});
      });
    } else {
      comp.clicked = false
      gsap.to(Wall, {attr:{viewBox:"0 0 1440 1025"}})
      
      // Masquer les labels
      const labels = document.querySelectorAll('.ac-label');
      labels.forEach(label => {
        gsap.to(label, {attr:{opacity: 0}, duration: 0.5});
      });
    }
  })
})

bg.addEventListener("click", () => {
  gsap.to(Wall, {attr:{viewBox:"0 0 1440 1025"}})
  Entreprendre.clicked = Développer.clicked = Exprimer.clicked = Concevoir.clicked = Comprendre.clicked = false;
})
};
V.renderACNames = async function () {
  let acCode = "";
  let ACList = Array.from(V.rootPage.querySelectorAll('[id^="AC"]')).filter(el => !el.id.includes('container'));
  for (let acElement of ACList) {
    acCode = await M.getAcData(acElement.id);
    console.log("AC element:", acElement.id, "Data:", acCode);
      if (acCode) {
        // Set a data attribute with the code
        acElement.setAttribute('data-ac-code', acCode.code);
        
        // Inject CSS rule for pseudo-element if not already present
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        let color = M.getColor(acCode.code);
  textEl.setAttribute('x', acElement.getAttribute('x'));
  textEl.setAttribute('y', acElement.getAttribute('y') - 10);
  textEl.setAttribute('font-size', '6');
  textEl.setAttribute('fill', color);
  textEl.setAttribute('opacity', '0');
  textEl.setAttribute('class', 'ac-label');
  textEl.textContent = acCode.code;
  acElement.parentElement.appendChild(textEl);
        
    }
    else{
    console.warn("No data found for AC:", acElement.id);}
  }
};

V.renderACDetails = async function (ac) {
  // Récupérer le template de la vue AC
  let acElement = new AcView().html();
  // Remplir le template avec les données de l'AC
  let acData = await M.getAcData(ac);
  acElement = acElement.replaceAll("{{code}}", acData.code);
  acElement = acElement.replace("{{libelle}}", acData.libelle);

  // trouver le container popup
  let root = V.rootPage;
  let popupSlot = root.querySelector('div[name="popup"]');

  //  définir la couleur en fonction de la compétence
  // const match = ac.match(/AC(\d)(\d)/);
  // const competence = match[2];
  let color = M.getColor(ac);

  // insérer le contenu dans le container popup
  popupSlot.innerHTML = htmlToDOM(acElement).outerHTML;

  // gestion de l'overlay
  let overlay = root.querySelector(".overlay");
  overlay.classList.add("active");
  overlay.addEventListener("click", () => {
    overlay.classList.remove("active");
    popup.classList.remove("active");
  });

  // styliser le popup
  let popup = root.querySelector(".popup");
  popup.style.outline = "5px solid " + color;

  //  styliser et gérer la barre de progression
  //  pourcentage de progression
  // let pourcent = popup.dataSet.progress;
  let progress = popup.querySelector(".ac-card__progress-bar");
  progress.style.background =
    "linear-gradient(90deg, " + color + " 0%, white 100%)";
  popup.classList.add("active");

  // gestion du bouton de fermeture
  const closeBtn = popup.querySelector(".popup__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
      popup.classList.remove("active");
    });
  }
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.flowers = new FlowerView();
  // V.rootPage.zoomOnAC;
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.flowers.dom());
  V.attachEvents(V.rootPage);
  V.renderACNames();
  return V.rootPage;
};

export function SvgDemo1Page() {
  return C.init();
}
