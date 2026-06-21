require('dotenv').config()

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // 🔥 ESSENCIAL para Railway + Supabase
  ssl: {
    rejectUnauthorized: false
  },

  // 🔥 FORÇA IPv4 (corrige ENETUNREACH IPv6)
  family: 4
})

// 🔥 log de erros globais do pool
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err)
})

// 🔥 teste de conexão ao iniciar
;(async () => {
  try {
    const res = await pool.query('SELECT NOW()')
    console.log('✅ Supabase conectado:', res.rows[0])
  } catch (err) {
    console.error('❌ Erro Supabase:', err)
  }
})()

module.exports = pool