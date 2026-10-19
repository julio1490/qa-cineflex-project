require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

const usuarioPrueba = {
  id: 1,
  correo: 'estudiante@cineflex.com',
  contrasena: 'CineFlex123',
};

const peliculas = [
  {
    id: 1,
    titulo: 'Duna: Parte Dos',
    genero: 'Ciencia ficción',
    duracionMinutos: 166,
    precioEntrada: 18000,
  },
  {
    id: 2,
    titulo: 'Intensamente 2',
    genero: 'Animación',
    duracionMinutos: 96,
    precioEntrada: 16000,
  },
  {
    id: 3,
    titulo: 'Deadpool y Wolverine',
    genero: 'Acción',
    duracionMinutos: 127,
    precioEntrada: 18000,
  },
];

// Reservas de demostración guardadas temporalmente en memoria.
const reservas = [];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mensaje: 'La API de CineFlex está funcionando',
  });
});

app.post('/api/login', (req, res) => {
  const { correo, contrasena } = req.body;

  if (
    correo !== usuarioPrueba.correo ||
    contrasena !== usuarioPrueba.contrasena
  ) {
    return res.status(401).json({
      mensaje: 'Correo o contraseña incorrectos',
    });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      mensaje: 'Falta configurar JWT_SECRET en el archivo .env',
    });
  }

  const token = jwt.sign(
    { id: usuarioPrueba.id, correo: usuarioPrueba.correo },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    mensaje: 'Inicio de sesión correcto',
    token,
  });
});

app.get('/api/cartelera', (req, res) => {
  res.json({
    cantidad: peliculas.length,
    peliculas,
  });
});

// Comprueba el token que llega en el encabezado Authorization.
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;
  const token = encabezado && encabezado.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      mensaje: 'Debes iniciar sesión para reservar',
    });
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({
      mensaje: 'El token no es válido o ya venció',
    });
  }
}

app.post('/api/reservas', verificarToken, (req, res) => {
  const { peliculaId, horario, asientos, simularPago = 'aprobado' } = req.body;

  const pelicula = peliculas.find((item) => item.id === Number(peliculaId));

  if (!pelicula) {
    return res.status(404).json({
      mensaje: 'Película no encontrada',
    });
  }

  if (!horario || !Array.isArray(asientos) || asientos.length === 0) {
    return res.status(400).json({
      mensaje: 'Debes indicar un horario y al menos un asiento',
    });
  }

  // Stub: simula una respuesta del servicio de pagos. No cobra dinero.
  if (simularPago === 'rechazado') {
    return res.status(402).json({
      mensaje: 'Pago rechazado. La reserva no fue confirmada',
    });
  }

  if (simularPago !== 'aprobado') {
    return res.status(400).json({
      mensaje: 'simularPago debe ser "aprobado" o "rechazado"',
    });
  }

  const reserva = {
    ticket: `CF-${Date.now()}`,
    usuarioId: req.usuario.id,
    pelicula: pelicula.titulo,
    horario,
    asientos,
    total: pelicula.precioEntrada * asientos.length,
    pago: 'aprobado',
  };

  reservas.push(reserva);

  res.status(201).json({
    mensaje: 'Reserva confirmada',
    reserva,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor CineFlex iniciado en http://localhost:${PORT}`);
});
