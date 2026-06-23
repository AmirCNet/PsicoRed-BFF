require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const { MongoClient } = require('mongodb')

const app = express()
const PORT = process.env.PORT || 3000
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

// ── Configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'psicored'
let mongoClient = null
let mongoDb = null
let isMongoConnected = false

const connectMongo = async () => {
  try {
    mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    await mongoClient.connect()
    mongoDb = mongoClient.db(MONGO_DB_NAME)
    isMongoConnected = true
    console.log(`📡 Conectado a MongoDB en ${MONGO_URI}/${MONGO_DB_NAME}`)
  } catch (err) {
    console.warn(`⚠️ Advertencia: No se pudo conectar a MongoDB. Los endpoints de Mongo no funcionarán pero el BFF seguirá corriendo. Error: ${err.message}`)
    isMongoConnected = false
    mongoClient = null
    mongoDb = null
  }
}

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

// ── MongoDB Caching Simulation (Api-Mongo)
app.post('/api/mongo/sync', async (req, res) => {
  if (!isMongoConnected || !mongoDb) {
    return res.status(503).json({ error: 'El servicio de caché (MongoDB) no está disponible en este momento.' })
  }
  try {
    // 1. Fetch patients from Backend
    const url = `${BACKEND_URL}/api/pacientes`
    const headers = buildHeaders(req)
    
    const response = await axios.get(url, { headers })
    const patients = response.data

    if (!Array.isArray(patients)) {
      return res.status(500).json({ error: 'La respuesta del Backend no es un listado válido de pacientes.' })
    }

    // 2. Clear and Insert into MongoDB
    // Drop existing collection to clear old schema and indexes (e.g. unique constraints like dni_1)
    await mongoDb.collection('pacientes').drop().catch(() => {
      // If collection doesn't exist yet, ignore
    })
    
    const collection = mongoDb.collection('pacientes')
    
    let synchronizedCount = 0
    if (patients.length > 0) {
      const result = await collection.insertMany(patients)
      synchronizedCount = result.insertedCount
    }

    res.json({
      message: 'Sincronización con MongoDB completada exitosamente.',
      sourceCount: patients.length,
      synchronizedCount
    })
  } catch (err) {
    console.error('Error al sincronizar con MongoDB:', err.message)
    const status = err.response?.status || 500
    const data = err.response?.data || { error: 'Error durante la sincronización de caché.' }
    res.status(status).json(data)
  }
})

app.get('/api/mongo/pacientes', async (req, res) => {
  if (!isMongoConnected || !mongoDb) {
    return res.status(503).json({ error: 'El servicio de caché (MongoDB) no está disponible en este momento.' })
  }
  try {
    const collection = mongoDb.collection('pacientes')
    const patients = await collection.find({}).toArray()
    res.json(patients)
  } catch (err) {
    console.error('Error al consultar MongoDB:', err.message)
    res.status(500).json({ error: 'Error al consultar la base de datos de caché.' })
  }
})

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    bff: 'ok', 
    backend: BACKEND_URL, 
    mongodb: isMongoConnected ? 'connected' : 'disconnected' 
  })
})

app.listen(PORT, async () => {
  console.log(`\n --> BFF PsicoRed corriendo en http://localhost:${PORT}`)
  console.log(`   Proxy hacia Backend: ${BACKEND_URL}\n`)
  await connectMongo()
})