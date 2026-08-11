const app = require('./app');
const { testConnection } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await testConnection();
    logger.info('Connexion MySQL etablie');
    app.listen(PORT, () => logger.info(`Serveur GigaTech demarre sur http://localhost:${PORT}`));
  } catch (err) {
    logger.error('Impossible de demarrer le serveur :', err.message);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (err) => logger.error('Rejet non gere :', err));
