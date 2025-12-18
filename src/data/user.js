// src/lib/user.js
import { ProgressStorage } from "../data/progressStorage.js";

export const User = {
  data: null,
  acDataMap: null, // Cache pour les données des ACs (libelle, couleur, etc.)

  // Charger les données des ACs depuis data.json
  async loadACData() {
    if (this.acDataMap) return this.acDataMap;
    
    try {
      const response = await fetch('/src/data/data.json');
      const dataJson = await response.json();
      this.acDataMap = {};
      
      // Construire le map AC -> { libelle, competence, color, level }
      if (dataJson.competences) {
        Object.entries(dataJson.competences).forEach(([compName, comp]) => {
          const color = comp.color || '#3b82f6';
          if (comp.levels) {
            Object.entries(comp.levels).forEach(([level, acs]) => {
              Object.entries(acs).forEach(([acId, acInfo]) => {
                this.acDataMap[acId] = {
                  libelle: acInfo.libelle || acId,
                  competence: compName,
                  color: color,
                  level: level
                };
              });
            });
          }
        });
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des données ACs:', error);
      this.acDataMap = {};
    }
    return this.acDataMap;
  },

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
    
    // 3. Initialiser l'historique s'il n'existe pas
    if (!this.data.history) {
      this.data.history = [];
    }
    
    // 4. Charger les données des ACs
    await this.loadACData();
    
    // 5. Synchroniser localStorage avec les données actuelles
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

  // Mettre à jour la progression d'un AC (0-100) ET enregistrer dans l'historique
  updateAcProgress(acId, progress) {
    if (!this.data?.competences) return null;
    
    for (const compId in this.data.competences) {
      const comp = this.data.competences[compId];
      if (comp.acs.hasOwnProperty(acId) || !comp.acs[acId]) {
        comp.acs[acId] = Math.max(0, Math.min(100, progress)); // Clamp entre 0 et 100
        this.data.lastUpdate = Date.now();
        
        // Enregistrer dans l'historique
        this.addToHistory(acId, progress);
        
        ProgressStorage.update(this.data);
        return this.data;
      } 
    }
    return null;
  },

  // Enregistrer une modification dans l'historique
  addToHistory(acId, progress) {
    if (!this.data.history) {
      this.data.history = [];
    }

    const acData = this.acDataMap?.[acId] || {};
    const entry = {
      acId: acId,
      libelle: acData.libelle || acId,
      competence: acData.competence || 'Unknown',
      progress: progress,
      date: new Date().toISOString(),
      color: acData.color || '#3b82f6'
    };

    this.data.history.push(entry);
  },

  // Obtenir les données de notification formatées pour un AC
  async getACNotificationData(acId) {
    // Assurer que les données des ACs sont chargées
    if (!this.acDataMap) {
      await this.loadACData();
    }

    const acData = this.acDataMap?.[acId];
    if (!acData) {
      return null;
    }

    return {
      ac: acId,
      libelle: acData.libelle,
      competence: acData.competence,
      progress: this.getAcProgress(acId),
      date: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      color: acData.color
    };
  },

  // Obtenir tout l'historique
  getHistory() {
    return this.data?.history || [];
  },

  // Obtenir l'historique trié par date (plus récent en premier)
  getHistorySorted() {
    return (this.data?.history || []).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  },

  // Effacer l'historique
  clearHistory() {
    this.data.history = [];
    ProgressStorage.update(this.data);
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
