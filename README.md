Crée une application RH de gestion des congés d'entreprise avec les technologies suivantes :
- Framework : Next.js (App Router)
- Authentification : NextAuth avec rôles ("admin", "employé")
- Base de données : Prisma ORM avec PostgreSQL ou MySQL
- Upload : gestion des fichiers (photo de profil)
- Interface : React + Tailwind CSS

Fonctionnalités attendues :

1. Authentification :
   - Login via NextAuth (credentials)
   - Redirection selon le rôle :
     - admin → /dashboard/admin
     - employé → /dashboard/employe

2. Gestion des utilisateurs :
   - Création d’utilisateur avec :
     - Données personnelles (nom, email, genre, CIN, photo, etc.)
     - Rôle, type de contrat, statut
   - À la création : initialiser les soldes de congés pour chaque type de congé (voir `leave_types`)

3. Types de congés (`leave_types`) :
   - Exemple de congés avec `annual_quota` :
     - Congé payé (18)
     - Congé maladie (180)
     - Maternité (98)
     - Mariage, Décès, etc.

4. Table `leave_balances` :
   - Stocke le solde de congé restant pour chaque `user_id` et `leave_type_id`
   - Initialisé selon le `annual_quota` de chaque type lors de la création de l’utilisateur
   - Mis à jour uniquement si une demande est validée

5. Demandes de congés (`leave_requests`) :
   - Employé soumet une demande avec :
     - Type de congé
     - Date de début et fin
     - Raison
   - Calcul des jours ouvrés entre les dates (hors samedi/dimanche)
   - Validation ou refus par un admin
   - Si validé → déduction automatique du solde

6. Sécurité :
   - Routes protégées selon le rôle
   - Empêcher qu’un solde soit négatif
   - Gestion des types non rémunérés (ex : congé sans solde)

7. Bonus :
   - Script pour réinitialiser ou recharger les soldes chaque année
   - Affichage du solde restant par type dans le dashboard

export function getWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0; // compteur de jours ouvrables
  const date = new Date(startDate); // on copie la date de départ pour ne pas la modifier

  while (date < endDate) {
    const day = date.getDay(); // récupère le jour de la semaine (0=dimanche, 6=samedi)
    if (day !== 0 && day !== 6) count++; // si ce n’est pas samedi (6) ni dimanche (0), on ajoute 1
    date.setDate(date.getDate() + 1); // on avance d’un jour
  }

  return count; // on retourne le nombre de jours ouvrables
}
