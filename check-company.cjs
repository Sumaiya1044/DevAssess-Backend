require("dotenv").config();
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT id, name FROM "Company" ORDER BY id');
    console.table(result.rows);
  } catch (error) {
    console.error(error.message);
  } finally {
    await client.end();
  }
})();
