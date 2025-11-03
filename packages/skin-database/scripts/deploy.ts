/**
 * Simple Blue/Green Deployment Script
 * This script handles deploying to the inactive instance and switching traffic
 *
 * Usage: npx tsx scripts/deploy.ts
 */

import { execSync } from "child_process";
import { readFileSync, copyFileSync } from "fs";
import * as readline from "readline";

// ANSI color codes
const colors = {
  red: "\x1b[0;31m",
  green: "\x1b[0;32m",
  blue: "\x1b[0;34m",
  cyan: "\x1b[0;36m",
  yellow: "\x1b[1;33m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
} as const;

// Configuration
const APACHE_CONFIG = "/etc/apache2/sites-enabled/api.webamp.org-le-ssl.conf";
const BLUE_PORT = 3001;
const GREEN_PORT = 3002;

type Color = "blue" | "green";

interface DeploymentState {
  currentColor: Color;
  currentPort: number;
  newColor: Color;
  newPort: number;
}

function log(message: string, color?: keyof typeof colors): void {
  if (color) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  } else {
    console.log(message);
  }
}

function logBlank(): void {
  console.log();
}

function exec(command: string, description: string): void {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    log(`✗ Failed to ${description}`, "red");
    throw error;
  }
}

function execSilent(command: string): string {
  return execSync(command, { encoding: "utf8" });
}

function detectCurrentDeployment(): DeploymentState {
  log("→ Detecting current active deployment...", "cyan");

  const apacheConfig = readFileSync(APACHE_CONFIG, "utf8");
  const isBlueActive = apacheConfig.includes(`localhost:${BLUE_PORT}`);

  if (isBlueActive) {
    log(
      `  Current active: ${colors.blue}blue${colors.reset} (port ${BLUE_PORT})`
    );
    log(
      `  Deploying to: ${colors.green}green${colors.reset} (port ${GREEN_PORT})`
    );
    logBlank();
    return {
      currentColor: "blue",
      currentPort: BLUE_PORT,
      newColor: "green",
      newPort: GREEN_PORT,
    };
  } else {
    log(
      `  Current active: ${colors.green}green${colors.reset} (port ${GREEN_PORT})`
    );
    log(
      `  Deploying to: ${colors.blue}blue${colors.reset} (port ${BLUE_PORT})`
    );
    logBlank();
    return {
      currentColor: "green",
      currentPort: GREEN_PORT,
      newColor: "blue",
      newPort: BLUE_PORT,
    };
  }
}

async function promptForConfirmation(
  newPort: number,
  newColor: Color
): Promise<boolean> {
  const colorCode = newColor === "blue" ? colors.blue : colors.green;
  log("========================================", "cyan");
  log("  MANUAL VALIDATION REQUIRED", "yellow");
  log("========================================", "cyan");
  logBlank();
  log(`  Test the new ${colorCode}${newColor}${colors.reset} deployment at:`);
  log(`  ${colors.bold}https://${newColor}.api.webamp.org${colors.reset}`);
  logBlank();
  log(`  You can test it with:`);
  log(
    `  ${colors.cyan}curl -I https://${newColor}.api.webamp.org${colors.reset}`
  );
  logBlank();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("  Does everything look good? (yes/no): ", (answer) => {
      rl.close();
      logBlank();
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

function switchApacheConfig(state: DeploymentState): void {
  const colorCode = state.newColor === "blue" ? colors.blue : colors.green;
  log(
    `→ Switching production to ${colorCode}${state.newColor}${colors.reset}...`,
    "cyan"
  );
  log("  Updating Apache configuration...", "cyan");

  // Backup current config
  const backupPath = `${APACHE_CONFIG}.backup`;
  copyFileSync(APACHE_CONFIG, backupPath);

  // Update the port in Apache config
  exec(
    `sudo sed -i 's/localhost:${state.currentPort}/localhost:${state.newPort}/g' "${APACHE_CONFIG}"`,
    "update Apache configuration"
  );

  // Reload Apache
  exec("sudo systemctl reload apache2", "reload Apache");

  log("✓ Apache configuration updated and reloaded", "cyan");
  logBlank();

  // Verify the change
  const updatedConfig = readFileSync(APACHE_CONFIG, "utf8");
  if (!updatedConfig.includes(`localhost:${state.newPort}`)) {
    throw new Error("Configuration update verification failed");
  }
}

function restoreBackup(): void {
  log("  Restoring backup...", "yellow");
  const backupPath = `${APACHE_CONFIG}.backup`;
  exec(`sudo cp "${backupPath}" "${APACHE_CONFIG}"`, "restore backup");
  exec("sudo systemctl reload apache2", "reload Apache");
  log("✓ Backup restored", "yellow");
}

async function main(): Promise<void> {
  try {
    log("========================================", "cyan");
    log("  Blue/Green Deployment Script", "cyan");
    log("========================================", "cyan");
    logBlank();

    // Step 1: Detect current deployment
    const state = detectCurrentDeployment();

    // Step 2: Pull from GitHub
    log("→ Pulling latest code from GitHub...", "cyan");
    exec("git pull --rebase origin master", "pull from GitHub");
    log("✓ Code updated", "cyan");
    logBlank();

    // Step 3: Install dependencies
    log("→ Installing dependencies...", "cyan");
    exec("yarn install --frozen-lockfile", "install dependencies");
    log("✓ Dependencies installed", "cyan");
    logBlank();

    // Step 4: Build the site
    log("→ Building the site...", "cyan");
    exec("yarn build", "build the site");
    log("✓ Build complete", "cyan");
    logBlank();

    // Step 5: Deploy to inactive instance
    const newColorCode = state.newColor === "blue" ? colors.blue : colors.green;
    log(
      `→ Restarting ${newColorCode}${state.newColor}${colors.reset} instance...`,
      "cyan"
    );
    exec(
      `pm2 restart skin-database-${state.newColor}`,
      `restart ${state.newColor} instance`
    );
    log(
      `✓ ${newColorCode}${state.newColor}${colors.reset} instance restarted`,
      "cyan"
    );
    logBlank();

    // Wait for the service to start
    log("→ Waiting for service to be ready...", "cyan");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check if the service is running
    const pm2List = execSilent("pm2 list");
    const isRunning =
      pm2List.includes(`skin-database-${state.newColor}`) &&
      pm2List.includes("online");

    if (isRunning) {
      log(
        `✓ ${newColorCode}${state.newColor}${colors.reset} instance is running`,
        "cyan"
      );
    } else {
      log(
        `✗ ${newColorCode}${state.newColor}${colors.reset} instance failed to start!`,
        "red"
      );
      log(`  Check PM2 logs: pm2 logs skin-database-${state.newColor}`, "red");
      process.exit(1);
    }
    logBlank();

    // Step 6: Manual validation prompt
    const confirmed = await promptForConfirmation(
      state.newPort,
      state.newColor
    );

    if (!confirmed) {
      log("✗ Deployment cancelled!", "red");
      log(
        `  The ${newColorCode}${state.newColor}${colors.reset} instance is running but not active in production.`
      );
      log(
        `  You can rollback by restarting: pm2 restart skin-database-${state.newColor}`
      );
      process.exit(1);
    }

    // Step 7: Switch Apache configuration
    switchApacheConfig(state);

    // Success message
    const currentColorCode =
      state.currentColor === "blue" ? colors.blue : colors.green;
    log("========================================", "cyan");
    log("  DEPLOYMENT SUCCESSFUL!", "cyan");
    log("========================================", "cyan");
    logBlank();
    log(
      `  Active deployment: ${newColorCode}${state.newColor}${colors.reset} (port ${state.newPort})`
    );
    log(
      `  Previous deployment: ${currentColorCode}${state.currentColor}${colors.reset} (port ${state.currentPort}) - still running as backup`
    );
    logBlank();
    log("Note: If you need to rollback:", "yellow");
    log(`  1. Edit: ${APACHE_CONFIG}`);
    log(`  2. Change port back to ${state.currentPort}`);
    log(`  3. Run: sudo systemctl reload apache2`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Configuration update verification failed"
    ) {
      log("✗ Configuration update failed!", "red");
      restoreBackup();
    }
    process.exit(1);
  }
}

// Run the deployment
main();
