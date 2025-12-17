// src/lib/user.js
import { ProgressStorage } from "../data/progressStorage.js";

export const User = {
  data: null,

  // Charger l'utilisateur depuis user.json et localStorage
  async load() {
    // 1. Charger user.json ET localStorage
    const response = await fetch('/src/data/user.json');
    const fileData = await response.json();
    const storageData = ProgressStorage.load();
    
    // 2. Prioriser localStorage (plus à jour), sinon user.json, sinon par défaut
    if (storageData && storageData.userId) {
      this.data = storageData;  // ✅ Utilise les données modifiées
    } else if (fileData && fileData.userId) {
      this.data = fileData;
    } else {
      this.data = this.createDefaultProgress();
    }
    
    // 3. Synchroniser localStorage avec les données actuelles
    ProgressStorage.update(this.data);
    
    return this.data;
  },

  // Créer la structure par défaut
  createDefaultProgress() {
    return {
      version: 1,
      userId: 'user_' + Date.now(),
      competences: {
        'Entreprendre': { currentLevel: 1, acs: {} },
        'Développer': { currentLevel: 1, acs: {} },
        'Exprimer': { currentLevel: 1, acs: {} },
        'Concevoir': { currentLevel: 1, acs: {} },
        'Comprendre': { currentLevel: 1, acs: {} }
      },
      lastUpdate: Date.now()
    };
  },

  // Marquer un AC comme complété et recalculer la progression
  // completeAC(competenceId, acId) {
  //   if (!this.data?.competences) return null;
    
  //   const comp = this.data.competences[competenceId];
  //   if (!comp) return null;

  //   // Marquer l'AC comme complété
  //   comp.acs[acId] = true;
  //   this.data.lastUpdate = Date.now();
    
  //   // Recalculer la progression pour chaque niveau
  //   this.recalculateLevelProgress(competenceId, comp.acs);
    
  //   // Mettre à jour localStorage
  //   ProgressStorage.update(this.data);
    
  //   return this.data;
  // },

  // Recalculer la progression par niveau (basée sur la moyenne des ACs du niveau)
  getLevelProgress(competenceId, level) {
    if (!this.data?.competences) return 0;
    
    const comp = this.data.competences[competenceId];
    if (!comp) return 0;
    
    // Récupérer tous les ACs du niveau
    const levelACs = Object.keys(comp.acs).filter(ac => 
      ac.startsWith('AC') && ac[2] === level.toString()
    );
    
    if (levelACs.length === 0) return 0;
    
    // Calculer la moyenne des progressions des ACs du niveau
    const totalProgress = levelACs.reduce((sum, ac) => sum + (comp.acs[ac] || 0), 0);
    return Math.round(totalProgress / levelACs.length);
  },

  // Obtenir la progression d'un AC (0-100)
  getAcProgress(acId) {
    if (!this.data?.competences) return 0;
    
    for (const compId in this.data.competences) {
      const comp = this.data.competences[compId];
      if (comp.acs.hasOwnProperty(acId)) {
        return comp.acs[acId] || 0;
      }
    }
    return 0;
  },

  // Vérifier si on peut passer au niveau suivant (65% atteint)
  canAdvanceLevel(competenceId) {
    const comp = this.data.competences[competenceId];
    if (!comp || comp.currentLevel >= 3) return false;
    
    const levelProgress = this.getLevelProgress(competenceId, comp.currentLevel);
    return levelProgress >= 65;
  },

  // Passer au niveau suivant
  advanceLevel(competenceId) {
    const comp = this.data.competences[competenceId];
    
    if (!this.canAdvanceLevel(competenceId)) {
      const levelProgress = this.getLevelProgress(competenceId, comp.currentLevel);
      console.warn(`Cannot advance: ${levelProgress}% < 65%`);
      return null;
    }
    
    if (comp.currentLevel < 3) {
      comp.currentLevel++;
      this.data.lastUpdate = Date.now();
      ProgressStorage.update(this.data);
      return this.data;
    }
    return null;
  },

  // Mettre à jour la progression d'un AC (0-100)
  updateAcProgress(acId, progress) {
    if (!this.data?.competences) return null;
    
    for (const compId in this.data.competences) {
      const comp = this.data.competences[compId];
      if (comp.acs.hasOwnProperty(acId) || !comp.acs[acId]) {
        comp.acs[acId] = Math.max(0, Math.min(100, progress)); // Clamp entre 0 et 100
        this.data.lastUpdate = Date.now();
        ProgressStorage.update(this.data);
        return this.data;
      } 
    }
    return null;
  },

  // Exporter les données utilisateur
  export() {
    ProgressStorage.export(this.data);
  },

  // Importer depuis un fichier
  async import(file) {
    this.data = await ProgressStorage.import(file);
    return this.data;
  },

  // Réinitialiser
  reset() {
    this.data = this.createDefaultProgress();
    ProgressStorage.update(this.data);
    return this.data;
  }
};
