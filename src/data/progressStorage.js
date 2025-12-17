// src/lib/progressStorage.js
const PROGRESS_KEY = 'sae303:progress:v1';

export const ProgressStorage = {
  // Charger depuis localStorage
  load() {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored);
  },

  // Mettre à jour localStorage avec les données
  update(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    console.log('Progression mise à jour dans localStorage');
    return data;
  },

  // Exporter les données en JSON
  export(data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `progression-${data.userId}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('Progression exportée');
  },

  // Importer une progression depuis un fichier JSON
  async import(file) {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      if (!imported.competences || !imported.userId) {
        throw new Error('Format de fichier invalide');
      }
      
      this.update(imported);
      console.log('Progression importée avec succès');
      return imported;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      return null;
    }
  }
};