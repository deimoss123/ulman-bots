import chalk from 'chalk';

export default function validateEnv(): boolean {
  let isValid = true;

  const requiredEnvVars: (keyof NodeJS.ProcessEnv)[] = [
    'BOT_TOKEN',
    'DEV_SERVER_ID',
    'DEV_ID',
    'MONGO_PATH',
    'API_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(chalk.red('MISSING ENV VAR: ') + envVar);
      isValid = false;
    }
  }

  return isValid;
}
