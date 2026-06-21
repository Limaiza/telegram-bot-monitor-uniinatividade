require('dotenv').config()

const { Pool } = require('pg')

// 🔥 força uso de IPv4 via DNS + evita IPv6 do Supabase
const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err)
})

// teste leve (sem travar startup)
pool.query('SELECT NOW()')
  .then((res) => {
    console.log('✅ Supabase conectado:', res.rows[0])
  })
  .catch((err) => {
    console.error('❌ Erro Supabase:', err)
  })

module.exports = pool