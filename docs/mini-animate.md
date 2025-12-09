# Mini-Animate - Documentation

Bibliothèque CSS d'animations légère et modulaire.

## Principe de fonctionnement

Les animations sont déclenchées **au clic** via l'ajout de la classe `.animate` (et au chargement si on ajoute manuellement la classe `.animate`).
Chaque élément à animer doit posséder un attribut `data-animate` avec le nom de l'animation souhaitée.

### Structure HTML

```html
<div data-animate="bounce">Contenu</div>
```

### Déclenchement en JavaScript

```javascript
// Déclencher l'animation
element.classList.add("animate");

// Relancer l'animation (reset + play)
element.classList.remove("animate");
void element.offsetWidth; // force reflow
element.classList.add("animate");

// Retirer après animation (pour pouvoir relancer)
element.addEventListener("animationend", function handler() {
  element.classList.remove("animate");
  element.removeEventListener("animationend", handler);
});
```

---

## Animation au chargement de la page

Par défaut, les animations ne se déclenchent pas au chargement. Pour qu'une animation joue automatiquement au chargement, il suffit d'ajouter manuellement la classe `.animate` dans le HTML.

### Méthode 1 : Directement dans le HTML

```html
<!-- Animation bounce qui joue au chargement -->
<div data-animate="bounce" class="animate">Je bounce au chargement !</div>

<!-- Animation pulse infinie au chargement -->
<div data-animate="pulse" class="animate infinite">Je pulse en boucle !</div>

<!-- Avec un délai -->
<div data-animate="bounce" class="animate delay-medium">
  Je bounce après 0.2s
</div>
```

### Méthode 2 : Via JavaScript au DOMContentLoaded

```javascript
document.addEventListener("DOMContentLoaded", function () {
  // Animer tous les éléments avec data-auto-animate
  document.querySelectorAll("[data-auto-animate]").forEach((el) => {
    el.classList.add("animate");
  });
});
```

```html
<div data-animate="bounce" data-auto-animate>Animation auto au chargement</div>
```

### Combinaison avec les classes utilitaires

```html
<!-- Bounce lent au chargement -->
<div data-animate="bounce" class="animate slow">Bounce lent</div>

<!-- Pulse rapide et infini au chargement -->
<div data-animate="pulse" class="animate faster infinite">Pulse rapide</div>

<!-- Bounce avec délai, joue 3 fois -->
<div data-animate="bounce" class="animate delay-long repeat-3">
  Bounce différé
</div>
```

### Animation au chargement sur SVG

```html
<svg viewBox="0 0 100 100">
  <path
    d="M10 10 L90 10 L50 90 Z"
    fill="#FF9FC6"
    data-animate="pulse"
    class="animate infinite"
  />
</svg>
```

---

## Animations disponibles

### Attention Seekers

| Animation | Attribut                | Description     |
| --------- | ----------------------- | --------------- |
| Bounce    | `data-animate="bounce"` | Effet de rebond |
| Pulse     | `data-animate="pulse"`  | Pulsation douce |

### Color

| Animation       | Attribut                       | Description                    |
| --------------- | ------------------------------ | ------------------------------ |
| Color Bg Change | `data-animate="colorBgChange"` | Transition de couleur (toggle) |

---

## Cas spécial : colorBgChange

`colorBgChange` fonctionne différemment : c'est un **toggle** avec la classe `.animate`.

### CSS requis

```css
[data-animate="colorBgChange"] {
  transition:
    background-color var(--anim-duration-normal) var(--anim-ease),
    fill var(--anim-duration-normal) var(--anim-ease);
}

[data-animate="colorBgChange"].animate {
  background-color: var(--anim-color-to) !important;
  fill: var(--anim-color-to) !important; /* Pour SVG */
}
```

### HTML avec variables de couleur

```html
<div
  data-animate="colorBgChange"
  style="
    background: var(--color-neutral-900);
    --anim-color-from: var(--color-neutral-900);
    --anim-color-to: var(--color-red-500);
  "
>
  Click me
</div>
```

### JavaScript

```javascript
// Simple toggle
element.classList.toggle("animate");
```

- **1er clic** → transition vers `--anim-color-to`
- **2ème clic** → transition vers `--anim-color-from`

---

## Classes utilitaires

### Durée

| Classe    | Effet             |
| --------- | ----------------- |
| `.faster` | 2x plus rapide    |
| `.fast`   | 1.25x plus rapide |
| `.slow`   | 2x plus lent      |
| `.slower` | 3x plus lent      |

### Délai

| Classe          | Délai |
| --------------- | ----- |
| `.delay-short`  | 0.1s  |
| `.delay-medium` | 0.2s  |
| `.delay-long`   | 0.3s  |

### Répétitions

| Classe      | Répétitions |
| ----------- | ----------- |
| `.repeat-2` | 2 fois      |
| `.repeat-3` | 3 fois      |
| `.infinite` | Infini      |

---

## Variables CSS personnalisables

```css
:root {
  /* Durées */
  --anim-duration-fast: 0.3s;
  --anim-duration-normal: 0.4s;
  --anim-duration-medium: 0.5s;
  --anim-duration-slow: 0.6s;

  /* Délais */
  --anim-delay-short: 0.1s;
  --anim-delay-medium: 0.2s;
  --anim-delay-long: 0.3s;

  /* Easing */
  --anim-ease: ease;

  /* Couleurs (pour colorBgChange) */
  --anim-color-from: #000000;
  --anim-color-to: #ffffff;

  /* Distances (pour slide) */
  --anim-distance-medium: 20px;
}
```

---

## Support SVG

Les animations fonctionnent aussi sur les éléments SVG (`<path>`, `<rect>`, `<circle>`, etc.).

### Propriété importante

La propriété `transform-box: fill-box` est automatiquement appliquée pour que le `transform-origin` fonctionne correctement sur les éléments SVG.

### Exemple sur un path SVG

```html
<svg viewBox="0 0 100 100">
  <path d="M10 10 L90 10 L50 90 Z" fill="#FF9FC6" data-animate="bounce" />
  <circle cx="50" cy="50" r="20" fill="#00FF00" data-animate="pulse" />
</svg>
```

### Transition de couleur sur SVG

Pour `colorBgChange`, la propriété `fill` est également animée (en plus de `background-color`) :

```html
<path
  d="M10 10..."
  fill="#FF9FC6"
  data-animate="colorBgChange"
  style="--anim-color-to: #00FF00;"
/>
```

---

## Exemple complet

```html
<div data-animate="bounce" class="slow">Bounce lent</div>

<div data-animate="pulse" class="repeat-3">Pulse 3 fois</div>

<div
  data-animate="colorBgChange"
  style="--anim-color-from: blue; --anim-color-to: red;"
>
  Toggle couleur
</div>
```

```javascript
// Handler de clic générique
function handleClick(ev) {
  const element = ev.target.closest("[data-animate]");

  if (element) {
    const animType = element.dataset.animate;

    if (animType === "colorBgChange") {
      // Toggle pour colorBgChange
      element.classList.toggle("animate");
    } else {
      // Animation standard
      element.classList.remove("animate");
      void element.offsetWidth;
      element.classList.add("animate");

      element.addEventListener("animationend", function handler() {
        element.classList.remove("animate");
        element.removeEventListener("animationend", handler);
      });
    }
  }
}
```
