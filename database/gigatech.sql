-- ============================================================
-- GIGATECH - BASE DE DONNEES MYSQL - VERSION IMPORT CORRIGEE
-- Compatible MySQL 8.x / phpMyAdmin
-- Fonctionnalites conservees : POS, stock, achats, ventes,
-- paiements, alertes, triggers, procedures et vues.
-- ============================================================

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS `gigatech`;
CREATE DATABASE `gigatech` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gigatech`;

-- ============================================================
-- 1. TABLES DE BASE
-- ============================================================

CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `marques` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pays` VARCHAR(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `fournisseurs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` VARCHAR(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `societe` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fourn` (`nom`,`telephone`),
  KEY `idx_fourn_ville` (`ville`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `clients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` VARCHAR(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_client` ENUM('particulier','entreprise','revendeur') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'particulier',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client` (`nom`,`telephone`),
  KEY `idx_client_type` (`type_client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poste` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` VARCHAR(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salaire` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `date_embauche` DATE DEFAULT NULL,
  `actif` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_emp_poste` (`poste`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `utilisateurs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` ENUM('administrateur','gestionnaire','caissier','magasinier') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'caissier',
  `telephone` VARCHAR(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `parametres` (
  `id` INT NOT NULL DEFAULT '1',
  `entreprise` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GigaTech',
  `adresse` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` VARCHAR(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_web` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rccm` VARCHAR(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nif` VARCHAR(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `devise` VARCHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `tva` DECIMAL(5,2) NOT NULL DEFAULT '16.00',
  `logo` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. PRODUITS
-- ============================================================

CREATE TABLE `produits` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_barres` VARCHAR(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom` VARCHAR(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` TEXT COLLATE utf8mb4_unicode_ci,
  `categorie_id` INT NOT NULL,
  `marque_id` INT DEFAULT NULL,
  `fournisseur_id` INT DEFAULT NULL,
  `prix_achat` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `prix_vente` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `quantite` INT NOT NULL DEFAULT '0',
  `seuil_alerte` INT NOT NULL DEFAULT '5',
  `image` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `garantie_mois` INT NOT NULL DEFAULT '12',
  `actif` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  UNIQUE KEY `code_barres` (`code_barres`),
  KEY `fk_prod_marq` (`marque_id`),
  KEY `fk_prod_four` (`fournisseur_id`),
  KEY `idx_prod_nom` (`nom`),
  KEY `idx_prod_cat` (`categorie_id`),
  KEY `idx_prod_stock` (`quantite`),
  KEY `idx_prod_ref_nom` (`reference`,`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. ACHATS / VENTES / LIGNES / STOCK / PAIEMENTS
-- ============================================================

CREATE TABLE `achats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero` VARCHAR(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fournisseur_id` INT NOT NULL,
  `utilisateur_id` INT DEFAULT NULL,
  `total` DECIMAL(14,2) NOT NULL DEFAULT '0.00',
  `statut` ENUM('brouillon','validee','annulee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `note` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_achat` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `fk_ach_four` (`fournisseur_id`),
  KEY `fk_ach_user` (`utilisateur_id`),
  KEY `idx_ach_date` (`date_achat`),
  KEY `idx_ach_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ventes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero` VARCHAR(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` INT DEFAULT NULL,
  `utilisateur_id` INT DEFAULT NULL,
  `sous_total` DECIMAL(14,2) NOT NULL DEFAULT '0.00',
  `remise` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `montant_remise` DECIMAL(14,2) NOT NULL DEFAULT '0.00',
  `tva` DECIMAL(5,2) NOT NULL DEFAULT '16.00',
  `montant_tva` DECIMAL(14,2) NOT NULL DEFAULT '0.00',
  `total` DECIMAL(14,2) NOT NULL DEFAULT '0.00',
  `statut` ENUM('brouillon','validee','annulee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'validee',
  `mode_paiement` ENUM('especes','mobile_money','carte_bancaire','virement') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'especes',
  `note` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_vente` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `fk_v_user` (`utilisateur_id`),
  KEY `idx_v_date` (`date_vente`),
  KEY `idx_v_statut` (`statut`),
  KEY `idx_ventes_client_date` (`client_id`,`date_vente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lignes_achat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `achat_id` INT NOT NULL,
  `produit_id` INT NOT NULL,
  `quantite` INT NOT NULL,
  `prix_unitaire` DECIMAL(12,2) NOT NULL,
  `total_ligne` DECIMAL(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_la_achat` (`achat_id`),
  KEY `idx_la_prod` (`produit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lignes_vente` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vente_id` INT NOT NULL,
  `produit_id` INT NOT NULL,
  `quantite` INT NOT NULL,
  `prix_unitaire` DECIMAL(12,2) NOT NULL,
  `total_ligne` DECIMAL(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lv_prod` (`produit_id`),
  KEY `idx_lv_vente_prod` (`vente_id`,`produit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mouvements_stock` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `produit_id` INT NOT NULL,
  `type` ENUM('entree','sortie','ajustement') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantite` INT NOT NULL,
  `motif` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` VARCHAR(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utilisateur_id` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ms_prod` (`produit_id`),
  KEY `fk_ms_user` (`utilisateur_id`),
  KEY `idx_ms_date` (`created_at`),
  KEY `idx_ms_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `paiements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vente_id` INT NOT NULL,
  `montant` DECIMAL(14,2) NOT NULL,
  `mode` ENUM('especes','mobile_money','carte_bancaire','virement') COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` ENUM('en_attente','paye','echoue','rembourse') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paye',
  `reference` VARCHAR(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utilisateur_id` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pay_vente` (`vente_id`),
  KEY `fk_pay_user` (`utilisateur_id`),
  KEY `idx_pay_mode` (`mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alertes_stock` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `produit_id` INT NOT NULL,
  `message` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niveau` ENUM('faible','rupture') COLLATE utf8mb4_unicode_ci NOT NULL,
  `vue` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_al_prod` (`produit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. DONNEES
-- ============================================================

INSERT INTO `categories` VALUES
(1,'Ordinateurs','Ordinateurs portables et de bureau','2026-08-11 11:26:30'),
(2,'Téléphones','Smartphones et téléphones mobiles','2026-08-11 11:26:30'),
(3,'Composants','Composants informatiques','2026-08-11 11:26:30'),
(4,'Périphériques','Claviers, souris, écrans et accessoires','2026-08-11 11:26:30'),
(5,'Réseaux','Équipements réseau et connectivité','2026-08-11 11:26:30'),
(6,'Stockage','Disques, SSD, clés USB et cartes mémoire','2026-08-11 11:26:30');

INSERT INTO `marques` VALUES
(1,'HP','États-Unis',NULL,'Fabricant informatique','2026-08-11 11:26:30'),
(2,'Dell','États-Unis',NULL,'Ordinateurs et équipements professionnels','2026-08-11 11:26:30'),
(3,'Lenovo','Chine',NULL,'Ordinateurs professionnels et grand public','2026-08-11 11:26:30'),
(4,'Samsung','Corée du Sud',NULL,'Smartphones et électronique','2026-08-11 11:26:30'),
(5,'Logitech','Suisse',NULL,'Périphériques informatiques','2026-08-11 11:26:30'),
(6,'TP-Link','Chine',NULL,'Équipements réseau','2026-08-11 11:26:30');

INSERT INTO `fournisseurs` VALUES
(1,'Tech Madagascar','034 11 111 11','contact@techmadagascar.mg','Antananarivo','Tech Madagascar SARL','Antananarivo','Madagascar','2026-08-11 11:26:30'),
(2,'Info Supply','032 22 222 22','contact@infosupply.mg','Analakely','Info Supply SARL','Antananarivo','Madagascar','2026-08-11 11:26:30'),
(3,'Digital Solutions','033 33 333 33','commercial@digitalsolutions.mg','Behoririka','Digital Solutions','Antananarivo','Madagascar','2026-08-11 11:26:30'),
(4,'Smart Distribution','034 44 444 44','vente@smartdistribution.mg','Andraharo','Smart Distribution','Antananarivo','Madagascar','2026-08-11 11:26:30'),
(5,'Network Pro','032 55 555 55','contact@networkpro.mg','Ankorondrano','Network Pro SARL','Antananarivo','Madagascar','2026-08-11 11:26:30');

INSERT INTO `clients` VALUES
(1,'Rakoto','Jean','034 60 100 01','jean.rakoto@gmail.com','Lot IV A 12','Antananarivo','particulier','2026-08-11 11:26:31'),
(2,'Rasoanaivo','Mamy','032 60 100 02','mamy.rasoanaivo@gmail.com','Ankadifotsy','Antananarivo','particulier','2026-08-11 11:26:31'),
(3,'Randria','Hery','033 60 100 03','hery.randria@gmail.com','Ambohipo','Antananarivo','particulier','2026-08-11 11:26:31'),
(4,'Rakotomalala','Nina','034 60 100 04','nina.rakotomalala@gmail.com','Ivandry','Antananarivo','particulier','2026-08-11 11:26:31'),
(5,'Andriamihaja','Paul','032 60 100 05','paul.andriamihaja@gmail.com','Mahajanga','Mahajanga','particulier','2026-08-11 11:26:31'),
(6,'Giga Business',NULL,'033 70 200 01','contact@gigabusiness.mg','Zone Industrielle','Antananarivo','entreprise','2026-08-11 11:26:31'),
(7,'Smart Office',NULL,'034 70 200 02','contact@smartoffice.mg','Ankorondrano','Antananarivo','entreprise','2026-08-11 11:26:31'),
(8,'Madagascar Services',NULL,'032 70 200 03','contact@madagascarservices.mg','Behoririka','Antananarivo','entreprise','2026-08-11 11:26:31'),
(9,'Tech Reseller',NULL,'033 70 200 04','contact@techreseller.mg','Analakely','Antananarivo','revendeur','2026-08-11 11:26:31'),
(10,'Digital Market',NULL,'034 70 200 05','contact@digitalmarket.mg','Andraharo','Antananarivo','revendeur','2026-08-11 11:26:31');

INSERT INTO `employes` VALUES
(1,'Rakotosoa','Mickael','Responsable magasin','034 80 100 01','mickael@gigatech.com','Antananarivo',1200000.00,'2026-03-02',1,'2026-08-11 11:26:31'),
(2,'Ralimanana','Sandra','Caissière','032 80 100 02','sandra@gigatech.com','Antananarivo',850000.00,'2026-04-28',1,'2026-08-11 11:26:31'),
(3,'Andriamamonjy','Kevin','Magasinier','033 80 100 03','kevin@gigatech.com','Antananarivo',900000.00,'2026-04-07',1,'2026-08-11 11:26:31'),
(4,'Rasolofoniaina','Laura','Gestionnaire','034 80 100 04','laura@gigatech.com','Antananarivo',1100000.00,'2026-07-16',1,'2026-08-11 11:26:31');

INSERT INTO `utilisateurs` VALUES
(4,'RAJOANY','Rolin','admin@gigatech.com','$2a$12$ax4BZRElQkB4CUB/l1fE3.0B5ouJyb5R3YkbUFF4HEUnvVZwZd46O','administrateur','0381929175','/uploads/1786443151239-487545-CV_profil.jpg',1,'2026-08-11 11:16:22','2026-08-11 13:19:00'),
(5,'Rasolofoniaina','Laura','gestionnaire@gigatech.com','$2a$12$d.YVVWwdrt4y/QkEAGt1vO3B6YyZzwqagN4cNmkmMdScFeO.KMpYq','gestionnaire','0332145632',NULL,1,'2026-08-11 13:16:57','2026-08-11 13:23:27'),
(6,'Ralimanana','Sandra','caissier@gigatech.com','$2a$12$aQ2S/HdB1vrwTSiQjXuGcOQP0deQ3dkjpzegtXWUX/ER5vwXP3sa2','caissier','0342516789','/uploads/1786444206009-451884-Admin.jpg',1,'2026-08-11 13:18:15','2026-08-11 13:30:06'),
(7,'Andriamamonjy','Kevin','magasinier@gigatech.com','$2a$12$3EVr9CRAAVA3dKR80wjh4e5ccGiqo4FuBydEFCK7ApmdqZUW/8TYy','magasinier','0381929133',NULL,1,'2026-08-11 13:20:37','2026-08-11 13:22:06');

INSERT INTO `parametres` VALUES
(1,'GigaTech','Av. du Commerce 145, Gombe, Kinshasa','+243 810 000 000','contact@gigatech.cd','www.gigatech.cd','CD/KIN/RCCM/22-B-1234','A2212345X','USD',16.00,'/uploads/1786440382614-688745-logo.png');

INSERT INTO `produits` VALUES
(1,'PC-HP-001','100000000001','HP Laptop 15','Ordinateur portable HP 15 pouces',1,1,1,1800000.00,2300000.00,12,5,'/uploads/1786441259441-291886-ASUS_.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:40:59'),
(2,'PC-DELL-001','100000000002','Dell Inspiron 15','Ordinateur portable professionnel Dell',1,2,2,2100000.00,2700000.00,5,5,'/uploads/1786441232671-389193-is1.jpg',12,1,'2026-08-11 11:26:31','2026-08-07 13:02:19'),
(3,'PC-LEN-001','100000000003','Lenovo IdeaPad 3','Ordinateur portable Lenovo',1,3,3,1950000.00,2500000.00,4,5,'/uploads/1786441218556-334060-dd.jpg',12,1,'2026-08-11 11:26:31','2026-08-11 13:03:56'),
(4,'PHONE-SAM-001','100000000004','Samsung 46','Portable Samsung Galaxy A15',1,4,4,650000.00,850000.00,18,5,'/uploads/1786441198823-125369-is2.jpg',12,1,'2026-08-11 11:26:31','2026-08-11 12:39:58'),
(5,'COMP-SAM-002','100000000005','Supercomputers A25','Supercomputers A25',1,4,4,950000.00,1250000.00,9,5,'/uploads/1786441122448-581786-FB_IMG_17451412200171268.jpg',12,1,'2026-08-11 11:26:31','2026-08-11 12:38:42'),
(6,'RAM-001','100000000006','RAM DDR4 8GB','Mémoire vive DDR4 8GB',3,2,2,95000.00,140000.00,25,5,'/uploads/1786440969047-963176-pexels-tanasovich-2588757.jpg',12,1,'2026-08-11 11:26:31','2026-08-11 12:36:09'),
(7,'RAM-002','100000000007','RAM DDR4 16GB','Mémoire vive DDR4 16GB',3,2,2,180000.00,260000.00,2,5,'/uploads/1786440929939-432256-kingston.jpg',12,1,'2026-08-11 11:26:31','2026-05-23 13:05:15'),
(8,'SSD-001','100000000008','SSD 256GB','SSD SATA 256GB',6,1,1,150000.00,220000.00,15,5,'/uploads/1786440901390-804962-hq720.jpg',12,1,'2026-08-11 11:26:31','2026-08-11 12:35:01'),
(9,'SSD-002','100000000009','SSD 512GB','SSD SATA 512GB',6,1,1,200000.00,390000.00,8,5,'/uploads/1786440793506-710063-ssd_1_to_nvme.png',12,1,'2026-08-11 11:26:31','2026-08-07 13:01:13'),
(10,'USB-001','100000000010','Clé USB 64GB','Clé USB 64GB',6,4,3,45000.00,75000.00,30,8,'/uploads/1786440776998-242921-USB_128.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:32:57'),
(11,'CHARGE-001','100000000011','Chargeur PC','Souris sans fil Logitech',4,5,3,30000.00,75000.00,24,5,'/uploads/1786440665918-426527-chargeur_PC.png',12,1,'2026-08-11 11:26:31','2026-05-23 13:07:58'),
(12,'ALIM -001','100000000012','Alimentation Logitech K120','Clavier USB Logitech',4,5,3,55000.00,90000.00,16,5,'/uploads/1786440615406-893329-onduleur_1200_va.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:43:30'),
(13,'ROUTER-001','100000000013','RJ45 TP-Link','Routeur WiFi TP-Link',5,6,5,9999.99,180000.00,14,5,'/uploads/1786440592799-344310-Cable_RJ45.png',12,1,'2026-08-11 11:26:31','2026-05-23 13:07:58'),
(15,'HAUT-001','100000000015','Haut_parleur','Moniteur Full HD 24 pouces',4,1,1,500000.00,680000.00,6,3,'/uploads/1786440549736-521213-Haut_parleur.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:45:17'),
(16,'CAM-002','100000000016','WebCAM','Moniteur Dell Full HD',4,2,2,550000.00,750000.00,2,3,'/uploads/1786440536682-8834-WebCam_HD.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:44:43'),
(17,'LAPTOP-001','100000000017','Lenovo ThinkPad','Ordinateur professionnel Lenovo ThinkPad',1,3,3,3200000.00,4100000.00,5,3,'/uploads/1786440476509-974328-Mac_book.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:27:56'),
(18,'PHONE-001','100000000018','Samsung Galaxy S23','Smartphone haut de gamme Samsung',2,4,4,2800000.00,3500000.00,3,3,'/uploads/1786440510181-699857-USB_128.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:28:30'),
(19,'SSD-003','100000000019','SSD NVMe 1TB','SSD NVMe 1TB haute performance',6,2,2,450000.00,620000.00,8,4,'/uploads/1786440628762-76980-ssd_1_to_nvme.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:30:28'),
(20,'NETWORK-001','100000000020','Cable TP-Link 8 ports',' Ethernet 8 ports',5,6,5,150000.00,230000.00,8,4,'/uploads/1786440645760-416810-Cable_RJ45.png',12,1,'2026-08-11 11:26:31','2026-08-11 12:42:09'),
(21,'S_001','11199378','Souris','Souris Gamer',4,4,2,4000.00,2500.00,31,5,'/uploads/1786441926157-730606-souris-gamer.jpg',8,1,'2026-08-11 12:52:06','2026-05-23 13:07:58'),
(22,'MAN-001','12330001','Manette','Manette Pro',4,2,1,20000.00,23000.00,12,5,'/uploads/1786442050586-702033-image45.png',4,1,'2026-08-11 12:54:10','2026-08-11 12:54:10'),
(23,'CAB6-003','10011100','CABLE','Cable proffessionelle',4,4,4,20890.00,30000.00,13,5,'/uploads/1786442154605-529339-remplacement-connecteur-2560x1706-1.webp',2,1,'2026-08-11 12:55:54','2026-08-11 12:55:54'),
(24,'PROC_001','1233455','Processeur','Processeur Dell',3,2,3,233000.00,299000.00,12,5,'/uploads/1786442245622-478091-1735204259-1070-card.webp',12,1,'2026-08-11 12:57:25','2026-08-11 12:57:25');

INSERT INTO `achats` VALUES
(1,'ACH-1786437584272',4,4,200000.00,'validee',NULL,'2026-08-11 11:39:44'),
(2,'ACH-1779530860180',4,4,199999.96,'validee',NULL,'2026-05-23 13:07:40');

INSERT INTO `ventes` VALUES
(1,'VNT-1786437503361',NULL,4,230000.00,6.00,13800.00,10.00,21620.00,237820.00,'validee','especes',NULL,'2026-08-11 11:38:23'),
(2,'VNT-1786096939734',NULL,4,8100000.00,7.00,567000.00,16.00,1205280.00,8738280.00,'validee','especes',NULL,'2026-08-07 13:02:19'),
(3,'VNT-1786442636947',NULL,4,5000000.00,3.00,150000.00,10.00,485000.00,5335000.00,'validee','virement',NULL,'2026-08-11 13:03:56'),
(4,'VNT-1779530715203',NULL,4,520000.00,4.00,20800.00,13.00,64896.00,564096.00,'validee','mobile_money',NULL,'2026-05-23 13:05:15');

INSERT INTO `lignes_achat` VALUES
(1,1,9,1,200000.00,200000.00),
(2,2,11,4,30000.00,120000.00),
(3,2,21,10,4000.00,40000.00),
(4,2,13,4,9999.99,39999.96);

INSERT INTO `lignes_vente` VALUES
(1,1,20,1,230000.00,230000.00),
(2,2,2,3,2700000.00,8100000.00),
(3,3,3,2,2500000.00,5000000.00),
(4,4,7,2,260000.00,520000.00);

INSERT INTO `mouvements_stock` VALUES
(1,20,'sortie',1,'Vente','VNT-1786437503361',4,'2026-08-11 11:38:23'),
(2,9,'entree',1,'Achat fournisseur','ACH-1786437584272',4,'2026-08-07 13:01:13'),
(3,2,'sortie',3,'Vente','VNT-1786096939734',4,'2026-08-07 13:02:19'),
(4,3,'sortie',2,'Vente','VNT-1786442636947',4,'2026-08-11 13:03:56'),
(5,7,'sortie',2,'Vente','VNT-1779530715203',4,'2026-05-23 13:05:15'),
(6,11,'entree',4,'Achat fournisseur','ACH-1779530860180',4,'2026-05-23 13:07:58'),
(7,21,'entree',10,'Achat fournisseur','ACH-1779530860180',4,'2026-05-23 13:07:58'),
(8,13,'entree',4,'Achat fournisseur','ACH-1779530860180',4,'2026-05-23 13:07:58');

INSERT INTO `paiements` VALUES
(1,1,237820.00,'especes','paye',NULL,4,'2026-08-11 11:38:23'),
(2,2,8738280.00,'especes','paye',NULL,4,'2026-08-07 13:02:19'),
(3,3,5335000.00,'virement','paye',NULL,4,'2026-08-11 13:03:56'),
(4,4,564096.00,'mobile_money','paye',NULL,4,'2026-05-23 13:05:15');

INSERT INTO `alertes_stock` VALUES
(1,2,'Stock critique : Dell Inspiron 15 (5 restant)','faible',0,'2026-08-07 13:02:19'),
(2,3,'Stock critique : Lenovo IdeaPad 3 (4 restant)','faible',0,'2026-08-11 13:03:56'),
(3,7,'Stock critique : RAM DDR4 16GB (2 restant)','faible',0,'2026-05-23 13:05:15');

-- ============================================================
-- 5. CONTRAINTES / FOREIGN KEYS
-- Toutes les tables et toutes les donnees existent deja.
-- Donc aucun #1824 ne peut se produire ici.
-- ============================================================

ALTER TABLE `produits`
  ADD CONSTRAINT `fk_prod_cat`
    FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prod_four`
    FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prod_marq`
    FOREIGN KEY (`marque_id`) REFERENCES `marques` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `achats`
  ADD CONSTRAINT `fk_ach_four`
    FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`)
    ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_ach_user`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
    ON DELETE SET NULL;

ALTER TABLE `ventes`
  ADD CONSTRAINT `fk_v_client`
    FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
    ON DELETE SET NULL,
  ADD CONSTRAINT `fk_v_user`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
    ON DELETE SET NULL;

ALTER TABLE `lignes_achat`
  ADD CONSTRAINT `fk_la_achat`
    FOREIGN KEY (`achat_id`) REFERENCES `achats` (`id`)
    ON DELETE CASCADE,
  ADD CONSTRAINT `fk_la_prod`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`)
    ON DELETE RESTRICT;

ALTER TABLE `lignes_vente`
  ADD CONSTRAINT `fk_lv_prod`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`)
    ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_lv_vente`
    FOREIGN KEY (`vente_id`) REFERENCES `ventes` (`id`)
    ON DELETE CASCADE;

ALTER TABLE `mouvements_stock`
  ADD CONSTRAINT `fk_ms_prod`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`)
    ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ms_user`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
    ON DELETE SET NULL;

ALTER TABLE `paiements`
  ADD CONSTRAINT `fk_pay_user`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
    ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pay_vente`
    FOREIGN KEY (`vente_id`) REFERENCES `ventes` (`id`)
    ON DELETE CASCADE;

ALTER TABLE `alertes_stock`
  ADD CONSTRAINT `fk_al_prod`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`)
    ON DELETE CASCADE;

-- ============================================================
-- 6. TRIGGERS
-- ============================================================

DELIMITER $$

CREATE TRIGGER `trg_ligne_achat_apres_insert`
AFTER INSERT ON `lignes_achat`
FOR EACH ROW
BEGIN
  UPDATE `achats`
  SET `total` = (
    SELECT COALESCE(SUM(`total_ligne`),0)
    FROM `lignes_achat`
    WHERE `achat_id` = NEW.`achat_id`
  )
  WHERE `id` = NEW.`achat_id`;
END$$

CREATE TRIGGER `trg_ligne_vente_avant_insert`
BEFORE INSERT ON `lignes_vente`
FOR EACH ROW
BEGIN
  SET NEW.`total_ligne` = NEW.`quantite` * NEW.`prix_unitaire`;
END$$

CREATE TRIGGER `trg_produit_avant_insert`
BEFORE INSERT ON `produits`
FOR EACH ROW
BEGIN
  IF NEW.`prix_vente` < NEW.`prix_achat` THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Le prix de vente doit etre superieur ou egal au prix d achat';
  END IF;
END$$

CREATE TRIGGER `trg_produit_apres_maj`
AFTER UPDATE ON `produits`
FOR EACH ROW
BEGIN
  IF NEW.`quantite` <= NEW.`seuil_alerte`
     AND (OLD.`quantite` > OLD.`seuil_alerte`
          OR OLD.`quantite` <> NEW.`quantite`) THEN
    INSERT INTO `alertes_stock` (`produit_id`,`message`,`niveau`)
    VALUES (
      NEW.`id`,
      CONCAT('Stock critique : ',NEW.`nom`,' (',NEW.`quantite`,' restant)'),
      IF(NEW.`quantite` <= 0,'rupture','faible')
    );
  END IF;
END$$

-- ============================================================
-- 7. PROCEDURES STOCKEES
-- ============================================================

CREATE PROCEDURE `sp_dashboard_stats`()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM `produits`) AS total_produits,
    (SELECT COUNT(*) FROM `produits` WHERE `quantite` <= 0) AS produits_rupture,
    (SELECT COUNT(*) FROM `produits` WHERE `quantite` > 0 AND `quantite` <= `seuil_alerte`) AS stock_faible,
    (SELECT COUNT(*) FROM `clients`) AS total_clients,
    (SELECT COUNT(*) FROM `fournisseurs`) AS total_fournisseurs,
    (SELECT COUNT(*) FROM `ventes` WHERE `statut`='validee') AS total_ventes,
    (SELECT COUNT(*) FROM `achats` WHERE `statut`='validee') AS total_achats,
    (SELECT COALESCE(SUM(`total`),0) FROM `ventes`
      WHERE `statut`='validee' AND DATE(`date_vente`)=CURDATE()) AS ca_jour,
    (SELECT COALESCE(SUM(`total`),0) FROM `ventes`
      WHERE `statut`='validee'
      AND YEAR(`date_vente`)=YEAR(CURDATE())
      AND MONTH(`date_vente`)=MONTH(CURDATE())) AS ca_mois,
    (SELECT COALESCE(SUM(`total`),0) FROM `ventes`
      WHERE `statut`='validee'
      AND YEAR(`date_vente`)=YEAR(CURDATE())) AS ca_annee;
END$$

CREATE PROCEDURE `sp_marge_periode`(
  IN `p_debut` DATETIME,
  IN `p_fin` DATETIME
)
BEGIN
  SELECT
    COALESCE(SUM(`lv`.`total_ligne`),0) AS chiffre,
    COALESCE(SUM(`lv`.`quantite` * `p`.`prix_achat`),0) AS cout,
    COALESCE(SUM(`lv`.`total_ligne` - `lv`.`quantite` * `p`.`prix_achat`),0) AS marge
  FROM `lignes_vente` `lv`
  JOIN `ventes` `v`
    ON `v`.`id`=`lv`.`vente_id` AND `v`.`statut`='validee'
  JOIN `produits` `p`
    ON `p`.`id`=`lv`.`produit_id`
  WHERE `v`.`date_vente` BETWEEN `p_debut` AND `p_fin`;
END$$

CREATE PROCEDURE `sp_mouvement_stock`(
  IN `p_produit_id` INT,
  IN `p_type` VARCHAR(20),
  IN `p_quantite` INT,
  IN `p_motif` VARCHAR(255),
  IN `p_utilisateur` INT
)
BEGIN
  DECLARE v_stock INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT `quantite`
  INTO v_stock
  FROM `produits`
  WHERE `id`=p_produit_id
  FOR UPDATE;

  IF p_type='entree' THEN
    UPDATE `produits`
    SET `quantite`=`quantite`+p_quantite
    WHERE `id`=p_produit_id;

  ELSEIF p_type='sortie' THEN

    IF v_stock < p_quantite THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Stock insuffisant';
    END IF;

    UPDATE `produits`
    SET `quantite`=`quantite`-p_quantite
    WHERE `id`=p_produit_id;

  ELSE
    UPDATE `produits`
    SET `quantite`=p_quantite
    WHERE `id`=p_produit_id;
  END IF;

  INSERT INTO `mouvements_stock`
    (`produit_id`,`type`,`quantite`,`motif`,`utilisateur_id`)
  VALUES
    (p_produit_id,p_type,p_quantite,p_motif,p_utilisateur);

  COMMIT;
END$$

CREATE PROCEDURE `sp_rapport_ventes`(
  IN `p_debut` DATETIME,
  IN `p_fin` DATETIME
)
BEGIN
  SELECT
    DATE(`v`.`date_vente`) AS jour,
    COUNT(*) AS nb_ventes,
    SUM(`v`.`sous_total`) AS sous_total,
    SUM(`v`.`montant_tva`) AS tva,
    SUM(`v`.`total`) AS total
  FROM `ventes` `v`
  WHERE `v`.`statut`='validee'
    AND `v`.`date_vente` BETWEEN p_debut AND p_fin
  GROUP BY DATE(`v`.`date_vente`)
  ORDER BY jour;
END$$

DELIMITER ;

-- ============================================================
-- 8. VUES
-- ============================================================

CREATE OR REPLACE ALGORITHM=UNDEFINED
SQL SECURITY DEFINER
VIEW `vue_historique_client` AS
SELECT
  `cl`.`id` AS `client_id`,
  CONCAT(`cl`.`prenom`,' ',`cl`.`nom`) AS `client`,
  COUNT(`v`.`id`) AS `nb_achats`,
  COALESCE(SUM(`v`.`total`),0) AS `total_depense`,
  MAX(`v`.`date_vente`) AS `dernier_achat`
FROM `clients` `cl`
LEFT JOIN `ventes` `v`
  ON `v`.`client_id`=`cl`.`id`
 AND `v`.`statut`='validee'
GROUP BY `cl`.`id`, `client`;

CREATE OR REPLACE ALGORITHM=UNDEFINED
SQL SECURITY DEFINER
VIEW `vue_meilleurs_produits` AS
SELECT
  `p`.`id` AS `id`,
  `p`.`nom` AS `nom`,
  SUM(`lv`.`quantite`) AS `quantite_vendue`,
  SUM(`lv`.`total_ligne`) AS `chiffre`
FROM `lignes_vente` `lv`
JOIN `ventes` `v`
  ON `v`.`id`=`lv`.`vente_id`
 AND `v`.`statut`='validee'
JOIN `produits` `p`
  ON `p`.`id`=`lv`.`produit_id`
GROUP BY `p`.`id`, `p`.`nom`;

CREATE OR REPLACE ALGORITHM=UNDEFINED
SQL SECURITY DEFINER
VIEW `vue_produits_details` AS
SELECT
  `p`.`id` AS `id`,
  `p`.`reference` AS `reference`,
  `p`.`code_barres` AS `code_barres`,
  `p`.`nom` AS `nom`,
  `p`.`prix_achat` AS `prix_achat`,
  `p`.`prix_vente` AS `prix_vente`,
  `p`.`quantite` AS `quantite`,
  `p`.`seuil_alerte` AS `seuil_alerte`,
  `c`.`nom` AS `categorie`,
  `m`.`nom` AS `marque`,
  `f`.`nom` AS `fournisseur`,
  (`p`.`prix_vente`-`p`.`prix_achat`) AS `marge_unitaire`,
  CASE
    WHEN `p`.`quantite`<=0 THEN 'rupture'
    WHEN `p`.`quantite`<=`p`.`seuil_alerte` THEN 'faible'
    ELSE 'normal'
  END AS `etat_stock`
FROM `produits` `p`
LEFT JOIN `categories` `c` ON `c`.`id`=`p`.`categorie_id`
LEFT JOIN `marques` `m` ON `m`.`id`=`p`.`marque_id`
LEFT JOIN `fournisseurs` `f` ON `f`.`id`=`p`.`fournisseur_id`;

CREATE OR REPLACE ALGORITHM=UNDEFINED
SQL SECURITY DEFINER
VIEW `vue_stock_alerte` AS
SELECT
  `produits`.`id` AS `id`,
  `produits`.`reference` AS `reference`,
  `produits`.`nom` AS `nom`,
  `produits`.`quantite` AS `quantite`,
  `produits`.`seuil_alerte` AS `seuil_alerte`,
  CASE
    WHEN `produits`.`quantite`<=0 THEN 'rupture'
    ELSE 'faible'
  END AS `niveau`
FROM `produits`
WHERE `produits`.`quantite`<=`produits`.`seuil_alerte`;

CREATE OR REPLACE ALGORITHM=UNDEFINED
SQL SECURITY DEFINER
VIEW `vue_ventes_journalieres` AS
SELECT
  CAST(`ventes`.`date_vente` AS DATE) AS `jour`,
  COUNT(0) AS `nb_ventes`,
  SUM(`ventes`.`sous_total`) AS `sous_total`,
  SUM(`ventes`.`montant_remise`) AS `remises`,
  SUM(`ventes`.`montant_tva`) AS `tva`,
  SUM(`ventes`.`total`) AS `chiffre_affaires`
FROM `ventes`
WHERE `ventes`.`statut`='validee'
GROUP BY CAST(`ventes`.`date_vente` AS DATE);

-- ============================================================
-- FIN
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;

-- Verification rapide
SELECT 'IMPORT GIGATECH TERMINE' AS message;
SELECT TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA='gigatech'
ORDER BY TABLE_NAME;
