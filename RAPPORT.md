# Mini-raport pour le projet ELC-D03 : r/place

## Fonctionnalités

### Grille interactive

Nous avions pour objectif de créer une grille dimmensionnable avec laquelle les utilisateurs peuvent intéragir. 
Les utilisateurs peuvent voir les nouveaux pixels posés par les autres utilisateurs en temps réel (WS). 
De plus ils peuvent poser des pixels de la couleur de leur choix.

### Connexion

Nous voulions égaliement permettre aux utilisateurs de se connecter et se créer des comptes. 
Nous avions pour objectif d'avoir une connexion sécurisée avec des tokens. 

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