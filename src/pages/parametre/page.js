// imports
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { User } from "@/data/user.js";

// Contrôleur
let C = {};

C.openHistoryDialog = function() {
  const dialog = V.rootPage.querySelector("#history-dialog");
 
    dialog.showModal();
    C.renderHistory();
  
};

C.closeHistoryDialog = function() {
  const dialog = V.rootPage.querySelector("#history-dialog");
  if (dialog) {
    dialog.close();
  }
};

C.clearHistory = function() {
  User.clearHistory();
  C.renderHistory();
  console.log("Historique effacé");
};

// Rendu de l'historique
C.renderHistory = function() {
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
  });
};

// Vue
let V = {
  rootPage: null
};

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

V.attachEvents = function(root) {
  // Bouton d'ouverture du dialog
  const historyBtn = root.querySelector("#history-btn");
  if (historyBtn) {
    historyBtn.addEventListener("click", C.openHistoryDialog);
  }

  // Bouton de fermeture du dialog (X)
  const closeBtn = root.querySelector(".dialog-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", C.closeHistoryDialog);
  }

  // Bouton "Fermer" dans le footer
  const closeBtnFooter = root.querySelector("#close-dialog");
  if (closeBtnFooter) {
    closeBtnFooter.addEventListener("click", C.closeHistoryDialog);
  }

  // Bouton "Effacer l'historique"
  const clearBtn = root.querySelector("#clear-history");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Êtes-vous sûr de vouloir effacer tout l'historique ?")) {
        C.clearHistory();
      }
    });
  }

  // Fermer le dialog au clic sur le backdrop
  const dialog = root.querySelector("#history-dialog");
  if (dialog) {
    dialog.addEventListener("click", (ev) => {
      if (ev.target === dialog) {
        C.closeHistoryDialog();
      }
    });
  }
};

V.init = function() {
  V.rootPage = htmlToDOM(template);
  V.attachEvents(V.rootPage);
  return V.rootPage;
};

C.init = async function() {
  // Charger les données utilisateur et AC
  await User.load();
  return V.init();
};

export function ParametrePage() {
  return C.init();
}
