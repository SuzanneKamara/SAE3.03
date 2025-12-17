// imports
import { FlowerView, AcView } from "@/ui/flower";
import { htmlToDOM } from "@/lib/utils.js";
import { ProgressStorage } from "@/data/progressStorage.js";
import template from "./template.html?raw";
import { gsap } from "gsap";
import { Animation } from "@/lib/animation.js";
import { User } from "@/data/user.js";

// modèle de gestion des données
let M = {};
M.progress = null;

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

M.getComp = function (ac) {
  const match = ac.match(/AC(\d)(\d)/);
  const competence = match[2];
  return competences[competence - 1];
}
M.getCompPos = function (ac) {
  const match = ac.match(/AC(\d)(\d)/);
  const competence = match[2];
  return competence - 1;
}
M.getLevel = function (ac) {
  const match = ac.match(/AC(\d)(\d)/);
  const level = match[1];
  return level;
}


M.getCompName = function (competence) {
  console.log(M.data);
  let comp = M.data[competence];
  return comp;
};
// données sous forme de tableau
M.data = [];
M.user = null;

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

M.getAcProg = function(ac) {
  // let user = M.user;
  
  return User.getAcProgress(ac);
}
// gestion progression utilisateur

M.getProgress = function (ac) 
{
  let data = ProgressStorage.load();
  let result = ProgressStorage.getAcProgress(ac);
  console.log("Progress for AC", ac, "is", result);

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



// Handler pour le clic sur une compétence (zoom)
C.handlerCompetenceClick = function (comp, Wall) {
  return (ev) => {
    if (ev.target.id.startsWith("AC")) return;
    
    ev.stopPropagation();
    let box = comp.getBBox();
    
    if (!comp.clicked) {
      gsap.to(Wall, { attr: { viewBox: box.x + " " + box.y + " " + box.width + " " + box.height } });
      comp.clicked = true;
      
      const labels = document.querySelectorAll('.ac-label');
      labels.forEach(label => {
        gsap.to(label, { attr: { opacity: 1 }, duration: 0.5 });
      });
    } else {
      comp.clicked = false;
      gsap.to(Wall, { attr: { viewBox: "0 0 1440 1025" } });
      
      const labels = document.querySelectorAll('.ac-label');
      labels.forEach(label => {
        gsap.to(label, { attr: { opacity: 0 }, duration: 0.5 });
      });
    }
  };
};

// Handler pour reset au clic sur le background
C.handlerBackgroundClick = function (comps, Wall) {
  return () => {
    gsap.to(Wall, { attr: { viewBox: "0 0 1440 1025" } });
    comps.forEach(comp => comp.clicked = false);
    
    const labels = document.querySelectorAll('.ac-label');
    labels.forEach(label => {
      gsap.to(label, { attr: { opacity: 0 }, duration: 0.5 });
    });
  };
};
// const container = document.querySelector('.svg-demo1-container');



C.syncProgressLocally = function() {
  
};


C.updateProgBarVisual = function( color,currentProgress) {
  let root = V.rootPage;
  let popup = root.querySelector(".popup");
   let progress = popup.querySelector(".ac-card__progress-bar");
  progress.style.background =
    "linear-gradient(90deg, " + color  + ", transparent " + currentProgress+"%)";
  console.log(progress);
  popup.classList.add("active");
}

// s'execute à la mise à jour du slider du composant ACDetails
// 
C.handlerUpdateProgress = function(ev,id,color) {
  console.log("Handler update progress bar called", id);
 let levelProgress= parseInt(ev.target.value);
  // let root = ;
  // Mettre à jour la barre de progression visuelle
  
  // V.popupAC.uptadeProgressBar(levelProgress);
  // let levelProgress = M.getProgress(ev.target.id);
  // let color = M.getColor(id);
  V.flowers.UpdateProgress(id,color, levelProgress);
  User.updateAcProgress(id, levelProgress);
  C.updateProgBarVisual( color,levelProgress);
  console.log(User.getAcProgress(id));
  
}

C.init = function () {
  M.loadData();
  M.progress = ProgressStorage.load(); // Charger la progression au démarrage
  M.user = User.load();
  return V.init();
  
};
// C.handlerUpdateProgress = function(ev) {
//   }


let V = {
  rootPage: null,
  flowers: null,
};



V.attachEvents = function (root) {
  root.addEventListener("click", C.handler_clickAC);
  
  let Wall = root.querySelector("#wall");
  let bg = root.querySelector("#prototype");
  
  let comps = [
    root.querySelector("#Entreprendre"),
    root.querySelector("#Développer"),
    root.querySelector("#Exprimer"),
    root.querySelector("#Concevoir"),
    root.querySelector("#Comprendre")
  ].filter(c => c !== null);
  
  // Attacher les zooms sur chaque compétence
  comps.forEach((comp) => {
    comp.clicked = false;
    comp.addEventListener("click", C.handlerCompetenceClick(comp, Wall));
  });
  
  // Reset au clic du background
  bg.addEventListener("click", C.handlerBackgroundClick(comps, Wall));

  
};

// V.attachPopupEvents = function (root) {
//   root.addEventListener("input",  C.handlerUpdateProgressBar);
//   console.log("Popup events attached");
 
// };

V.renderACNames = async function () {
  let acCode = "";
  let ACList = Array.from(V.rootPage.querySelectorAll('[id^="AC"]')).filter(el => !el.id.includes('container'));
  for (let acElement of ACList) {
    acCode = await M.getAcData(acElement.id);
    // console.log("AC element:", acElement.id, "Data:", acCode);
      if (acCode) {
        // Set a data attribute with the code
        acElement.setAttribute('data-ac-code', acCode.code);
        
        // Récupérer la bounding box de l'élément AC
        const bbox = acElement.getBBox();
        let x = bbox.x + bbox.width / 2;  // Centre horizontal
        let y = bbox.y - 5;  // Légèrement au-dessus
        
        // Vérifier que le label reste dans les limites du SVG
        const SVG_WIDTH = 1440;
        const SVG_HEIGHT = 1025;
        const LABEL_OFFSET = 30;
        
        // Adapter la position si trop proche des bords
        if (x < LABEL_OFFSET) x = LABEL_OFFSET;
        if (x > SVG_WIDTH - LABEL_OFFSET) x = SVG_WIDTH - LABEL_OFFSET;
        if (y < 10) y = 15;
        if (y > SVG_HEIGHT - 10) y = SVG_HEIGHT - 10;
        
        // Créer le label SVG
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        let color = M.getColor(acCode.code);
        
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('font-size', '6');
        textEl.setAttribute('fill', color);
        textEl.setAttribute('opacity', '0');
        textEl.setAttribute('class', 'ac-label');
        textEl.setAttribute('text-anchor', 'middle');  // Centrer le texte
        textEl.textContent = acCode.code;
        acElement.parentElement.appendChild(textEl);
        
    }
    else{
    console.warn("No data found for AC:", acElement.id);}
  }
};


V.renderACDetails = async function (ac) {
  
  // Récupérer le template de la vue AC
  let acElement = V.popupAC.html();
  // Remplir le template avec les données de l'AC
  let acData = await M.getAcData(ac);
  acElement = acElement.replaceAll("{{code}}", acData.code);
  acElement = acElement.replace("{{libelle}}", acData.libelle);


 // trouver le container popup
  let root = V.rootPage;
  let popupSlot = root.querySelector('div[name="popup"]');

  //  définir la couleur en fonction de la compétence
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
  // gestion des events
   let competenceId = M.getCompPos(ac)   ;
   let competenceName = M.getCompName(competenceId);
  //  console.log(competenceId);
   let user = await M.user;
   
   
   let level = M.getLevel(ac); // extraire le niveau depuis l'ID de l'AC
  // const currentProgress = user.competences[competenceName.nom_court].levelProgress[level];
  const currentProgress = M.getAcProg(ac);
  console.log(  currentProgress);
    const slider = popup.querySelector('#progress-slider');
  const percentageDisplay = popup.querySelector('.ac-card__percentage');
  percentageDisplay.textContent = currentProgress + '%';

    console.log(slider);
      slider.addEventListener('input',(ev) => C.handlerUpdateProgress(ev,ac,color));
    slider.value = currentProgress; 

  //  styliser et gérer la barre de progression
  let progress = popup.querySelector(".ac-card__progress-bar");
  progress.style.background =
    "linear-gradient(90deg, " + color  + ", transparent " + currentProgress+"%)";
  console.log(progress);
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
  V.popupAC = new AcView();
  // V.rootPage.zoomOnAC;
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.flowers.dom());
  V.attachEvents(V.rootPage);
  V.renderACNames();
  return V.rootPage;
};

export function SvgDemo1Page() {
  return C.init();
}
