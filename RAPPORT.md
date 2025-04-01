# Mini-raport pour le projet ELC-D03 : r/place

## Fonctionnalités

### Grille interactive

Nous avions pour objectif de créer une grille de taille arbitraire avec laquelle les utilisateurs peuvent interagir en posant des pixels de différentes couleurs. 
Les utilisateurs peuvent voir les nouveaux pixels posés par les autres utilisateurs, et en temps réel grâce à des websockets. 

De plus ils peuvent poser n'importe où sur la grille des pixels de la couleur de leur choix parmi une palette.

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

Finalement, nous voulions ajouter un chat pour que les utilisateurs puissent discuter entre eux. 
Dans ce chat, on y voit les informations des pixels posés ainsi que les messages des utilisateurs.

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
