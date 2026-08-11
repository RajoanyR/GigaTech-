const { pool } = require('../config/db');

/**
 * Modele generique reutilisable (couche M du MVC).
 * Les noms de colonnes/tables proviennent du code, jamais de l'utilisateur :
 * toutes les valeurs sont passees en parametres prepares (anti injection SQL).
 */
class BaseModel {
  constructor(table, { fillable = [], searchable = [], sortable = ['id'] } = {}) {
    this.table = table;
    this.fillable = fillable;
    this.searchable = searchable;
    this.sortable = sortable;
  }

  pick(data) {
    const out = {};
    for (const key of this.fillable) if (data[key] !== undefined) out[key] = data[key];
    return out;
  }

  buildSearch(search) {
    if (!search || !this.searchable.length) return { clause: '', params: [] };
    const clause = ' WHERE (' + this.searchable.map((c) => `${c} LIKE ?`).join(' OR ') + ')';
    return { clause, params: this.searchable.map(() => `%${search}%`) };
  }

  async findAll({ page = 1, limit = 10, offset = 0, sortBy = 'id', order = 'DESC', search = '' } = {}) {
    const sort = this.sortable.includes(sortBy) ? sortBy : 'id';
    const { clause, params } = this.buildSearch(search);
    const [rows] = await pool.query(
      `SELECT * FROM ${this.table}${clause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ${this.table}${clause}`, params);
    return { rows, total, page, limit };
  }

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  async findOneBy(column, value) {
    const [rows] = await pool.query(`SELECT * FROM ${this.table} WHERE ${column} = ? LIMIT 1`, [value]);
    return rows[0] || null;
  }

  async create(data) {
    const payload = this.pick(data);
    const [res] = await pool.query(`INSERT INTO ${this.table} SET ?`, [payload]);
    return this.findById(res.insertId);
  }

  async update(id, data) {
    const payload = this.pick(data);
    if (!Object.keys(payload).length) return this.findById(id);
    await pool.query(`UPDATE ${this.table} SET ? WHERE id = ?`, [payload, id]);
    return this.findById(id);
  }

  async remove(id) {
    const [res] = await pool.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    return res.affectedRows > 0;
  }

  async count(where = '', params = []) {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ${this.table} ${where}`, params);
    return total;
  }
}
module.exports = BaseModel;
