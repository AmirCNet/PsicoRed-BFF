require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 3000
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

app.use(cors())
app.use(express.json())

// ── Headers para el Backend
const buildHeaders = (req) => {
  const headers = { 'Content-Type': 'application/json' }
  const auth = req.headers['authorization']
  if (auth) headers['Authorization'] = auth
  return headers
}

// ── Proxy
const proxy = async (req, res, path) => {
  try {
    const url = `${BACKEND_URL}${path}`
    const config = {
      method: req.method,
      url,
      headers: buildHeaders(req),
      params: req.query
    }
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      config.data = req.body
    }
    const response = await axios(config)
    res.status(response.status).json(response.data)
  } catch (err) {
    const status = err.response?.status || 500
    const data = err.response?.data || { error: 'Error en el servidor' }
    res.status(status).json(data)
  }
}

// ── Auth
app.post('/api/auth/login', (req, res) => proxy(req, res, '/api/auth/login'))
app.post('/api/auth/register', (req, res) => proxy(req, res, '/api/auth/register'))
app.get('/api/auth/me', (req, res) => proxy(req, res, '/api/auth/me'))

// ── Profesionales
app.get('/api/profesionales/mi-perfil', (req, res) => proxy(req, res, '/api/profesionales/mi-perfil'))
app.get('/api/profesionales', (req, res) => proxy(req, res, '/api/profesionales'))
app.get('/api/profesionales/:id', (req, res) => proxy(req, res, `/api/profesionales/${req.params.id}`))
app.post('/api/profesionales', (req, res) => proxy(req, res, '/api/profesionales'))
app.put('/api/profesionales/:id', (req, res) => proxy(req, res, `/api/profesionales/${req.params.id}`))
app.delete('/api/profesionales/:id', (req, res) => proxy(req, res, `/api/profesionales/${req.params.id}`))

// ── Usuarios
app.get('/api/usuarios/pendientes', (req, res) => proxy(req, res, '/api/usuarios/pendientes'))
app.get('/api/usuarios', (req, res) => proxy(req, res, '/api/usuarios'))
app.get('/api/usuarios/:id', (req, res) => proxy(req, res, `/api/usuarios/${req.params.id}`))
app.post('/api/usuarios', (req, res) => proxy(req, res, '/api/usuarios'))
app.put('/api/usuarios/:id', (req, res) => proxy(req, res, `/api/usuarios/${req.params.id}`))
app.patch('/api/usuarios/:id/aprobar', (req, res) => proxy(req, res, `/api/usuarios/${req.params.id}/aprobar`))
app.delete('/api/usuarios/:id', (req, res) => proxy(req, res, `/api/usuarios/${req.params.id}`))

// ── Especializaciones
app.get('/api/especializaciones', (req, res) => proxy(req, res, '/api/especializaciones'))
app.get('/api/especializaciones/:id', (req, res) => proxy(req, res, `/api/especializaciones/${req.params.id}`))
app.post('/api/especializaciones', (req, res) => proxy(req, res, '/api/especializaciones'))
app.put('/api/especializaciones/:id', (req, res) => proxy(req, res, `/api/especializaciones/${req.params.id}`))
app.delete('/api/especializaciones/:id', (req, res) => proxy(req, res, `/api/especializaciones/${req.params.id}`))

// ── Pacientes
app.get('/api/pacientes', (req, res) => proxy(req, res, '/api/pacientes'))
app.get('/api/pacientes/:id', (req, res) => proxy(req, res, `/api/pacientes/${req.params.id}`))
app.post('/api/pacientes', (req, res) => proxy(req, res, '/api/pacientes'))
app.put('/api/pacientes/:id', (req, res) => proxy(req, res, `/api/pacientes/${req.params.id}`))
app.delete('/api/pacientes/:id', (req, res) => proxy(req, res, `/api/pacientes/${req.params.id}`))

// ── Derivaciones
app.get('/api/derivaciones', (req, res) => proxy(req, res, '/api/derivaciones'))
app.get('/api/derivaciones/:id', (req, res) => proxy(req, res, `/api/derivaciones/${req.params.id}`))
app.post('/api/derivaciones', (req, res) => proxy(req, res, '/api/derivaciones'))
app.put('/api/derivaciones/:id', (req, res) => proxy(req, res, `/api/derivaciones/${req.params.id}`))
app.delete('/api/derivaciones/:id', (req, res) => proxy(req, res, `/api/derivaciones/${req.params.id}`))

// ── Turnos
app.get('/api/turnos', (req, res) => proxy(req, res, '/api/turnos'))
app.get('/api/turnos/:id', (req, res) => proxy(req, res, `/api/turnos/${req.params.id}`))
app.post('/api/turnos', (req, res) => proxy(req, res, '/api/turnos'))
app.put('/api/turnos/:id', (req, res) => proxy(req, res, `/api/turnos/${req.params.id}`))
app.delete('/api/turnos/:id', (req, res) => proxy(req, res, `/api/turnos/${req.params.id}`))

// ── Recursos
app.get('/api/recursos', (req, res) => proxy(req, res, '/api/recursos'))
app.get('/api/recursos/:id', (req, res) => proxy(req, res, `/api/recursos/${req.params.id}`))
app.post('/api/recursos', (req, res) => proxy(req, res, '/api/recursos'))
app.put('/api/recursos/:id', (req, res) => proxy(req, res, `/api/recursos/${req.params.id}`))
app.delete('/api/recursos/:id', (req, res) => proxy(req, res, `/api/recursos/${req.params.id}`))

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({ bff: 'ok', backend: BACKEND_URL })
})

app.listen(PORT, () => {
  console.log(`\n --> BFF PsicoRed corriendo en http://localhost:${PORT}`)
  console.log(`   Proxy hacia Backend: ${BACKEND_URL}\n`)
})