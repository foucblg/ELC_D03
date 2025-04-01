# Mini-raport pour le projet ELC-D03 : r/place

## Fonctionnalités

### Grille interactive

Nous avions pour objectif de créer une grille de taille arbitraire avec laquelle les utilisateurs peuvent interagir en posant des pixels de différentes couleurs. 
Les utilisateurs peuvent voir les nouveaux pixels posés par les autres utilisateurs, et en temps réel grâce à des websockets. 

De plus ils peuvent poser n'importe où sur la grille des pixels de la couleur de leur choix parmi une palette.

### Système de placement de pixels

Lorsqu'un utilisateur connecté clique pour poser un pixel, une demande de placement de pixel est émise au serveur.
Le serveur valide la demande, met à jour la base de données, puis émet à tous les utilisateurs le placement d'un pixel.
A la réception, les navigateurs mettent à jour l'affichage.

Ainsi :
* l'information est centralisée : le serveur détient la vérité.
* on n'affiche pas à l'utilisateur un événement pas encore accepté : lorsqu'un utilisateur clique pour poser un pixel, l'interface ne se met à jour qu'après la validation par le serveur.

### Connexion

Nous voulions également permettre aux utilisateurs de *s'authentifier* avec une notion de compte.

#### Création de compte

Tout utilisateur peut créer un compte, avec seulement un nom et un mot de passe, pourvu que le nom n'ait pas encore été pris.

Comme dans un véritable service en production, nous ne stockons pas vos mots de passe, mais les *hash* de vos mots de passe. Ainsi :
* une fonction de hash étant (presque) injective, on peut s'assurer qu'un utilisateur essayant de se connecter a mis le bon mot de passe sans pour autant le connaître ;
* une personne ayant un accès à la base de données ne peut pas remonter à votre mot de passe, car de telles fonctions sont impossibles à inverser en pratique.

#### Authentification

Après avoir créé un compte, un utilisateur peut se "connecter", autrement dit s'authentifier (avec son nom et mot de passe) pour être recevoir certaines *autorisations*, ici le fait de poser un pixel et d'envoyer un message texte.

Après une authentification réussie, un token (d'accès) est créé, associé en base de données au compte, et l'utilisateur le reçoit dans un cookie.

Nous avions pour objectif d'avoir une connexion sécurisée avec un système de tokens.
En effet, le token seul fait foi pour s'assurer de l'accès à un compte.
Par la suite, les cookies étant automatiquement envoyés avec chaque requête HTTP ou émission websocket, le serveur reçoit automatiquement le token avec.

### Chat

Finalement, nous voulions ajouter un *chat* (messagerie instantanée) pour que les utilisateurs connectés puissent discuter entre eux.
Chaque message contient une date, l'utilisateur à l'origine du message, et du texte pur. 
Dans ce chat, on distingue deux types de messages :
* ceux envoyés directement par les utilisateurs ;
* les informations des pixels posés, créés automatiquement en tant que l'utilisateur venant de poser un pixel.

Ce dernier type de message fait office de logs du point de vue de l'utilisateur final, permettant d'appréhender l'historique des modifications.

Cette fonctionnalité de messagerie instantanée, non-prévue au départ, a été rapidement implémentée après s'être rendu compte qu'*in fine*, poser un message, c'est comme poser un pixel, mais contenant du texte et non une couleur.
Le système de "placement de message" est analogue (pour ne pas dire identique) au système de placement de pixels, en deux temps séparés par une validation par le serveur.

### Historique



## Technologies utilisées

### JavaScript

La majorité du projet est en JavaScript. Ce langage permet de faire des applications web dynamiques et réactives.

### Express

L'application est basée sur Express, un framework pour Node.js. 
Cela permet de créer des applications web plus facilement. Tous les endpoints de l'API sont gérés par Express.

### Socket.io

Nous utilisons Socket.io pour la communication en temps réel entre le serveur et les clients. Les pixels ainsi que les messages du chat sont envoyés via Socket.io.

### Docker

Nous utilisons Docker pour déployer notre application. Cela permet de déployer l'application plus facilement et de manière plus portable.

### Sqlite3

Nous utilisons Sqlite3 pour la base de données. Cela permet de stocker les utilisateurs, les pixels et les messages du chat.

## Difficultés rencontrées
