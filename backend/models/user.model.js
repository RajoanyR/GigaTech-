const BaseModel = require('./base.model');
const { pool } = require('../config/db');

class UserModel extends BaseModel {
  constructor() {
    super('utilisateurs', {
      fillable: ['nom', 'prenom', 'email', 'mot_de_passe', 'role', 'telephone', 'avatar', 'actif'],
      searchable: ['nom', 'prenom', 'email', 'role'],
      sortable: ['id', 'nom', 'email', 'role', 'created_at'],
    });
  }

  /** Sans le hash du mot de passe (jamais renvoye au client). */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, nom, prenom, email, role, telephone, avatar, actif, created_at FROM utilisateurs WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /** Avec le hash : uniquement pour la verification du mot de passe. */
  async findByEmailWithPassword(email) {
    const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  async updatePassword(id, hash) {
    await pool.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hash, id]);
  }

  async findAll(opts) {
    const sort = this.sortable.includes(opts.sortBy) ? opts.sortBy : 'id';
    const { clause, params } = this.buildSearch(opts.search);
    const [rows] = await pool.query(
      `SELECT id, nom, prenom, email, role, telephone, avatar, actif, created_at FROM utilisateurs${clause} ORDER BY ${sort} ${opts.order} LIMIT ? OFFSET ?`,
      [...params, opts.limit, opts.offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM utilisateurs${clause}`, params);
    return { rows, total, page: opts.page, limit: opts.limit };
  }
}
module.exports = new UserModel();
