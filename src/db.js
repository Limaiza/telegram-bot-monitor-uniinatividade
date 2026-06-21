require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Supabase conectado'))
  .catch(err => console.error('❌ Erro Supabase', err))

module.exports = pool