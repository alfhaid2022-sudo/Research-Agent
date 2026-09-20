import { createApp } from './app.js';
import { config, ensureDirs } from './config.js';
import { getDb } from './db.js';

ensureDirs();
getDb();

const app = createApp();
app.listen(config.port, config.host, () => {
  console.log(`[مقرر اللجنة العلمية] الخادم يعمل على http://${config.host}:${config.port}`);
  console.log(`[التخزين] ${config.dataDir}`);
});
