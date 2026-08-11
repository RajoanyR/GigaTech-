/**
 * Jeu de donnees de demonstration : utilisateurs, categories, marques,
 * fournisseurs, clients, produits.  Usage : npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const logger = require('./logger');

const users = [
  ['Admin', 'GigaTech', 'admin@gigatech.com', 'Admin@123', 'administrateur'],
  ['Kabila', 'Jean', 'gestionnaire@gigatech.com', 'Gest@123', 'gestionnaire'],
  ['Mwamba', 'Sarah', 'caissier@gigatech.com', 'Caisse@123', 'caissier'],
  ['Ilunga', 'Paul', 'magasinier@gigatech.com', 'Magasin@123', 'magasinier'],
];

const categories = ['PC Portables', 'PC Bureau', 'Ecrans', 'Claviers', 'Souris', 'SSD', 'HDD', 'RAM',
  'Imprimantes', 'Cartes graphiques', 'Routeurs', 'Switchs', 'Onduleurs', 'Accessoires'];

const marques = [['HP','USA'],['Dell','USA'],['Lenovo','Chine'],['Asus','Taiwan'],['Acer','Taiwan'],
  ['Logitech','Suisse'],['Canon','Japon'],['Epson','Japon'],['Samsung','Coree du Sud'],
  ['Kingston','USA'],['Crucial','USA'],['Intel','USA'],['AMD','USA']];

const fournisseurs = [
  ['TechImport SARL','+243810000001','contact@techimport.cd','Av. Kasa-Vubu 12','TechImport','Kinshasa','RDC'],
  ['Global Computers','+243810000002','sales@globalcomp.com','Bd du 30 Juin 55','Global Computers','Kinshasa','RDC'],
  ['Asia Hardware Ltd','+8613800000003','info@asiahw.cn','Shenzhen Road 88','Asia Hardware','Shenzhen','Chine'],
];

const clients = [
  ['Mukendi','Alain','+243820000001','alain@mail.com','Q. Ngaliema','particulier','Kinshasa'],
  ['Banque Horizon','Service Achats','+243820000002','achats@horizon.cd','Gombe','entreprise','Kinshasa'],
  ['Tshibangu','Nadine','+243820000003','nadine@mail.com','Limete','revendeur','Kinshasa'],
];

const produits = [
  ['GT-PC-001','1000000000001','HP ProBook 450 G9','Core i5 12e gen, 16Go RAM, 512Go SSD',1,1,1,750,999,12,3,24],
  ['GT-PC-002','1000000000002','Dell Latitude 5430','Core i7, 16Go RAM, 512Go SSD',1,2,2,900,1250,8,3,24],
  ['GT-EC-001','1000000000003','Ecran Samsung 24" FHD','Dalle IPS 75Hz',3,9,1,110,169,15,5,12],
  ['GT-SSD-001','1000000000004','SSD Kingston NV2 1To','NVMe PCIe 4.0',6,10,3,55,89,2,5,36],
  ['GT-RAM-001','1000000000005','RAM Crucial 8Go DDR4','3200MHz SODIMM',8,11,3,22,39,0,5,60],
  ['GT-IMP-001','1000000000006','Imprimante Canon G3411','Multifonction jet d encre',9,7,2,150,215,6,2,12],
  ['GT-ACC-001','1000000000007','Clavier Logitech K380','Bluetooth multi-appareils',4,6,1,25,44,20,5,12],
  ['GT-RES-001','1000000000008','Routeur TP-Link Archer C6','WiFi AC1200',11,4,3,30,52,4,4,12],
];

(async () => {
  try {
    for (const [nom, prenom, email, pwd, role] of users) {
      const hash = await bcrypt.hash(pwd, 12);
      await pool.query(
        `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, actif)
         VALUES (?,?,?,?,?,1) ON DUPLICATE KEY UPDATE mot_de_passe = VALUES(mot_de_passe)`,
        [nom, prenom, email, hash, role]
      );
    }
    for (const nom of categories)
      await pool.query('INSERT IGNORE INTO categories (nom) VALUES (?)', [nom]);
    for (const [nom, pays] of marques)
      await pool.query('INSERT IGNORE INTO marques (nom, pays) VALUES (?,?)', [nom, pays]);
    for (const f of fournisseurs)
      await pool.query('INSERT IGNORE INTO fournisseurs (nom, telephone, email, adresse, societe, ville, pays) VALUES (?,?,?,?,?,?,?)', f);
    for (const c of clients)
      await pool.query('INSERT IGNORE INTO clients (nom, prenom, telephone, email, adresse, type_client, ville) VALUES (?,?,?,?,?,?,?)', c);
    for (const p of produits)
      await pool.query(
        `INSERT IGNORE INTO produits (reference, code_barres, nom, description, categorie_id, marque_id,
          fournisseur_id, prix_achat, prix_vente, quantite, seuil_alerte, garantie_mois)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, p);

    logger.info('Donnees de demonstration inserees.');
    logger.info('Connexion : admin@gigatech.com / Admin@123');
    process.exit(0);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
