const { verifyDatabaseConnection } = require('./lib/verify-db')

async function runTest() {
    const result = await verifyDatabaseConnection()
    console.log('Database verification result:', result)
}

runTest()
