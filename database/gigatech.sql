-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 11 août 2026 à 11:28
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gigatech`
--
CREATE DATABASE IF NOT EXISTS `gigatech` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gigatech`;

DELIMITER $$
--
-- Procédures
--
DROP PROCEDURE IF EXISTS `sp_dashboard_stats`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_stats` ()   BEGIN
  SELECT
    (SELECT COUNT(*) FROM produits) AS total_produits,
    (SELECT COUNT(*) FROM produits WHERE quantite <= 0) AS produits_rupture,
    (SELECT COUNT(*) FROM produits WHERE quantite > 0 AND quantite <= seuil_alerte) AS stock_faible,
    (SELECT COUNT(*) FROM clients) AS total_clients,
    (SELECT COUNT(*) FROM fournisseurs) AS total_fournisseurs,
    (SELECT COUNT(*) FROM ventes WHERE statut='validee') AS total_ventes,
    (SELECT COUNT(*) FROM achats WHERE statut='validee') AS total_achats,
    (SELECT COALESCE(SUM(total),0) FROM ventes WHERE statut='validee' AND DATE(date_vente)=CURDATE()) AS ca_jour,
    (SELECT COALESCE(SUM(total),0) FROM ventes WHERE statut='validee'
       AND YEAR(date_vente)=YEAR(CURDATE()) AND MONTH(date_vente)=MONTH(CURDATE())) AS ca_mois,
    (SELECT COALESCE(SUM(total),0) FROM ventes WHERE statut='validee'
       AND YEAR(date_vente)=YEAR(CURDATE())) AS ca_annee;
END$$

DROP PROCEDURE IF EXISTS `sp_marge_periode`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_marge_periode` (IN `p_debut` DATETIME, IN `p_fin` DATETIME)   BEGIN
  SELECT COALESCE(SUM(lv.total_ligne),0) AS chiffre,
         COALESCE(SUM(lv.quantite * p.prix_achat),0) AS cout,
         COALESCE(SUM(lv.total_ligne - lv.quantite * p.prix_achat),0) AS marge
  FROM lignes_vente lv
  JOIN ventes v   ON v.id = lv.vente_id AND v.statut='validee'
  JOIN produits p ON p.id = lv.produit_id
  WHERE v.date_vente BETWEEN p_debut AND p_fin;
END$$

DROP PROCEDURE IF EXISTS `sp_mouvement_stock`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_mouvement_stock` (IN `p_produit_id` INT, IN `p_type` VARCHAR(20), IN `p_quantite` INT, IN `p_motif` VARCHAR(255), IN `p_utilisateur` INT)   BEGIN
  DECLARE v_stock INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
    SELECT quantite INTO v_stock FROM produits WHERE id = p_produit_id FOR UPDATE;
    IF p_type = 'entree' THEN
      UPDATE produits SET quantite = quantite + p_quantite WHERE id = p_produit_id;
    ELSEIF p_type = 'sortie' THEN
      IF v_stock < p_quantite THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuffisant';
      END IF;
      UPDATE produits SET quantite = quantite - p_quantite WHERE id = p_produit_id;
    ELSE
      UPDATE produits SET quantite = p_quantite WHERE id = p_produit_id;
    END IF;
    INSERT INTO mouvements_stock (produit_id, type, quantite, motif, utilisateur_id)
      VALUES (p_produit_id, p_type, p_quantite, p_motif, p_utilisateur);
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS `sp_rapport_ventes`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_rapport_ventes` (IN `p_debut` DATETIME, IN `p_fin` DATETIME)   BEGIN
  SELECT DATE(v.date_vente) AS jour, COUNT(*) AS nb_ventes,
         SUM(v.sous_total) AS sous_total, SUM(v.montant_tva) AS tva, SUM(v.total) AS total
  FROM ventes v
  WHERE v.statut = 'validee' AND v.date_vente BETWEEN p_debut AND p_fin
  GROUP BY DATE(v.date_vente) ORDER BY jour;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `achats`
--

DROP TABLE IF EXISTS `achats`;
CREATE TABLE IF NOT EXISTS `achats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fournisseur_id` int NOT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `statut` enum('brouillon','validee','annulee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_achat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `fk_ach_four` (`fournisseur_id`),
  KEY `fk_ach_user` (`utilisateur_id`),
  KEY `idx_ach_date` (`date_achat`),
  KEY `idx_ach_statut` (`statut`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `achats`
--

INSERT INTO `achats` (`id`, `numero`, `fournisseur_id`, `utilisateur_id`, `total`, `statut`, `note`, `date_achat`) VALUES
(1, 'ACH-1786437584272', 4, 4, 200000.00, 'validee', NULL, '2026-08-11 11:39:44'),
(2, 'ACH-1779530860180', 4, 4, 199999.96, 'validee', NULL, '2026-05-23 13:07:40');

-- --------------------------------------------------------

--
-- Structure de la table `alertes_stock`
--

DROP TABLE IF EXISTS `alertes_stock`;
CREATE TABLE IF NOT EXISTS `alertes_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_id` int NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niveau` enum('faible','rupture') COLLATE utf8mb4_unicode_ci NOT NULL,
  `vue` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_al_prod` (`produit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `alertes_stock`
--

INSERT INTO `alertes_stock` (`id`, `produit_id`, `message`, `niveau`, `vue`, `created_at`) VALUES
(1, 2, 'Stock critique : Dell Inspiron 15 (5 restant)', 'faible', 0, '2026-08-07 13:02:19'),
(2, 3, 'Stock critique : Lenovo IdeaPad 3 (4 restant)', 'faible', 0, '2026-08-11 13:03:56'),
(3, 7, 'Stock critique : RAM DDR4 16GB (2 restant)', 'faible', 0, '2026-05-23 13:05:15');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'Ordinateurs', 'Ordinateurs portables et de bureau', '2026-08-11 11:26:30'),
(2, 'Téléphones', 'Smartphones et téléphones mobiles', '2026-08-11 11:26:30'),
(3, 'Composants', 'Composants informatiques', '2026-08-11 11:26:30'),
(4, 'Périphériques', 'Claviers, souris, écrans et accessoires', '2026-08-11 11:26:30'),
(5, 'Réseaux', 'Équipements réseau et connectivité', '2026-08-11 11:26:30'),
(6, 'Stockage', 'Disques, SSD, clés USB et cartes mémoire', '2026-08-11 11:26:30');

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_client` enum('particulier','entreprise','revendeur') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'particulier',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client` (`nom`,`telephone`),
  KEY `idx_client_type` (`type_client`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `nom`, `prenom`, `telephone`, `email`, `adresse`, `ville`, `type_client`, `created_at`) VALUES
(1, 'Rakoto', 'Jean', '034 60 100 01', 'jean.rakoto@gmail.com', 'Lot IV A 12', 'Antananarivo', 'particulier', '2026-08-11 11:26:31'),
(2, 'Rasoanaivo', 'Mamy', '032 60 100 02', 'mamy.rasoanaivo@gmail.com', 'Ankadifotsy', 'Antananarivo', 'particulier', '2026-08-11 11:26:31'),
(3, 'Randria', 'Hery', '033 60 100 03', 'hery.randria@gmail.com', 'Ambohipo', 'Antananarivo', 'particulier', '2026-08-11 11:26:31'),
(4, 'Rakotomalala', 'Nina', '034 60 100 04', 'nina.rakotomalala@gmail.com', 'Ivandry', 'Antananarivo', 'particulier', '2026-08-11 11:26:31'),
(5, 'Andriamihaja', 'Paul', '032 60 100 05', 'paul.andriamihaja@gmail.com', 'Mahajanga', 'Mahajanga', 'particulier', '2026-08-11 11:26:31'),
(6, 'Giga Business', NULL, '033 70 200 01', 'contact@gigabusiness.mg', 'Zone Industrielle', 'Antananarivo', 'entreprise', '2026-08-11 11:26:31'),
(7, 'Smart Office', NULL, '034 70 200 02', 'contact@smartoffice.mg', 'Ankorondrano', 'Antananarivo', 'entreprise', '2026-08-11 11:26:31'),
(8, 'Madagascar Services', NULL, '032 70 200 03', 'contact@madagascarservices.mg', 'Behoririka', 'Antananarivo', 'entreprise', '2026-08-11 11:26:31'),
(9, 'Tech Reseller', NULL, '033 70 200 04', 'contact@techreseller.mg', 'Analakely', 'Antananarivo', 'revendeur', '2026-08-11 11:26:31'),
(10, 'Digital Market', NULL, '034 70 200 05', 'contact@digitalmarket.mg', 'Andraharo', 'Antananarivo', 'revendeur', '2026-08-11 11:26:31');

-- --------------------------------------------------------

--
-- Structure de la table `employes`
--

DROP TABLE IF EXISTS `employes`;
CREATE TABLE IF NOT EXISTS `employes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poste` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salaire` decimal(12,2) NOT NULL DEFAULT '0.00',
  `date_embauche` date DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_emp_poste` (`poste`)
) ;

--
-- Déchargement des données de la table `employes`
--

INSERT INTO `employes` (`id`, `nom`, `prenom`, `poste`, `telephone`, `email`, `adresse`, `salaire`, `date_embauche`, `actif`, `created_at`) VALUES
(1, 'Rakotosoa', 'Mickael', 'Responsable magasin', '034 80 100 01', 'mickael@gigatech.com', 'Antananarivo', 1200000.00, '2026-03-02', 1, '2026-08-11 11:26:31'),
(2, 'Ralimanana', 'Sandra', 'Caissière', '032 80 100 02', 'sandra@gigatech.com', 'Antananarivo', 850000.00, '2026-04-28', 1, '2026-08-11 11:26:31'),
(3, 'Andriamamonjy', 'Kevin', 'Magasinier', '033 80 100 03', 'kevin@gigatech.com', 'Antananarivo', 900000.00, '2026-04-07', 1, '2026-08-11 11:26:31'),
(4, 'Rasolofoniaina', 'Laura', 'Gestionnaire', '034 80 100 04', 'laura@gigatech.com', 'Antananarivo', 1100000.00, '2026-07-16', 1, '2026-08-11 11:26:31');

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

DROP TABLE IF EXISTS `fournisseurs`;
CREATE TABLE IF NOT EXISTS `fournisseurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `societe` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fourn` (`nom`,`telephone`),
  KEY `idx_fourn_ville` (`ville`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `fournisseurs`
--

INSERT INTO `fournisseurs` (`id`, `nom`, `telephone`, `email`, `adresse`, `societe`, `ville`, `pays`, `created_at`) VALUES
(1, 'Tech Madagascar', '034 11 111 11', 'contact@techmadagascar.mg', 'Antananarivo', 'Tech Madagascar SARL', 'Antananarivo', 'Madagascar', '2026-08-11 11:26:30'),
(2, 'Info Supply', '032 22 222 22', 'contact@infosupply.mg', 'Analakely', 'Info Supply SARL', 'Antananarivo', 'Madagascar', '2026-08-11 11:26:30'),
(3, 'Digital Solutions', '033 33 333 33', 'commercial@digitalsolutions.mg', 'Behoririka', 'Digital Solutions', 'Antananarivo', 'Madagascar', '2026-08-11 11:26:30'),
(4, 'Smart Distribution', '034 44 444 44', 'vente@smartdistribution.mg', 'Andraharo', 'Smart Distribution', 'Antananarivo', 'Madagascar', '2026-08-11 11:26:30'),
(5, 'Network Pro', '032 55 555 55', 'contact@networkpro.mg', 'Ankorondrano', 'Network Pro SARL', 'Antananarivo', 'Madagascar', '2026-08-11 11:26:30');

-- --------------------------------------------------------

--
-- Structure de la table `lignes_achat`
--

DROP TABLE IF EXISTS `lignes_achat`;
CREATE TABLE IF NOT EXISTS `lignes_achat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `achat_id` int NOT NULL,
  `produit_id` int NOT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire` decimal(12,2) NOT NULL,
  `total_ligne` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_la_achat` (`achat_id`),
  KEY `idx_la_prod` (`produit_id`)
) ;

--
-- Déchargement des données de la table `lignes_achat`
--

INSERT INTO `lignes_achat` (`id`, `achat_id`, `produit_id`, `quantite`, `prix_unitaire`, `total_ligne`) VALUES
(1, 1, 9, 1, 200000.00, 200000.00),
(2, 2, 11, 4, 30000.00, 120000.00),
(3, 2, 21, 10, 4000.00, 40000.00),
(4, 2, 13, 4, 9999.99, 39999.96);

--
-- Déclencheurs `lignes_achat`
--
DROP TRIGGER IF EXISTS `trg_ligne_achat_apres_insert`;
DELIMITER $$
CREATE TRIGGER `trg_ligne_achat_apres_insert` AFTER INSERT ON `lignes_achat` FOR EACH ROW BEGIN
  UPDATE achats SET total = (SELECT COALESCE(SUM(total_ligne),0) FROM lignes_achat WHERE achat_id = NEW.achat_id)
  WHERE id = NEW.achat_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `lignes_vente`
--

DROP TABLE IF EXISTS `lignes_vente`;
CREATE TABLE IF NOT EXISTS `lignes_vente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vente_id` int NOT NULL,
  `produit_id` int NOT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire` decimal(12,2) NOT NULL,
  `total_ligne` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lv_prod` (`produit_id`),
  KEY `idx_lv_vente_prod` (`vente_id`,`produit_id`)
) ;

--
-- Déchargement des données de la table `lignes_vente`
--

INSERT INTO `lignes_vente` (`id`, `vente_id`, `produit_id`, `quantite`, `prix_unitaire`, `total_ligne`) VALUES
(1, 1, 20, 1, 230000.00, 230000.00),
(2, 2, 2, 3, 2700000.00, 8100000.00),
(3, 3, 3, 2, 2500000.00, 5000000.00),
(4, 4, 7, 2, 260000.00, 520000.00);

--
-- Déclencheurs `lignes_vente`
--
DROP TRIGGER IF EXISTS `trg_ligne_vente_avant_insert`;
DELIMITER $$
CREATE TRIGGER `trg_ligne_vente_avant_insert` BEFORE INSERT ON `lignes_vente` FOR EACH ROW BEGIN
  SET NEW.total_ligne = NEW.quantite * NEW.prix_unitaire;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `marques`
--

DROP TABLE IF EXISTS `marques`;
CREATE TABLE IF NOT EXISTS `marques` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pays` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `marques`
--

INSERT INTO `marques` (`id`, `nom`, `pays`, `logo`, `description`, `created_at`) VALUES
(1, 'HP', 'États-Unis', NULL, 'Fabricant informatique', '2026-08-11 11:26:30'),
(2, 'Dell', 'États-Unis', NULL, 'Ordinateurs et équipements professionnels', '2026-08-11 11:26:30'),
(3, 'Lenovo', 'Chine', NULL, 'Ordinateurs professionnels et grand public', '2026-08-11 11:26:30'),
(4, 'Samsung', 'Corée du Sud', NULL, 'Smartphones et électronique', '2026-08-11 11:26:30'),
(5, 'Logitech', 'Suisse', NULL, 'Périphériques informatiques', '2026-08-11 11:26:30'),
(6, 'TP-Link', 'Chine', NULL, 'Équipements réseau', '2026-08-11 11:26:30');

-- --------------------------------------------------------

--
-- Structure de la table `mouvements_stock`
--

DROP TABLE IF EXISTS `mouvements_stock`;
CREATE TABLE IF NOT EXISTS `mouvements_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_id` int NOT NULL,
  `type` enum('entree','sortie','ajustement') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantite` int NOT NULL,
  `motif` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ms_prod` (`produit_id`),
  KEY `fk_ms_user` (`utilisateur_id`),
  KEY `idx_ms_date` (`created_at`),
  KEY `idx_ms_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `mouvements_stock`
--

INSERT INTO `mouvements_stock` (`id`, `produit_id`, `type`, `quantite`, `motif`, `reference`, `utilisateur_id`, `created_at`) VALUES
(1, 20, 'sortie', 1, 'Vente', 'VNT-1786437503361', 4, '2026-08-11 11:38:23'),
(2, 9, 'entree', 1, 'Achat fournisseur', 'ACH-1786437584272', 4, '2026-08-07 13:01:13'),
(3, 2, 'sortie', 3, 'Vente', 'VNT-1786096939734', 4, '2026-08-07 13:02:19'),
(4, 3, 'sortie', 2, 'Vente', 'VNT-1786442636947', 4, '2026-08-11 13:03:56'),
(5, 7, 'sortie', 2, 'Vente', 'VNT-1779530715203', 4, '2026-05-23 13:05:15'),
(6, 11, 'entree', 4, 'Achat fournisseur', 'ACH-1779530860180', 4, '2026-05-23 13:07:58'),
(7, 21, 'entree', 10, 'Achat fournisseur', 'ACH-1779530860180', 4, '2026-05-23 13:07:58'),
(8, 13, 'entree', 4, 'Achat fournisseur', 'ACH-1779530860180', 4, '2026-05-23 13:07:58');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
CREATE TABLE IF NOT EXISTS `paiements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vente_id` int NOT NULL,
  `montant` decimal(14,2) NOT NULL,
  `mode` enum('especes','mobile_money','carte_bancaire','virement') COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('en_attente','paye','echoue','rembourse') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paye',
  `reference` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pay_vente` (`vente_id`),
  KEY `fk_pay_user` (`utilisateur_id`),
  KEY `idx_pay_mode` (`mode`)
) ;

--
-- Déchargement des données de la table `paiements`
--

INSERT INTO `paiements` (`id`, `vente_id`, `montant`, `mode`, `statut`, `reference`, `utilisateur_id`, `created_at`) VALUES
(1, 1, 237820.00, 'especes', 'paye', NULL, 4, '2026-08-11 11:38:23'),
(2, 2, 8738280.00, 'especes', 'paye', NULL, 4, '2026-08-07 13:02:19'),
(3, 3, 5335000.00, 'virement', 'paye', NULL, 4, '2026-08-11 13:03:56'),
(4, 4, 564096.00, 'mobile_money', 'paye', NULL, 4, '2026-05-23 13:05:15');

-- --------------------------------------------------------

--
-- Structure de la table `parametres`
--

DROP TABLE IF EXISTS `parametres`;
CREATE TABLE IF NOT EXISTS `parametres` (
  `id` int NOT NULL DEFAULT '1',
  `entreprise` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GigaTech',
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_web` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rccm` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nif` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `devise` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `tva` decimal(5,2) NOT NULL DEFAULT '16.00',
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `parametres`
--

INSERT INTO `parametres` (`id`, `entreprise`, `adresse`, `telephone`, `email`, `site_web`, `rccm`, `nif`, `devise`, `tva`, `logo`) VALUES
(1, 'GigaTech', 'Av. du Commerce 145, Gombe, Kinshasa', '+243 810 000 000', 'contact@gigatech.cd', 'www.gigatech.cd', 'CD/KIN/RCCM/22-B-1234', 'A2212345X', 'USD', 16.00, '/uploads/1786440382614-688745-logo.png');

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

DROP TABLE IF EXISTS `produits`;
CREATE TABLE IF NOT EXISTS `produits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_barres` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `categorie_id` int NOT NULL,
  `marque_id` int DEFAULT NULL,
  `fournisseur_id` int DEFAULT NULL,
  `prix_achat` decimal(12,2) NOT NULL DEFAULT '0.00',
  `prix_vente` decimal(12,2) NOT NULL DEFAULT '0.00',
  `quantite` int NOT NULL DEFAULT '0',
  `seuil_alerte` int NOT NULL DEFAULT '5',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `garantie_mois` int NOT NULL DEFAULT '12',
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  UNIQUE KEY `code_barres` (`code_barres`),
  KEY `fk_prod_marq` (`marque_id`),
  KEY `fk_prod_four` (`fournisseur_id`),
  KEY `idx_prod_nom` (`nom`),
  KEY `idx_prod_cat` (`categorie_id`),
  KEY `idx_prod_stock` (`quantite`),
  KEY `idx_prod_ref_nom` (`reference`,`nom`)
) ;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `reference`, `code_barres`, `nom`, `description`, `categorie_id`, `marque_id`, `fournisseur_id`, `prix_achat`, `prix_vente`, `quantite`, `seuil_alerte`, `image`, `garantie_mois`, `actif`, `created_at`, `updated_at`) VALUES
(1, 'PC-HP-001', '100000000001', 'HP Laptop 15', 'Ordinateur portable HP 15 pouces', 1, 1, 1, 1800000.00, 2300000.00, 12, 5, '/uploads/1786441259441-291886-ASUS_.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:40:59'),
(2, 'PC-DELL-001', '100000000002', 'Dell Inspiron 15', 'Ordinateur portable professionnel Dell', 1, 2, 2, 2100000.00, 2700000.00, 5, 5, '/uploads/1786441232671-389193-is1.jpg', 12, 1, '2026-08-11 11:26:31', '2026-08-07 13:02:19'),
(3, 'PC-LEN-001', '100000000003', 'Lenovo IdeaPad 3', 'Ordinateur portable Lenovo', 1, 3, 3, 1950000.00, 2500000.00, 4, 5, '/uploads/1786441218556-334060-dd.jpg', 12, 1, '2026-08-11 11:26:31', '2026-08-11 13:03:56'),
(4, 'PHONE-SAM-001', '100000000004', 'Samsung 46', 'Portable Samsung Galaxy A15', 1, 4, 4, 650000.00, 850000.00, 18, 5, '/uploads/1786441198823-125369-is2.jpg', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:39:58'),
(5, 'COMP-SAM-002', '100000000005', 'Supercomputers A25', 'Supercomputers A25', 1, 4, 4, 950000.00, 1250000.00, 9, 5, '/uploads/1786441122448-581786-FB_IMG_17451412200171268.jpg', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:38:42'),
(6, 'RAM-001', '100000000006', 'RAM DDR4 8GB', 'Mémoire vive DDR4 8GB', 3, 2, 2, 95000.00, 140000.00, 25, 5, '/uploads/1786440969047-963176-pexels-tanasovich-2588757.jpg', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:36:09'),
(7, 'RAM-002', '100000000007', 'RAM DDR4 16GB', 'Mémoire vive DDR4 16GB', 3, 2, 2, 180000.00, 260000.00, 2, 5, '/uploads/1786440929939-432256-kingston.jpg', 12, 1, '2026-08-11 11:26:31', '2026-05-23 13:05:15'),
(8, 'SSD-001', '100000000008', 'SSD 256GB', 'SSD SATA 256GB', 6, 1, 1, 150000.00, 220000.00, 15, 5, '/uploads/1786440901390-804962-hq720.jpg', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:35:01'),
(9, 'SSD-002', '100000000009', 'SSD 512GB', 'SSD SATA 512GB', 6, 1, 1, 200000.00, 390000.00, 8, 5, '/uploads/1786440793506-710063-ssd_1_to_nvme.png', 12, 1, '2026-08-11 11:26:31', '2026-08-07 13:01:13'),
(10, 'USB-001', '100000000010', 'Clé USB 64GB', 'Clé USB 64GB', 6, 4, 3, 45000.00, 75000.00, 30, 8, '/uploads/1786440776998-242921-USB_128.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:32:57'),
(11, 'CHARGE-001', '100000000011', 'Chargeur PC', 'Souris sans fil Logitech', 4, 5, 3, 30000.00, 75000.00, 24, 5, '/uploads/1786440665918-426527-chargeur_PC.png', 12, 1, '2026-08-11 11:26:31', '2026-05-23 13:07:58'),
(12, 'ALIM -001', '100000000012', 'Alimentation Logitech K120', 'Clavier USB Logitech', 4, 5, 3, 55000.00, 90000.00, 16, 5, '/uploads/1786440615406-893329-onduleur_1200_va.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:43:30'),
(13, 'ROUTER-001', '100000000013', 'RJ45 TP-Link', 'Routeur WiFi TP-Link', 5, 6, 5, 9999.99, 180000.00, 14, 5, '/uploads/1786440592799-344310-Cable_RJ45.png', 12, 1, '2026-08-11 11:26:31', '2026-05-23 13:07:58'),
(15, 'HAUT-001', '100000000015', 'Haut_parleur', 'Moniteur Full HD 24 pouces', 4, 1, 1, 500000.00, 680000.00, 6, 3, '/uploads/1786440549736-521213-Haut_parleur.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:45:17'),
(16, 'CAM-002', '100000000016', 'WebCAM', 'Moniteur Dell Full HD', 4, 2, 2, 550000.00, 750000.00, 2, 3, '/uploads/1786440536682-8834-WebCam_HD.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:44:43'),
(17, 'LAPTOP-001', '100000000017', 'Lenovo ThinkPad', 'Ordinateur professionnel Lenovo ThinkPad', 1, 3, 3, 3200000.00, 4100000.00, 5, 3, '/uploads/1786440476509-974328-Mac_book.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:27:56'),
(18, 'PHONE-001', '100000000018', 'Samsung Galaxy S23', 'Smartphone haut de gamme Samsung', 2, 4, 4, 2800000.00, 3500000.00, 3, 3, '/uploads/1786440510181-699857-USB_128.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:28:30'),
(19, 'SSD-003', '100000000019', 'SSD NVMe 1TB', 'SSD NVMe 1TB haute performance', 6, 2, 2, 450000.00, 620000.00, 8, 4, '/uploads/1786440628762-76980-ssd_1_to_nvme.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:30:28'),
(20, 'NETWORK-001', '100000000020', 'Cable TP-Link 8 ports', ' Ethernet 8 ports', 5, 6, 5, 150000.00, 230000.00, 8, 4, '/uploads/1786440645760-416810-Cable_RJ45.png', 12, 1, '2026-08-11 11:26:31', '2026-08-11 12:42:09'),
(21, 'S_001', '11199378', 'Souris', 'Souris Gamer', 4, 4, 2, 4000.00, 2500.00, 31, 5, '/uploads/1786441926157-730606-souris-gamer.jpg', 8, 1, '2026-08-11 12:52:06', '2026-05-23 13:07:58'),
(22, 'MAN-001', '12330001', 'Manette', 'Manette Pro', 4, 2, 1, 20000.00, 23000.00, 12, 5, '/uploads/1786442050586-702033-image45.png', 4, 1, '2026-08-11 12:54:10', '2026-08-11 12:54:10'),
(23, 'CAB6-003', '10011100', 'CABLE', 'Cable proffessionelle', 4, 4, 4, 20890.00, 30000.00, 13, 5, '/uploads/1786442154605-529339-remplacement-connecteur-2560x1706-1.webp', 2, 1, '2026-08-11 12:55:54', '2026-08-11 12:55:54'),
(24, 'PROC_001', '1233455', 'Processeur', 'Processeur Dell', 3, 2, 3, 233000.00, 299000.00, 12, 5, '/uploads/1786442245622-478091-1735204259-1070-card.webp', 12, 1, '2026-08-11 12:57:25', '2026-08-11 12:57:25');

--
-- Déclencheurs `produits`
--
DROP TRIGGER IF EXISTS `trg_produit_apres_maj`;
DELIMITER $$
CREATE TRIGGER `trg_produit_apres_maj` AFTER UPDATE ON `produits` FOR EACH ROW BEGIN
  IF NEW.quantite <= NEW.seuil_alerte AND (OLD.quantite > OLD.seuil_alerte OR OLD.quantite <> NEW.quantite) THEN
    INSERT INTO alertes_stock (produit_id, message, niveau)
    VALUES (NEW.id,
      CONCAT('Stock critique : ', NEW.nom, ' (', NEW.quantite, ' restant)'),
      IF(NEW.quantite <= 0, 'rupture', 'faible'));
  END IF;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_produit_avant_insert`;
DELIMITER $$
CREATE TRIGGER `trg_produit_avant_insert` BEFORE INSERT ON `produits` FOR EACH ROW BEGIN
  IF NEW.prix_vente < NEW.prix_achat THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le prix de vente doit etre superieur ou egal au prix d achat';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('administrateur','gestionnaire','caissier','magasinier') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'caissier',
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `telephone`, `avatar`, `actif`, `created_at`, `updated_at`) VALUES
(4, 'RAJOANY', 'Rolin', 'admin@gigatech.com', '$2a$12$ax4BZRElQkB4CUB/l1fE3.0B5ouJyb5R3YkbUFF4HEUnvVZwZd46O', 'administrateur', '0381929175', '/uploads/1786443151239-487545-CV_profil.jpg', 1, '2026-08-11 11:16:22', '2026-08-11 13:19:00'),
(5, 'Rasolofoniaina', 'Laura', 'gestionnaire@gigatech.com', '$2a$12$d.YVVWwdrt4y/QkEAGt1vO3B6YyZzwqagN4cNmkmMdScFeO.KMpYq', 'gestionnaire', '0332145632', NULL, 1, '2026-08-11 13:16:57', '2026-08-11 13:23:27'),
(6, 'Ralimanana', 'Sandra', 'caissier@gigatech.com', '$2a$12$aQ2S/HdB1vrwTSiQjXuGcOQP0deQ3dkjpzegtXWUX/ER5vwXP3sa2', 'caissier', '0342516789', '/uploads/1786444206009-451884-Admin.jpg', 1, '2026-08-11 13:18:15', '2026-08-11 13:30:06'),
(7, 'Andriamamonjy', 'Kevin', 'magasinier@gigatech.com', '$2a$12$3EVr9CRAAVA3dKR80wjh4e5ccGiqo4FuBydEFCK7ApmdqZUW/8TYy', 'magasinier', '0381929133', NULL, 1, '2026-08-11 13:20:37', '2026-08-11 13:22:06');

-- --------------------------------------------------------

--
-- Structure de la table `ventes`
--

DROP TABLE IF EXISTS `ventes`;
CREATE TABLE IF NOT EXISTS `ventes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` int DEFAULT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `sous_total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `remise` decimal(5,2) NOT NULL DEFAULT '0.00',
  `montant_remise` decimal(14,2) NOT NULL DEFAULT '0.00',
  `tva` decimal(5,2) NOT NULL DEFAULT '16.00',
  `montant_tva` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `statut` enum('brouillon','validee','annulee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'validee',
  `mode_paiement` enum('especes','mobile_money','carte_bancaire','virement') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'especes',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_vente` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `fk_v_user` (`utilisateur_id`),
  KEY `idx_v_date` (`date_vente`),
  KEY `idx_v_statut` (`statut`),
  KEY `idx_ventes_client_date` (`client_id`,`date_vente`)
) ;

--
-- Déchargement des données de la table `ventes`
--

INSERT INTO `ventes` (`id`, `numero`, `client_id`, `utilisateur_id`, `sous_total`, `remise`, `montant_remise`, `tva`, `montant_tva`, `total`, `statut`, `mode_paiement`, `note`, `date_vente`) VALUES
(1, 'VNT-1786437503361', NULL, 4, 230000.00, 6.00, 13800.00, 10.00, 21620.00, 237820.00, 'validee', 'especes', NULL, '2026-08-11 11:38:23'),
(2, 'VNT-1786096939734', NULL, 4, 8100000.00, 7.00, 567000.00, 16.00, 1205280.00, 8738280.00, 'validee', 'especes', NULL, '2026-08-07 13:02:19'),
(3, 'VNT-1786442636947', NULL, 4, 5000000.00, 3.00, 150000.00, 10.00, 485000.00, 5335000.00, 'validee', 'virement', NULL, '2026-08-11 13:03:56'),
(4, 'VNT-1779530715203', NULL, 4, 520000.00, 4.00, 20800.00, 13.00, 64896.00, 564096.00, 'validee', 'mobile_money', NULL, '2026-05-23 13:05:15');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_historique_client`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_historique_client`;
CREATE TABLE IF NOT EXISTS `vue_historique_client` (
`client_id` int
,`client` varchar(201)
,`nb_achats` bigint
,`total_depense` decimal(36,2)
,`dernier_achat` datetime
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_meilleurs_produits`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_meilleurs_produits`;
CREATE TABLE IF NOT EXISTS `vue_meilleurs_produits` (
`id` int
,`nom` varchar(180)
,`quantite_vendue` decimal(32,0)
,`chiffre` decimal(36,2)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_produits_details`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_produits_details`;
CREATE TABLE IF NOT EXISTS `vue_produits_details` (
`id` int
,`reference` varchar(60)
,`code_barres` varchar(60)
,`nom` varchar(180)
,`prix_achat` decimal(12,2)
,`prix_vente` decimal(12,2)
,`quantite` int
,`seuil_alerte` int
,`categorie` varchar(100)
,`marque` varchar(100)
,`fournisseur` varchar(150)
,`marge_unitaire` decimal(13,2)
,`etat_stock` varchar(7)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_stock_alerte`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_stock_alerte`;
CREATE TABLE IF NOT EXISTS `vue_stock_alerte` (
`id` int
,`reference` varchar(60)
,`nom` varchar(180)
,`quantite` int
,`seuil_alerte` int
,`niveau` varchar(7)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_ventes_journalieres`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_ventes_journalieres`;
CREATE TABLE IF NOT EXISTS `vue_ventes_journalieres` (
`jour` date
,`nb_ventes` bigint
,`sous_total` decimal(36,2)
,`remises` decimal(36,2)
,`tva` decimal(36,2)
,`chiffre_affaires` decimal(36,2)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_historique_client`
--
DROP TABLE IF EXISTS `vue_historique_client`;

DROP VIEW IF EXISTS `vue_historique_client`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_historique_client`  AS SELECT `cl`.`id` AS `client_id`, concat(`cl`.`prenom`,' ',`cl`.`nom`) AS `client`, count(`v`.`id`) AS `nb_achats`, coalesce(sum(`v`.`total`),0) AS `total_depense`, max(`v`.`date_vente`) AS `dernier_achat` FROM (`clients` `cl` left join `ventes` `v` on(((`v`.`client_id` = `cl`.`id`) and (`v`.`statut` = 'validee')))) GROUP BY `cl`.`id`, `client` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_meilleurs_produits`
--
DROP TABLE IF EXISTS `vue_meilleurs_produits`;

DROP VIEW IF EXISTS `vue_meilleurs_produits`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_meilleurs_produits`  AS SELECT `p`.`id` AS `id`, `p`.`nom` AS `nom`, sum(`lv`.`quantite`) AS `quantite_vendue`, sum(`lv`.`total_ligne`) AS `chiffre` FROM ((`lignes_vente` `lv` join `ventes` `v` on(((`v`.`id` = `lv`.`vente_id`) and (`v`.`statut` = 'validee')))) join `produits` `p` on((`p`.`id` = `lv`.`produit_id`))) GROUP BY `p`.`id`, `p`.`nom` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_produits_details`
--
DROP TABLE IF EXISTS `vue_produits_details`;

DROP VIEW IF EXISTS `vue_produits_details`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_produits_details`  AS SELECT `p`.`id` AS `id`, `p`.`reference` AS `reference`, `p`.`code_barres` AS `code_barres`, `p`.`nom` AS `nom`, `p`.`prix_achat` AS `prix_achat`, `p`.`prix_vente` AS `prix_vente`, `p`.`quantite` AS `quantite`, `p`.`seuil_alerte` AS `seuil_alerte`, `c`.`nom` AS `categorie`, `m`.`nom` AS `marque`, `f`.`nom` AS `fournisseur`, (`p`.`prix_vente` - `p`.`prix_achat`) AS `marge_unitaire`, (case when (`p`.`quantite` <= 0) then 'rupture' when (`p`.`quantite` <= `p`.`seuil_alerte`) then 'faible' else 'normal' end) AS `etat_stock` FROM (((`produits` `p` left join `categories` `c` on((`c`.`id` = `p`.`categorie_id`))) left join `marques` `m` on((`m`.`id` = `p`.`marque_id`))) left join `fournisseurs` `f` on((`f`.`id` = `p`.`fournisseur_id`))) ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stock_alerte`
--
DROP TABLE IF EXISTS `vue_stock_alerte`;

DROP VIEW IF EXISTS `vue_stock_alerte`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stock_alerte`  AS SELECT `produits`.`id` AS `id`, `produits`.`reference` AS `reference`, `produits`.`nom` AS `nom`, `produits`.`quantite` AS `quantite`, `produits`.`seuil_alerte` AS `seuil_alerte`, (case when (`produits`.`quantite` <= 0) then 'rupture' else 'faible' end) AS `niveau` FROM `produits` WHERE (`produits`.`quantite` <= `produits`.`seuil_alerte`) ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_ventes_journalieres`
--
DROP TABLE IF EXISTS `vue_ventes_journalieres`;

DROP VIEW IF EXISTS `vue_ventes_journalieres`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_ventes_journalieres`  AS SELECT cast(`ventes`.`date_vente` as date) AS `jour`, count(0) AS `nb_ventes`, sum(`ventes`.`sous_total`) AS `sous_total`, sum(`ventes`.`montant_remise`) AS `remises`, sum(`ventes`.`montant_tva`) AS `tva`, sum(`ventes`.`total`) AS `chiffre_affaires` FROM `ventes` WHERE (`ventes`.`statut` = 'validee') GROUP BY cast(`ventes`.`date_vente` as date) ;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `achats`
--
ALTER TABLE `achats`
  ADD CONSTRAINT `fk_ach_four` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_ach_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `alertes_stock`
--
ALTER TABLE `alertes_stock`
  ADD CONSTRAINT `fk_al_prod` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `lignes_achat`
--
ALTER TABLE `lignes_achat`
  ADD CONSTRAINT `fk_la_achat` FOREIGN KEY (`achat_id`) REFERENCES `achats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_la_prod` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `lignes_vente`
--
ALTER TABLE `lignes_vente`
  ADD CONSTRAINT `fk_lv_prod` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_lv_vente` FOREIGN KEY (`vente_id`) REFERENCES `ventes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD CONSTRAINT `fk_ms_prod` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ms_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `fk_pay_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pay_vente` FOREIGN KEY (`vente_id`) REFERENCES `ventes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `produits`
--
ALTER TABLE `produits`
  ADD CONSTRAINT `fk_prod_cat` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prod_four` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prod_marq` FOREIGN KEY (`marque_id`) REFERENCES `marques` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `ventes`
--
ALTER TABLE `ventes`
  ADD CONSTRAINT `fk_v_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_v_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
