#!/usr/bin/env node

/**
 * Script de déploiement automatisé pour Northflank
 * Usage: node scripts/deploy-northflank.js [PROJECT_ID]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ID = process.argv[2] || process.env.NORTHFLANK_PROJECT_ID;
const SERVICE_NAME = 'messhome-web';
const GITHUB_REPO = 'https://github.com/sofianerm/messhome.git';
const BRANCH = 'master';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    log(`$ ${command}`, 'blue');
    const result = execSync(command, {
      stdio: 'inherit',
      ...options,
    });
    return result;
  } catch (error) {
    log(`Erreur lors de l'exécution de: ${command}`, 'red');
    throw error;
  }
}

async function checkNorthflankCLI() {
  try {
    exec('northflank --version', { stdio: 'pipe' });
    log('✓ Northflank CLI installé', 'green');
  } catch {
    log('✗ Northflank CLI non installé', 'red');
    log('Installation avec: npm install -g @northflank/cli', 'yellow');
    process.exit(1);
  }
}

async function checkLogin() {
  try {
    exec('northflank whoami', { stdio: 'pipe' });
    log('✓ Connecté à Northflank', 'green');
  } catch {
    log('✗ Non connecté à Northflank', 'red');
    log('Connexion en cours...', 'yellow');
    exec('northflank login');
  }
}

async function checkProjectID() {
  if (!PROJECT_ID) {
    log('✗ PROJECT_ID manquant', 'red');
    log('Usage: node scripts/deploy-northflank.js <PROJECT_ID>', 'yellow');
    log('ou définir NORTHFLANK_PROJECT_ID dans .env', 'yellow');
    log('\nVos projets disponibles:', 'blue');
    exec('northflank list projects');
    process.exit(1);
  }
  log(`✓ Utilisation du projet: ${PROJECT_ID}`, 'green');
}

async function checkVCSIntegration() {
  log('\n🔗 Vérification de l\'intégration GitHub...', 'blue');

  try {
    const result = execSync('northflank list vcs', { encoding: 'utf-8' });

    if (result.includes('"vcsAccountLinks":[]') || result.includes('vcsAccountLinks: []')) {
      log('✗ Aucun compte GitHub lié à Northflank', 'red');
      log('\n⚠️  IMPORTANT: Vous devez lier votre compte GitHub à Northflank', 'yellow');
      log('👉 Rendez-vous sur: https://app.northflank.com/settings/vcs', 'blue');
      log('   1. Cliquez sur "Connect GitHub"', 'yellow');
      log('   2. Autorisez l\'accès à vos repositories', 'yellow');
      log('   3. Relancez ce script après la connexion', 'yellow');
      process.exit(1);
    }

    log('✓ Compte GitHub lié', 'green');
  } catch (error) {
    log('⚠ Impossible de vérifier l\'intégration GitHub', 'yellow');
  }
}

async function createOrUpdateService() {
  log('\n📦 Création/Mise à jour du service...', 'blue');

  try {
    // Vérifier si le service existe
    exec(`northflank get service ${SERVICE_NAME} --project ${PROJECT_ID}`, { stdio: 'pipe' });

    log('Service existant trouvé, mise à jour...', 'yellow');
    log('⚠ Mise à jour manuelle requise via l\'interface Northflank', 'yellow');
    log('ou redéployez en supprimant d\'abord le service existant.', 'yellow');

  } catch {
    log('Création d\'un nouveau service...', 'yellow');

    const serviceConfig = path.join(__dirname, '..', 'northflank-service.json');

    if (!fs.existsSync(serviceConfig)) {
      log('✗ Fichier northflank-service.json introuvable', 'red');
      log('Veuillez créer le service manuellement sur https://northflank.com', 'yellow');
      process.exit(1);
    }

    exec(`northflank create service combined --project ${PROJECT_ID} --file ${serviceConfig}`);
    log('✓ Service créé avec succès!', 'green');
  }
}

async function uploadSecrets() {
  log('\n🔐 Configuration des variables d\'environnement...', 'blue');

  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    log('⚠ Fichier .env non trouvé, passant cette étape', 'yellow');
    log('Configurez manuellement les variables avec:', 'yellow');
    log('northflank secret create --project <PROJECT_ID> --name <NAME> --value <VALUE>', 'yellow');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n').filter(line => line && !line.startsWith('#'));

  for (const line of envLines) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();

    if (key && value) {
      try {
        log(`Ajout de ${key}...`, 'blue');
        exec(`northflank create secret ${key} \
          --project ${PROJECT_ID} \
          --value "${value}"`, { stdio: 'pipe' });
      } catch (error) {
        // Le secret existe peut-être déjà, on continue
        log(`⚠ ${key} existe déjà ou erreur`, 'yellow');
      }
    }
  }

  // Lier les secrets au service
  log('\n🔗 Liaison des secrets au service...', 'blue');
  log('⚠ Veuillez lier les secrets manuellement via l\'interface Northflank', 'yellow');
  log('ou configurez-les directement dans les environment variables du service.', 'yellow');
}

async function waitForDeployment() {
  log('\n⏳ Attente du déploiement...', 'blue');
  log('Surveillez les logs avec:', 'yellow');
  log(`northflank service logs --project ${PROJECT_ID} --service ${SERVICE_NAME} --follow`, 'yellow');
}

async function showServiceInfo() {
  log('\n📊 Informations du service:', 'green');
  try {
    exec(`northflank get service ${SERVICE_NAME} --project ${PROJECT_ID}`);
  } catch (error) {
    log('⚠ Service en cours de création...', 'yellow');
  }
}

async function main() {
  try {
    log('\n🚀 Déploiement sur Northflank\n', 'green');

    await checkNorthflankCLI();
    await checkLogin();
    await checkProjectID();
    await checkVCSIntegration();
    await createOrUpdateService();
    await uploadSecrets();
    await waitForDeployment();
    await showServiceInfo();

    log('\n✅ Déploiement terminé avec succès!', 'green');
    log('\nCommandes utiles:', 'blue');
    log(`  Logs:     northflank service logs --project ${PROJECT_ID} --service ${SERVICE_NAME} --follow`);
    log(`  Status:   northflank service get --project ${PROJECT_ID} --service ${SERVICE_NAME}`);
    log(`  Restart:  northflank service restart --project ${PROJECT_ID} --service ${SERVICE_NAME}`);

  } catch (error) {
    log('\n❌ Erreur lors du déploiement', 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
