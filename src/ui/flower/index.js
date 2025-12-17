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

  // uptadeProgressBar(progress){
  //   // let elt = this.root.querySelector('[id="'+acId+'"]');
  //   let progressBar = this.root.querySelector('.ac-card__progress-bar');
  //   // let color = this.getAcColor();
  //   let rootAc = this.root
  //   let pourcentage=rootAc.querySelector('.ac-card__percentage');
  //   console.log(pourcentage);
  //   pourcentage.textContent=progress + '%';
  //   progressBar.style.background ="linear-gradient("+progress+",red 0%, white 100%)";
  
  //   // progressBar.style.width = progress + '%';
  //   // progressBar.textContent = progress + '%';
  // }
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
export { FlowerView, AcView };