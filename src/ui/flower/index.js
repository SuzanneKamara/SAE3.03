import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateACDetails from "./template-ac-details.html?raw";
import templateHistoric from "./templateHistoric.html?raw";
class AcView {
  constructor() {
    this.root = htmlToDOM(templateACDetails);
  }
  html() {
    return templateACDetails;
  }

  dom() {
    return this.root;
  }
}

class FlowerView {

  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }
  getCompetence(competence){
    return this.root.querySelector('[id="'+competence+'"]');
  }
  getAC(ac){
    return this.root.querySelector('[id="'+ac+'"]');
  }
  getLevel(level,competence){
   let comp = this.root.querySelector('[id="'+competence+'"]');
   return comp.querySelector('[id="'+level+'"]');

  }

  startGlow(ac){              
  let appCrit = this.root.querySelector('[id="'+ac+'"]');
  let glow = appCrit.querySelector('[id="background"]');
  glow.style.display.block; 
  }

  UpdateProgress(ac,color, progress){
    let appCrit = this.root.querySelector('[id="'+ac+'"]');
    // let color = appCrit.getAcColor(ac);
    appCrit.style.fill = `linear-gradient(to right, ${color} ${progress}%, #ddd ${progress}% 100%)`;
   }

 
resetZoom() {
  const svg = this.root
  svg.style.transform = 'scale(1)';
  svg.style.transformOrigin = 'center';
}




  getVisibleElements(){
  // Récupère tous les enfants du root
  const allElements = this.root.querySelectorAll('*');
  const visibleElements = [];
  
  allElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    // Vérifier si l'élément est visible dans le viewport
    if(rect.width > 0 && rect.height > 0){
      visibleElements.push(el);
    }
  });
  
  return visibleElements;
}



    rotateCircle(){
    let isMouseActive = false;
    
    // Détecter l'activité de la souris
    document.addEventListener('mousemove', () => {
      isMouseActive = true;
      clearInterval(rotationInterval);
    });
    
    document.addEventListener('mouseleave', () => {
      isMouseActive = false;
      startRotation();
    });
    
    const startRotation = () => {
      if (!isMouseActive) {
        const circles = this.root.querySelectorAll('#Compétence');
        let angle = 0;
        circles.forEach(circle => {
          const rotationInterval = setInterval(() => {
          angle = (angle + 1) % 360;
          circle.style.transform = `rotate(${angle}deg)`;
        }, 100);
        });
        
      }
    };
    
    startRotation();
  }
  
 
}

class HistoricView {
  constructor() {
    this.root = htmlToDOM(templateHistoric);
  }
  html() {
    return templateHistoric;
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
export { FlowerView, AcView, HistoricView };