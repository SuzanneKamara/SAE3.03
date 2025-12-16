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
//   zoomOnCompetence(competenceId){
//   //   let visibleElements = [];
  
//   // if(window.innerWidth < 600){
//     // Mobile : récupérer tous les éléments visibles
//     // visibleElements = this.getVisibleElements();
//     // let ACs = visibleElements.filter(el => el.id && el.id.startsWith('AC'));
//     // ACs.forEach(ac => {
//     //   let label = ac.id;
//     //   ac.style.setProperty('--before-content', `"${label}"`);
//     // });
//   console.log("zoomOnCompetence called with id:", competenceId);
//     const competence = this.getCompetence(competenceId);
//   if (!competence) return;
//    const bbox = competence.getBBox();
//   const centerX = bbox.x + bbox.width / 2;
//   const centerY = bbox.y + bbox.height / 2;
// const svg = this.root;
//   const svgRect = svg.getBoundingClientRect();

//   // Convertir en pourcentage pour transform-origin
//   const x = (centerX / bbox.width) * 100;
//   const y = (centerY / bbox.height) * 100;

//   // Appliquer le zoom centré sur la compétence
//   svg.style.transformOrigin = `${x}% ${y}%`;
//   svg.style.transform = 'scale(2)';
//   }
  // zoomOnCompetence(){
   
  // }
 
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
export { FlowerView, AcView };