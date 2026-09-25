# TechShop E-commerce API

API robuste pour une plateforme e-commerce d'électronique construite avec Spring Boot 3.4.

## Fonctionnalités
- Authentification JWT (Login/Register)
- Gestion des rôles (Admin et Client)
- Gestion des produits (CRUD, pagination, recherche)
- Gestion des catégories
- Avis clients sur les produits (note de 1 à 5 et commentaire)
- Système de commande complet (Panier -> Commande -> Stock)
- Dashboard Admin (Statistiques, Alertes de stock)
- Initialisation automatique des données (Rôles et compte Admin par défaut)

## Prérequis
- Java 17 ou supérieur
- Maven 3.6+
- MySQL 8.0+

## Installation & Configuration

1. **Base de données** :
   Créez une base de données MySQL nommée `ecommerce_db`.

2. **Notifications email** :
   Configurez un serveur SMTP avant de passer une commande. Les valeurs par defaut peuvent etre surchargees avec :
   - `MAIL_HOST` et `MAIL_PORT`
   - `MAIL_USERNAME` et `MAIL_PASSWORD`
   - `MAIL_SMTP_AUTH` et `MAIL_SMTP_STARTTLS`
   - `MAIL_FROM` pour l'adresse d'envoi
   - `ADMIN_EMAIL` pour recevoir les nouvelles commandes

   Exemple avec Gmail : utilisez un mot de passe d'application dans `MAIL_PASSWORD`, et activez `MAIL_SMTP_AUTH=true` et `MAIL_SMTP_STARTTLS=true`.

## Avis produits

- `GET /api/reviews/product/{productId}` : liste publique des avis d'un produit
- `POST /api/reviews/product/{productId}` : créer un avis authentifié
- `GET /api/reviews/my` : lister ses avis
- `PUT /api/reviews/{reviewId}` : modifier son avis
- `DELETE /api/reviews/{reviewId}` : supprimer son avis

Le corps d'un avis est `{ "rating": 1, "comment": "Commentaire" }`. Un client ne peut publier qu'un seul avis par produit.
   