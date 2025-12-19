import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
class HistoricView {
  constructor() {
    this.root = htmlToDOM(template);
  }
  html() {
    return template;
  }
  dom() {
    return this.root;
  }
  addNotification(data) {
    const notifTemplate = this.root.querySelector('#notification-template');
    const clone = notifTemplate.content.cloneNode(true);
    
    // Remplir les éléments du template
    const acCodeEl = clone.querySelector(".notification-ac-code");
    const dateEl = clone.querySelector(".notification-date");
    const titleEl = clone.querySelector(".notification-title");
    const progressFill = clone.querySelector(".progress-fill");
    const progressPercentage = clone.querySelector(".progress-percentage");
    const competenceBadge = clone.querySelector(".notification-competence");

    // Formater la date
    const dateObj = new Date(data.date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Assigner les données
    if (acCodeEl) acCodeEl.textContent = data.ac;
    if (dateEl) dateEl.textContent = formattedDate;
    if (titleEl) titleEl.textContent = data.libelle;
    if (progressFill) progressFill.style.width = data.progress + '%';
    if (progressPercentage) progressPercentage.textContent = data.progress + '%';
    if (competenceBadge) {
      competenceBadge.textContent = data.competence;
      competenceBadge.style.backgroundColor = data.color;
    }

    const container = this.root.querySelector('#notifications-list');
    if (container) {
      container.appendChild(clone);
    }
  }
}
export { HistoricView };