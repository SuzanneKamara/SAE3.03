import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateACDetails from "./template-ac-details.html?raw";

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
  zoomOnAC(){
    let visibleElements = [];
  
  if(window.innerWidth < 600){
    // Mobile : récupérer tous les éléments visibles
    visibleElements = this.getVisibleElements();
    let ACs = visibleElements.filter(el => el.id && el.id.startsWith('AC'));
    ACs.forEach(ac => {
      let label = ac.id;
      ac.style.setProperty('--before-content', `"${label}"`);
    });
  }
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
export { FlowerView, AcView };