export default function(): boolean {
  let isValid = true

  const requiredEnvVars = [
    'BOT_TOKEN', 'DEV_SERVER_ID', 'DEV_ID', 'MONGO_PATH', 'BOT_ID'
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`MISSING ${envVar}`)
      isValid = false
    }
  }



  return isValid
}