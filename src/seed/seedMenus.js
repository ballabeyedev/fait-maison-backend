require('dotenv').config();
const { sequelize, Menu } = require('../models');

const DEFAULT_MENUS = [
  { name: "Vue d'ensemble",  code: 'DASHBOARD',    path: '/',              icon: 'dashboard', ordre: 1 },
  { name: 'Vendeurs',        code: 'VENDEURS',      path: '/vendeurs',      icon: 'store',     ordre: 2 },
  { name: 'Acheteurs',       code: 'ACHETEURS',     path: '/acheteurs',     icon: 'people',    ordre: 3 },
  { name: 'Produits',        code: 'PRODUITS',      path: '/produits',      icon: 'inventory', ordre: 4 },
  { name: 'Catégories',      code: 'CATEGORIES',    path: '/categories',    icon: 'category',  ordre: 5 },
  { name: 'Signalements',    code: 'SIGNALEMENTS',  path: '/signalements',  icon: 'report',    ordre: 6 },
  { name: 'Administrateurs', code: 'ADMINS',        path: '/admins',        icon: 'admin',     ordre: 7 },
  { name: 'Menus',           code: 'MENUS',         path: '/menus',         icon: 'menu',      ordre: 8 },
  { name: 'Configuration',   code: 'CONFIG',        path: '/config',        icon: 'settings',  ordre: 9 },
];

async function seedMenus() {
  await sequelize.authenticate();
  for (const m of DEFAULT_MENUS) {
    await Menu.findOrCreate({ where: { code: m.code }, defaults: m });
  }
  console.log('[SEED] Menus initialisés.');
  process.exit(0);
}

seedMenus().catch((e) => { console.error(e); process.exit(1); });
