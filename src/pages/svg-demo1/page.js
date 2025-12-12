import { FlowerView, AcView } from "@/ui/flower";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
// import j,,templateACDetails from "./template-ac-details.html?raw";
let M = {};
M.data= [];
M.loadData=async function(){
  let response = await fetch('/src/data/data.json');
M.dataJson = await response.json();
M.data = Object.values(M.dataJson);
  return M.data;

}
let competences = ['688548e4666873aa7a49491ba88a7271', '786d957f2fd89908751ca0ea0a835a37', '6a5a25b106187717ff27758e789dbde8', 'bdeb25b7e21ebc4dc5f3c0f97db7285e','689e945289af4e30650a910291c38e8a'];
let annees = ['BUT1', 'BUT2', 'BUT3'];

// 
M.getAcData = async function(ac){
  let result = null;
  let data = await M.loadData();
  console.log(data);
  
  const match = ac.match(/AC(\d)(\d)/);
  
  const competence = match[2];  
  const annee= match[1];  
  // let anneeinfo = annees[annee-1];
  
  // let comp = competences[competence-1];
  let Com = data[competence-1]
      console.log(Com);
      let niv = Com.niveaux;
      let niveau = niv[annee-1];
      let acs = niveau.acs;
      result = acs.find(x => x.code === ac);

  // for (let elt of data[comp]){
  //   if (elt==comp){
  //      
  //    let  niv = elt.niveaux[anneeinfo];
  //    let acs= niv.acs[0];
  //   //  console.log(acs);
  //    result = acs.find(x => x.code === ac);
  //   }
  // }
  console.log(result);
  return result;
}
  // return data.find(item => item.annee === anneeinfo && item.competence === competenceinfo);
  // return data.filter(item => item.code === ac);

let C = {};

C.handler_clickAC = function(ev, root) {
  console.log("vous avez cliqué sur un apprentissage critique;", ev.target.id);
  if (ev.target.id.startsWith('AC')) {
    ev.stopPropagation();
    // console.log("vous avez cliqué sur un apprentissage critique;", ev.target.id);
  let ac = ev.target.id;
  V.renderACDetails(ac);
  }}

C.init = function() {
  M.loadData();
  return V.init();

}

let V = {
  rootPage: null,
  flowers: null
};
V.attachEvents = function(root) {
  root.addEventListener('click', (ev) => C.handler_clickAC(ev, root));
}

V.renderACDetails =async function(ac){
 
  let acElement = new AcView().html();
  let acData = await M.getAcData(ac);
  console.log(acData);
  // let userProgress = acData[0].progression;
console.log(acElement);
  acElement = acElement.replace('{{code}}', acData.code);
  acElement = acElement.replace('{{libelle}}', acData.libelle);
  let root = V.rootPage;

 let popupSlot = root.querySelector('slot[name="popup"]');

  popupSlot.replaceWith(htmlToDOM(acElement));
   
  let overlay = root.querySelector('.overlay');
  console.log(overlay);
  let popup = root.querySelector('.popup'); 
  overlay.classList.add('active');
  popup.classList.add('active');
  overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
    popup.classList.remove('active');
  }
);
  
  const closeBtn = popup.querySelector('.popup__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      popup.classList.remove('active');
    });
  }
  
}

V.init = function() {
  V.rootPage = htmlToDOM(template);
  V.flowers = new FlowerView();
  V.rootPage.querySelector('slot[name="svg"]').replaceWith( V.flowers.dom() );
  V.attachEvents(V.rootPage);
  return V.rootPage;
};


export function SvgDemo1Page() {
  return C.init();
}