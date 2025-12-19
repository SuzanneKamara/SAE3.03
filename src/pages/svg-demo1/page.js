// imports
import { FlowerView, AcView, HistoricView } from "@/ui/flower";
import { htmlToDOM } from "@/lib/utils.js";
import { ProgressStorage } from "@/data/progressStorage.js";
import template from "./template.html?raw";
import { gsap } from "gsap";
import { Animation } from "@/lib/animation.js";
import { User } from "@/data/user.js";
import Data from "@/data/data.json";

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

M.getCompShortName = function (competence) {
  let data = M.getCompData(competence);
  console.log(data.nom_court);
  return data.nom_court;
}

// a modifier
M.getCompData = function (competence) {
  // console.log(M.data);
  let comp = M.data[competence];
  return comp;
};
// données sous forme de tableau
M.data = [];
M.user = null;

M.loadData = async function () {
  
  M.data = Data;
  // console.log(M.data);
  return M.data;
};

M.getAcData = async function (ac) {
  let result = null;
  let data = await M.loadData();
  // console.log(data);

  const match = ac.match(/AC(\d)(\d)/);

  const competence = match[2];
  const annee = match[1];
  let comp = M.getCompData(competences[competence - 1]);
  // console.log(comp);
  // let Com = data[competences[competence - 1]];
  // console.log(Com);
  let niv = comp.niveaux;
  let niveau = niv[annee - 1];
  let acs = niveau.acs;
  result = acs.find((x) => x.code === ac);

  // console.log(result);
  return result;
};

M.getAcProg = function(ac) {
  // let user = M.user;
  console.log(User.getAcProgress(ac));
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

M.getHistoricData =async function(ac) {
  const notifData = await User.getACNotificationData(ac);
return notifData;
}

// contrôleur de la page
let C = {};
C.handlerAddToHistoric = async function(ac) {
  let data = await M.getHistoricData(ac);
  historyView.addNotification(data);
}

// Vérifier l'état du dialog historique
C.openCheck = function(dialog, overlay) {
  if (dialog.classList.contains("active")) {
    console.log("Dialog historique ouvert");
  } else {
    console.log("Dialog historique fermé");
  }
};

// Ouvrir le dialog de l'historique
C.openHistoryDialog = function() {
  const dialog = V.historicView.root.querySelector("#history-dialog");
  const overlay = V.historicView.root.querySelector("#history-overlay");
  if (dialog && overlay) {
    dialog.classList.add("active");
    overlay.classList.add("active");
    V.renderHistory();
    C.openCheck(dialog, overlay);
  }
};

// Fermer le dialog de l'historique
C.closeHistoryDialog = function() {
  const dialog = V.historicView.root.querySelector("#history-dialog");
  const overlay = V.historicView.root.querySelector("#history-overlay");
  if (dialog && overlay) {
    dialog.classList.remove("active");
    overlay.classList.remove("active");
    C.openCheck(dialog, overlay);
  }
};

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

// Tracker la dernière valeur du slider (pas de sauvegarde immédiate)
C.sliderValueTracker = {};

// S'execute à la mise à jour du slider du composant ACDetails
// (mise à jour visuelle seulement, pas d'enregistrement)
C.handlerUpdateProgress = function(ev,id,color) {
  console.log("Handler update progress bar called", id);
  let levelProgress = parseInt(ev.target.value);
  
  // Tracker la valeur actuelle
  C.sliderValueTracker[id] = levelProgress;
  
  // Vérifier que l'élément AC existe avant d'animer
  const acElement = V.rootPage.querySelector("#" + id.replace(/\./g, '\\.'));
  if (acElement) {
    // Mise à jour visuelle SEULEMENT
    V.flowers.UpdateProgress(id, color, levelProgress);
  }
  
  C.updateProgBarVisual(color, levelProgress);
  
  // Mettre à jour l'affichage du pourcentage en temps réel
  const percentageDisplay = V.rootPage.querySelector('.ac-card__percentage');
  if (percentageDisplay) {
    percentageDisplay.textContent = levelProgress + '%';
  }
};

// Sauvegarder la progression quand le popup se ferme
C.saveFinalProgress = function(acId) {
  const finalValue = C.sliderValueTracker[acId];
  if (finalValue !== undefined && finalValue !== null) {
    User.updateAcProgress(acId, finalValue);
    V.renderHistory(); // Mettre à jour l'affichage de l'historique
    C.applyProgressGradients(); // Mettre à jour les dégradés de progression
    let comp = M.getComp(acId)
    ;
    console.log(M.getComp(acId));
    console.log("Vérification du niveau pour la compétence", comp);
    C.checkLevelCompletion(comp); // Vérifier si un niveau est complété
    delete C.sliderValueTracker[acId];
  }
}

// Vérifier si un niveau est complété (65%)
C.checkLevelCompletion = function(competenceId) {
  const annees = ["BUT1", "BUT2", "BUT3"];
  
  // S'assurer que User.data et completedLevels existent
  if (!User.data) return; // Ne pas créer de nouvelles données vides
  
  if (!User.data.completedLevels) {
    User.data.completedLevels = {};
  }
  
  annees.forEach(annee => {
    const averageProgress = C.calculateCompLevelAverage(competenceId, annee);
    
    console.log(`Moyenne ${annee}:`, averageProgress + "%");
    
    // Créer une clé unique pour cette compétence et ce niveau
    const levelKey = competenceId + "_" + annee;
    
    // Si la moyenne atteint 65%, marquer comme complété
    if (averageProgress >= 65) {
      User.data.completedLevels[levelKey] = true;
      C.activateGlowEffect(annee, competenceId);
      console.log(`✓ Niveau ${annee} marqué comme complété pour ${competenceId}`);
    } else {
      // Si en dessous de 65%, retirer du marquage
      delete User.data.completedLevels[levelKey];
      C.removeGlowEffect(annee, competenceId);
      console.log(`✗ Niveau ${annee} marqué comme non-complété pour ${competenceId}`);
    }
  });
  
  // Sauvegarder l'état dans localStorage
  ProgressStorage.update(User.data);
};
C.calculateCompLevelAverage = function(competenceId, niveau) {
  // Récupérer tous les AC du niveau depuis les données de compétence
  const match = niveau.match(/BUT(\d)/);
  const level = match[1];
  
  // Utiliser les données de M.data pour les AC disponibles
  let compAc = [];
  const compData = M.getCompData(competenceId);
  
  if (compData && compData.niveaux && compData.niveaux[level - 1]) {
    let levelData = compData.niveaux[level - 1];
    compAc = levelData.acs || [];
  }
  
  if (compAc.length === 0) return 0;
  
  // Calculer la moyenne en utilisant les ACs progressions de User.data
  let totalProgress = 0;
  let acCount = 0;
  
  compAc.forEach(ac => {
    const progress = User.getAcProgress(ac.code) || 0;
    totalProgress += progress;
    acCount++;
  });
  
  return acCount > 0 ? Math.round(totalProgress / acCount) : 0;
}
// Calculer la moyenne de progression pour un niveau
// C.calculateLevelAverage = function(niveau) {
//   // Récupérer tous les AC du niveau
//   const match = niveau.match(/BUT(\d)/);
//   const level = match[1];
  
//   let totalProgress = 0;
//   let acCount = 0;
  
//   // Parcourir les 5 compétences
//   competences.forEach((compId) => {
//     for (let i = 1; i <= 5; i++) {
//       const acId = "AC" + level + i;
//       const progress = User.getAcProgress(acId) || 0;
//       totalProgress += progress;
//       acCount++;
//     }
//   });
  
//   return acCount > 0 ? Math.round(totalProgress / acCount) : 0;
// };

// Activer l'effet glow pour un niveau complété
C.activateGlowEffect = function(niveau, competenceId) {
  // Noms des compétences SVG avec leurs IDs correspondants
 
  
  // Récupérer le nom de la compétence
  // const compName = competenceMap[competenceId];
  console.log("Activation du glow pour", competenceId, niveau);
  let compName = M.getCompShortName(competenceId);
  // console.log("Sélection du groupe pour", compName, niveau);
  if (!compName) {
    console.warn(`Compétence ${competenceId} non reconnue`);
    return;
  }
  
  const levelNum = niveau.match(/BUT(\d)/)[1];
  // let level = annees[levelNum - 1];
  // Sélectionner SEULEMENT le groupe de cette compétence et ce niveau
  
  const groupComp = V.rootPage.querySelector("#" + compName);
  if (!groupComp) return;
  
  const groupLevel = groupComp.querySelector("#" + niveau);
  const group = Array.from(groupLevel.querySelectorAll("[id*='AC']")).filter(el => el.id.includes('container') );
  console.log("Groupe sélectionné:", groupLevel, group);
  if (group) {
    // Boucle sur les 5 compétences pour appliquer le glow
    for (let i = 0; i < group.length; i++) {
      let ac = group[i];
        ac.classList.add("glow-effect");
        ac.style.setProperty('--glow-color', M.getColor(ac.id.replace('container','')));
      }
      
    // console.log(`✓ Glow effect persistant activé pour ${compName} ${niveau} avec couleur ${M.getColor(acId)}`);
    }
    
  }
;

// Retirer l'effet glow pour un niveau non complété
C.removeGlowEffect = function(niveau, competenceId) {
  // Noms des compétences SVG avec leurs IDs correspondants
  const competenceMap = {
    "688548e4666873aa7a49491ba88a7271": "Comprendre",
    "786d957f2fd89908751ca0ea0a835a37": "Concevoir",
    "6a5a25b106187717ff27758e789dbde8": "Exprimer",
    "bdeb25b7e21ebc4dc5f3c0f97db7285e": "Développer",
    "689e945289af4e30650a910291c38e8a": "Entreprendre"
  };
  
  // Récupérer le nom de la compétence
  const compName = competenceMap[competenceId];
  if (!compName) return;
  
  const levelNum = niveau.match(/BUT(\d)/)[1];
  
  // Boucle sur les 5 AC pour retirer le glow
  for (let i = 1; i <= 5; i++) {
    const acId = "AC" + levelNum + i;
    const acElement = V.rootPage.querySelector("#" + acId);
    
    if (acElement) {
      acElement.classList.remove("glow-effect");
      acElement.style.removeProperty('--glow-color');
    }
  }
  
  console.log(`✗ Glow effect retiré pour ${compName} ${niveau}`);
};

// Appliquer les dégradés de progression sur les ACs
C.applyProgressGradients = function() {
  // Créer ou récupérer la section <defs> du SVG pour les dégradés
  const svgElement = V.rootPage.querySelector('svg');
  let defs = svgElement.querySelector('defs');
  
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgElement.insertBefore(defs, svgElement.firstChild);
  }
  
  // Parcourir tous les AC et appliquer le dégradé
  const acElements = V.rootPage.querySelectorAll('[id^="AC"]');
  
  acElements.forEach(acElement => {
    const acId = acElement.id;
    
    // Ignorer les containers et les backgrounds
    if (acId.includes('container') || acId.includes('background')) {
      return;
    }
    
    // Ignorer les ACs qui ont le glow effect (niveaux complétés)
    if (acElement.classList.contains('glow-effect')) {
      console.log(`⊘ Dégradé ignoré pour ${acId} (glow effect actif)`);
      return;
    }
    
    // Récupérer la progression actuelle de cet AC
    const progress = User.getAcProgress(acId) || 0;
    
    // Récupérer la couleur de la compétence basée sur le numéro du AC
    const color = M.getColor(acId);
    
    // Créer un ID safe pour le gradient (remplacer les points par des tirets)
    const gradientId = `gradient_${acId.replace(/\./g, '_')}`;
    
    // Chercher ou créer le gradient
    let gradient = Array.from(defs.children).find(el => el.getAttribute('id') === gradientId);
    
    if (!gradient) {
      gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', gradientId);
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '0%');
      defs.appendChild(gradient);
    }
    
    // Vider et recréer les stops du gradient
    gradient.innerHTML = '';
    
    // Stop 1: Couleur de la compétence au début
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', color);
    stop1.setAttribute('stop-opacity', '1');
    gradient.appendChild(stop1);
    
    // Stop 2: Transition à la progression actuelle
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', progress + '%');
    stop2.setAttribute('stop-color', color);
    stop2.setAttribute('stop-opacity', '1');
    gradient.appendChild(stop2);
    
    // Stop 3: Noir à partir de la progression actuelle jusqu'à 100%
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', progress + '%');
    stop3.setAttribute('stop-color', '#000000');
    stop3.setAttribute('stop-opacity', '1');
    gradient.appendChild(stop3);
    
    // Appliquer le dégradé au fill de l'AC
    acElement.setAttribute('fill', `url(#${gradientId})`);
    
    console.log(`✓ Dégradé appliqué pour ${acId} (progression: ${progress}%)`);
  });
};

// créer des boutons d'export et d'import
C.handlerExport =  function() { 
  User.export();
 };


//  utilisation d'une boite de dialogue pour sélectionner un fichier JSON à importer
 C.handlerImportJson = async function(jsonData) {
  // Remplacer complètement User.data par les données importées
  User.data = jsonData;
  
  // Sauvegarder dans localStorage
  ProgressStorage.update(User.data);
  
  // Mettre à jour l'affichage de l'historique
  V.renderHistory();
  
  // Mettre à jour les dégradés de progression
  C.applyProgressGradients();
  
  // Mettre à jour les glows effects avec les nouvelles données
  competences.forEach((compId) => {
    C.checkLevelCompletion(compId);
  });
  
  console.log("✓ Données importées avec succès", User.data);
  alert("Données importées avec succès!");
 };

C.handlerImportProof = async function(acId, file) {
  // 1. Valider: type === "application/pdf"
  if (!file || file.type !== "application/pdf") {
    alert("Veuillez sélectionner un fichier PDF");
    return;
  }

  // 2. Valider la taille (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    alert("Le fichier dépasse 10MB. Veuillez choisir un fichier plus petit.");
    return;
  }

  // 3. Créer une URL pour le fichier (blob URL)
  const fileUrl = URL.createObjectURL(file);
  const uploadDate = new Date().toISOString();

  // 4. Initialiser la structure de preuves si elle n'existe pas
  if (!User.data.proofs) {
    User.data.proofs = {};
  }
  if (!User.data.proofs[acId]) {
    User.data.proofs[acId] = [];
  }

  // 5. Ajouter la preuve à User.data.proofs[acId]
  const proof = {
    name: file.name,
    uploadDate: uploadDate,
    url: fileUrl,
    size: (file.size / 1024).toFixed(2) + " KB" // Pour affichage
  };

  User.data.proofs[acId].push(proof);
  console.log(`Preuve ajoutée pour ${acId}:`, proof);

  // 6. Mettre à jour l'affichage de la liste des preuves
  V.displayProofs(acId);

  // 7. Sauvegarder via ProgressStorage
  ProgressStorage.update(User.data);

  // 8. Notification utilisateur
  console.log(`✓ Preuve "${file.name}" importée avec succès pour ${acId}`);
};



C.init = async function () {
  M.loadData();
  M.progress = ProgressStorage.load(); // Charger la progression au démarrage
  await User.load(); // ATTENDRE que les données soient chargées
  
  // Initialiser la page et ses éléments SVG d'abord
  let root = V.init();
  competences.forEach((compId) => {
    C.checkLevelCompletion(compId);
  });
  // S'assurer que la structure completedLevels existe (sans écraser les données)
  // if (User.data && !User.data.completedLevels) {
  //   User.data.completedLevels = {};
  // }
  
  // Vérifier que User.data existe
  // if (User.data && User.data.completedLevels) {
  //   Object.keys(User.data.completedLevels).forEach(levelKey => {
  //     if (User.data.completedLevels[levelKey]) {
  //       // Extraire le niveau de la clé (ex: "688548e4666873aa7a49491ba88a7271_BUT1" -> "BUT1")
  //       const niveau = levelKey.split("_")[1];
  //       C.activateGlowEffect(niveau, M.getComp());
  //       console.log(`✓ Glow restauré pour niveau ${niveau}`);
  //     }
  //   });
  // }
  
  // Vérifier et mettre à jour les niveaux complétés (après que V.rootPage soit initialisé)
  // Les appeler directement sans attendre M.data car les ACs progressions sont dans User.data
  // competences.forEach((compId) => {
  //   C.checkLevelCompletion(compId);
  // });
  
  // Appliquer les dégradés de progression sur les ACs
  C.applyProgressGradients();
  
  return root;
};
// C.handlerUpdateProgress = function(ev) {
//   }


let V = {
  rootPage: null,
  flowers: null,
};

// Rendu de l'historique
V.renderHistory = function() {
  const notificationsList = V.rootPage.querySelector("#notifications-list");
  const history = User.getHistorySorted();

  // Vider la liste
  notificationsList.innerHTML = '';

  if (history.length === 0) {
    notificationsList.innerHTML = '<p class="empty-state">Aucune modification enregistrée</p>';
    return;
  }

  // Rendre chaque notification
  history.forEach(entry => {
    const notif = V.createNotificationElement(entry);
    notificationsList.appendChild(notif);


    
    // Export
  const exportBtn = document.querySelector("#export-data-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", C.handlerExport);
  }
  
  // Import
  const importBtn = document.querySelector("#import-data-btn");
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        const text = await file.text();
        const data = JSON.parse(text);
        C.handlerImportJson(data);
      });
      input.click();
    });
  }
  });
};

// Effacer l'historique
V.clearHistory = function() {
  User.clearHistory();
  V.renderHistory();
  console.log("Historique effacé");
};

// Créer un élément de notification à partir du template
V.createNotificationElement = function(entry) {
  const template = V.rootPage.querySelector("#notification-template");
  const clone = template.content.cloneNode(true);

  // Remplir les éléments du template
  const acCodeEl = clone.querySelector(".notification-ac-code");
  const dateEl = clone.querySelector(".notification-date");
  const titleEl = clone.querySelector(".notification-title");
  const progressFill = clone.querySelector(".progress-fill");
  const progressPercentage = clone.querySelector(".progress-percentage");
  const competenceBadge = clone.querySelector(".notification-competence");

  // Formater la date
  const dateObj = new Date(entry.date);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Assigner les données
  acCodeEl.textContent = entry.acId;
  dateEl.textContent = formattedDate;
  titleEl.textContent = entry.libelle;
  progressFill.style.width = entry.progress + '%';
  progressPercentage.textContent = entry.progress + '%';
  competenceBadge.textContent = entry.competence;
  competenceBadge.style.backgroundColor = entry.color;

  return clone;
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

  // Événements du dialog historique (chercher dans V.historicView.root)
  const historicRoot = V.historicView.root;
  
  const historyBtn = historicRoot.querySelector("#history-btn-svg");
  if (historyBtn) {
    historyBtn.addEventListener("click", C.openHistoryDialog);
  }

  const closeBtn = historicRoot.querySelector(".sidebar-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", C.closeHistoryDialog);
  }

  const clearBtn = historicRoot.querySelector("#clear-history");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Êtes-vous sûr de vouloir effacer tout l'historique ?")) {
        V.clearHistory();
      }
    });
  }

  // Export des données
  const exportHistoryBtn = historicRoot.querySelector("#export-history-btn");
  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener("click", C.handlerExport);
  }

  // Import des données
  const importHistoryBtn = historicRoot.querySelector("#import-history-btn");
  if (importHistoryBtn) {
    importHistoryBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          const text = await file.text();
          const data = JSON.parse(text);
          C.handlerImportJson(data);
        }
      });
      input.click();
    });
  }

  // Fermer l'historique en cliquant sur l'overlay
  const historyOverlay = historicRoot.querySelector("#history-overlay");
  if (historyOverlay) {
    historyOverlay.addEventListener("click", C.closeHistoryDialog);
  }
};

// V.attachPopupEvents = function (root) {
//   root.addEventListener("input",  C.handlerUpdateProgressBar);
//   console.log("Popup events attached");
 
// };

V.renderACNames = async function () {
  let acCode = "";
  let ACList = Array.from(V.rootPage.querySelectorAll('[id*="AC"]')).filter(el => !el.id.includes('container'));
  for (let acElement of ACList) {
    acCode = await M.getAcData(acElement.id);
    // console.log("AC element:", acElement.id, "Data:", acCode);
      if (acCode) {
        // Set a data attribute with the code
        // acElement.setAttribute('data-ac-code', acCode.code);
        
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
    C.saveFinalProgress(ac); // Sauvegarder la progression finale
  });


  // styliser le popup
  let popup = root.querySelector(".popup");
  popup.style.outline = "5px solid " + color;
  // gestion des events
   let competenceId = M.getCompPos(ac)   ;
   let competenceName = M.getCompData(competenceId);
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
      C.saveFinalProgress(ac); // Sauvegarder la progression finale
      overlay.classList.remove("active");
      popup.classList.remove("active");
    });

    V.displayProofs(ac); // Afficher les preuves associées à cet AC

    // Gestion du bouton d'import de preuve
    const importProofBtn = popup.querySelector("#import-proof-btn");
    if (importProofBtn) {
      importProofBtn.addEventListener("click", () => {
        // Créer un input de type fichier
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "application/pdf";
        fileInput.addEventListener("change", (event) => {
          const file = event.target.files[0];
          C.handlerImportProof(ac, file);
        });
        fileInput.click();
      });
    }
};}

V.renderHistoric = function(data) {
  let root = V.rootPage;
  let historyView = new HistoricView();
  historyView.addNotification(data);
  let historicSlot = root.querySelector('div[name="historic"]');
  historicSlot.replaceWith(historyView.dom());
}

V.displayProofs = function(acId) {
  const proofsList = V.rootPage.querySelector("#proofs-list");
  if (!proofsList) return;

  const proofs = User.data.proofs?.[acId] || [];

  if (proofs.length === 0) {
    proofsList.innerHTML = '<p class="empty-proofs">Aucune preuve importée</p>';
    return;
  }

  proofsList.innerHTML = proofs
    .map((proof, index) => `
      <div class="proof-item">
        <div class="proof-info">
          <a href="${proof.url}" target="_blank" class="proof-link">
             ${proof.name}
          </a>
          <small class="proof-meta">
            ${new Date(proof.uploadDate).toLocaleDateString('fr-FR')} 
            • ${proof.size}
          </small>
        </div>
        <button class="btn-delete-proof" data-ac="${acId}" data-index="${index}">
          ✕
        </button>
      </div>
    `)
    .join("");

  // Attacher les événements de suppression
  proofsList.querySelectorAll(".btn-delete-proof").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const ac = e.target.dataset.ac;
      const idx = parseInt(e.target.dataset.index);
      User.data.proofs[ac].splice(idx, 1);
      ProgressStorage.update(User.data);
      V.displayProofs(ac);
    });
  });
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.flowers = new FlowerView();
  V.popupAC = new AcView();
  V.historicView = new HistoricView();
  
  // Injecter le templateHistoric dans le slot
  const historicSlot = V.rootPage.querySelector('slot[name="historic"]');
  if (historicSlot) {
    historicSlot.replaceWith(V.historicView.dom());
  }
  
  // V.rootPage.zoomOnAC;
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.flowers.dom());
  V.attachEvents(V.rootPage);
  V.renderACNames();
  return V.rootPage;
};

export function SvgDemo1Page() {
  return C.init();
}
