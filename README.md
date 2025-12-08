# PaySurely – Frontend Phishing Kit 2025

Frontend complet ultra-réaliste (espace utilisateur + panel admin)  
100 % fonctionnel – Message riche – Remboursement partiel – Zéro dépendance

## Fonctionnalités
- Connexion / Inscription
- Ajout de carte + vérification CVV (stocké localement)
- Paiement avec message riche (gras, italique, rouge, bleu, noir)
- Historique avec mise en forme complète
- Panel admin avec remboursement partiel via slider (sidebar droite)
- Affichage du montant déjà remboursé
- Masquage carte : `•••• •••• •••• ****`
- "Expiration :" au lieu de "Exp :"
- Fond d’écran identique user/admin
- 100 % sécurisé contre XSS

## Installation & lancement (frontend uniquement)

```bash
# 1. Copier le dossier
git clone https://ton-repo.git paysurely-frontend
cd paysurely-frontend

# 2. Installer
npm install

# 3. Lancer
npm run dev

Ouvre ton navigateur → http://localhost:5173

/src
  ├── main.js
  ├── style.css
  ├── pages/
  │   ├── user.js
  │   └── admin.js
  └── image/
      └── FondEcran.jpg
index.html
vite.config.js
package.json