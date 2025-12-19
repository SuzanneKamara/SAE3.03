/**
 * EXEMPLE DE DÉMONSTRATION DES FONCTIONNALITÉS AVANCÉES
 * 
 * Ce fichier montre comment utiliser chaque fonctionnalité dans un contexte réel.
 * À adapter selon votre structure svg-demo1/page.js
 */

import { AdvancedFeatures } from "../lib/advancedFeatures.js";
import { HistoricalController } from "../lib/historicalController.js";
import { AdvancedAnimation } from "../lib/advancedAnimation.js";
import { ProgressStorage } from "../data/progressStorage.js";

// =============================================
// DEMO 1: Utiliser le slider historique
// =============================================
function demoHistoricalSlider() {
  console.group("🎬 DÉMO: Slider Historique");
  
  const progressData = ProgressStorage.load();
  
  // Obtenir les dates uniques
  const uniqueDates = HistoricalController.getUniqueDates();
  console.log(`Dates disponibles: ${uniqueDates.length}`);
  uniqueDates.forEach(date => {
    console.log(`  - ${HistoricalController.formatDate(date)}`);
  });
  
  // Obtenir les données pour une date donnée
  if (uniqueDates.length > 0) {
    const firstDate = uniqueDates[0];
    const dataAtDate = HistoricalController.getProgressAtDate(firstDate);
    console.log("Données au", HistoricalController.formatDate(firstDate), ":", dataAtDate);
  }
  
  console.groupEnd();
}

// =============================================
// DEMO 2: Utiliser le radar
// =============================================
function demoRadar() {
  console.group("📊 DÉMO: Graphique Radar");
  
  const progressData = ProgressStorage.load();
  const radarData = HistoricalController.prepareRadarData(progressData);
  
  console.table(radarData);
  
  radarData.forEach(comp => {
    const progressBar = "█".repeat(Math.floor(comp.progress / 5)) + 
                       "░".repeat(20 - Math.floor(comp.progress / 5));
    console.log(`${comp.name.padEnd(20)} [${progressBar}] ${comp.progress}%`);
  });
  
  console.groupEnd();
}

// =============================================
// DEMO 3: Identifier les AC faibles
// =============================================
function demoWeakACs() {
  console.group("⚠️  DÉMO: AC Faibles et Inactifs");
  
  const progressData = ProgressStorage.load();
  
  if (!progressData || !progressData.competences) {
    console.log("Aucune donnée de progression");
    console.groupEnd();
    return;
  }
  
  const weakACs = HistoricalController.getWeakACs(progressData);
  
  if (weakACs.length === 0) {
    console.log("✓ Aucun AC faible ou inactif");
  } else {
    console.log(`${weakACs.length} AC(s) nécessitant attention:`);
    console.table(weakACs);
    
    weakACs.forEach(ac => {
      const status = ac.isInactive ? "🔴 INACTIF" : "🟠 FAIBLE";
      console.log(`${status} - ${ac.acId} (${ac.progress}%)`);
    });
  }
  
  console.groupEnd();
}

// =============================================
// DEMO 4: Animations GSAP
// =============================================
function demoGSAPAnimations() {
  console.group("🎨 DÉMO: Animations GSAP");
  
  // Créer un élément SVG de test
  const testSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  testSVG.setAttribute("viewBox", "0 0 200 200");
  testSVG.setAttribute("width", "200");
  testSVG.setAttribute("height", "200");
  
  // Créer un groupe "competence" de test
  const competenceGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  competenceGroup.setAttribute("id", "competence-test");
  
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "100");
  circle.setAttribute("cy", "100");
  circle.setAttribute("r", "50");
  circle.setAttribute("fill", "#3b82f6");
  
  competenceGroup.appendChild(circle);
  testSVG.appendChild(competenceGroup);
  
  // Ajouter au DOM temporairement
  document.body.appendChild(testSVG);
  
  console.log("✓ Éléments de test créés");
  
  // Tester la rotation
  console.log("Démarrage de la rotation... (cliquez sur le cercle pour arrêter)");
  AdvancedFeatures.setupCompetenceRotations(testSVG);
  
  // Nettoyer après 5 secondes
  setTimeout(() => {
    console.log("Arrêt de la démo");
    AdvancedFeatures.stopAllAnimations();
    document.body.removeChild(testSVG);
  }, 5000);
  
  console.groupEnd();
}

// =============================================
// DEMO 5: Vérifier l'intégrité des données
// =============================================
function demoDataIntegrity() {
  console.group("✅ DÉMO: Vérification des données");
  
  const progressData = ProgressStorage.load();
  
  if (!progressData) {
    console.error("❌ Aucune donnée de progression trouvée dans localStorage");
    console.groupEnd();
    return;
  }
  
  console.log("✓ Données de progression chargées");
  console.log("  - userId:", progressData.userId);
  
  // Vérifier les compétences
  if (progressData.competences) {
    const compCount = Object.keys(progressData.competences).length;
    console.log(`✓ ${compCount} compétence(s) trouvée(s)`);
    
    // Compter les ACs
    let totalACs = 0;
    Object.values(progressData.competences).forEach(comp => {
      if (comp.levels) {
        Object.values(comp.levels).forEach(level => {
          totalACs += Object.keys(level).length;
        });
      }
    });
    console.log(`✓ ${totalACs} AC(s) trouvé(s)`);
  }
  
  // Vérifier l'historique
  if (progressData.history && Array.isArray(progressData.history)) {
    console.log(`✓ ${progressData.history.length} entrée(s) historique(s)`);
  } else {
    console.warn("⚠️  Aucun historique disponible");
  }
  
  // Vérifier les levels complétés
  if (progressData.completedLevels) {
    const completedCount = Object.keys(progressData.completedLevels).length;
    console.log(`✓ ${completedCount} niveau(x) complété(s) (65%+)`);
  }
  
  console.groupEnd();
}

// =============================================
// DEMO 6: Exécuter toutes les démos
// =============================================
function runAllDemos() {
  console.log("🚀 LANCEMENT DE TOUTES LES DÉMOS\n");
  
  demoDataIntegrity();
  console.log("");
  
  demoHistoricalSlider();
  console.log("");
  
  demoRadar();
  console.log("");
  
  demoWeakACs();
  console.log("");
  
  console.log("💡 Pour tester les animations:");
  console.log("   - demoGSAPAnimations()");
  console.log("   - (Prend 5 secondes, cliquez sur le cercle pour arrêter la rotation)\n");
}

// =============================================
// UTILISATION
// =============================================

// Dans la console du navigateur, exécutez:
// runAllDemos()

// Ou exécutez des démos spécifiques:
// demoRadar()
// demoWeakACs()
// demoHistoricalSlider()
// etc.

export {
  demoHistoricalSlider,
  demoRadar,
  demoWeakACs,
  demoGSAPAnimations,
  demoDataIntegrity,
  runAllDemos
};
