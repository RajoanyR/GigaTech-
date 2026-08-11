const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/response');
const UserModel = require('../models/user.model');

const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const publicUser = (u) => ({
  id: u.id, nom: u.nom, prenom: u.prenom, email: u.email,
  role: u.role, telephone: u.telephone, avatar: u.avatar,
});

/** POST /api/auth/login */
exports.login = asyncHandler(async (req, res) => {
  const { email, mot_de_passe } = req.body;
  const user = await UserModel.findByEmailWithPassword(email.toLowerCase());
  // Message volontairement generique : ne revele pas si l'email existe.
  if (!user) throw ApiError.unauthorized('Identifiants incorrects');
  const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
  if (!match) throw ApiError.unauthorized('Identifiants incorrects');
  if (!user.actif) throw ApiError.forbidden('Compte desactive, contactez un administrateur');
  ok(res, { token: sign(user), user: publicUser(user) }, 'Connexion reussie');
});

/** POST /api/auth/register — reserve a l'administrateur */
exports.register = asyncHandler(async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, telephone } = req.body;
  if (await UserModel.findByEmailWithPassword(email.toLowerCase())) {
    throw ApiError.conflict('Cet email est deja utilise');
  }
  const hash = await bcrypt.hash(mot_de_passe, 12);
  const user = await UserModel.create({
    nom, prenom, email: email.toLowerCase(), mot_de_passe: hash, role, telephone, actif: 1,
  });
  created(res, publicUser(user), 'Utilisateur cree avec succes');
});

/** GET /api/auth/me */
exports.me = asyncHandler(async (req, res) => ok(res, publicUser(req.user)));

/** PUT /api/auth/profile */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { nom, prenom, telephone } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;
  const user = await UserModel.update(req.user.id, { nom, prenom, telephone, avatar });
  ok(res, publicUser(user), 'Profil mis a jour');
});

/** PUT /api/auth/password */
exports.changePassword = asyncHandler(async (req, res) => {
  const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
  const user = await UserModel.findByEmailWithPassword(req.user.email);
  const match = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe);
  if (!match) throw ApiError.badRequest('Ancien mot de passe incorrect');
  await UserModel.updatePassword(user.id, await bcrypt.hash(nouveau_mot_de_passe, 12));
  ok(res, null, 'Mot de passe modifie avec succes');
});

/** POST /api/auth/forgot-password — genere un token de reinitialisation court */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await UserModel.findByEmailWithPassword(req.body.email.toLowerCase());
  // Reponse identique dans tous les cas (anti enumeration de comptes).
  const message = "Si le compte existe, un lien de reinitialisation a ete envoye";
  if (!user) return ok(res, null, message);
  const token = jwt.sign({ id: user.id, purpose: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  // En production : envoyer par email (Nodemailer). En dev on renvoie le lien.
  ok(res, process.env.NODE_ENV === 'development' ? { resetUrl } : null, message);
});

/** POST /api/auth/reset-password */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, nouveau_mot_de_passe } = req.body;
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.purpose !== 'reset') throw ApiError.badRequest('Token invalide');
  await UserModel.updatePassword(payload.id, await bcrypt.hash(nouveau_mot_de_passe, 12));
  ok(res, null, 'Mot de passe reinitialise, vous pouvez vous connecter');
});

/** POST /api/auth/logout — le JWT est stateless : le client supprime son token */
exports.logout = asyncHandler(async (_req, res) => ok(res, null, 'Deconnexion reussie'));
