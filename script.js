// ===== HNR LABS — JAILBREAK THE PIÑATA =====

// Premios dentro del icosaedro
const dulces = [
  '🎟️', '🎫', '🎸', '🤘',
  '🥭', '🍊', '🍍', '🍉',
  '🍬', '🍭', '🍫', '🥜',
  '🍯', '🥥'
];

const picos = 7; // Se conserva por compatibilidad; el icosaedro usa 20 caras.
const resistencia = 20;
const travesura = 3;

// ===== A partir de aquí no necesitas cambiar nada =====

const letra = [
  'Dale, dale, dale,',
  'no pierdas el tino,',
  'porque si lo pierdes,',
  'pierdes el camino.',
  'Ya le diste uno,',
  'ya le diste dos,',
  'ya le diste tres',
  '¡y tu tiempo se acabó!',
];

const golpesFuertes = ['¡Pum!', '¡Paf!', '¡Zas!', '¡Toing!', '¡Cuas!'];

const niveles = [
  { mecer: 0, subir: 0, rapidez: 1 },
  { mecer: 16, subir: 30, rapidez: 1.2 },
  { mecer: 26, subir: 80, rapidez: 1.5 },
  { mecer: 36, subir: 140, rapidez: 2.1 },
];

const limitar = (n, min, max) =>
  Math.min(max, Math.max(min, Math.round(Number(n) || 0)));

const golpesNecesarios = limitar(resistencia, 1, 999);
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const movimiento = sinMovimiento ? niveles[0] : niveles[limitar(travesura, 0, 3)];
const contenido = dulces.length > 0 ? dulces : ['🍬'];

const patio = document.querySelector('#patio');
const colgante = document.querySelector('#colgante');
const cuerda = document.querySelector('#cuerda');
const pinata = document.querySelector('#pinata');
const dibujo = document.querySelector('#dibujo');
const verso = document.querySelector('#verso');
const marcador = document.querySelector('#marcador');
const final = document.querySelector('#final');
const resumen = document.querySelector('#resumen');
const botonOtra = document.querySelector('#otra');
const capa = document.querySelector('#capa');
const palo = document.querySelector('#palo');
const bolsa = document.querySelector('#bolsa');
const contadorBolsa = document.querySelector('#contador-bolsa');

document.title = document.querySelector('.titulo').textContent.trim();
patio.style.setProperty('--subir', `${movimiento.subir}px`);

let golpes = 0;
let intentos = 0;
let rota = false;
let juntados = 0;
let linea = 0;
let conos = [];
let grietas = [];
let piezas = [];

// ----- Icosaedro HNR Labs (SVG) -----

const SVG = 'http://www.w3.org/2000/svg';
const RADIO = 120;
const PHI = (1 + Math.sqrt(5)) / 2;
const ESCALA = 72;

const azar = (min, max) => min + Math.random() * (max - min);

const xy = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

function crear(etiqueta, atributos, padre) {
  const elemento = document.createElementNS(SVG, etiqueta);

  for (const [nombre, valor] of Object.entries(atributos)) {
    elemento.setAttribute(nombre, valor);
  }

  padre.append(elemento);
  return elemento;
}

// Vértices de un icosaedro regular
function crearVerticesIcosaedro() {
  const vertices = [
    [0, 1, PHI],
    [0, -1, PHI],
    [0, 1, -PHI],
    [0, -1, -PHI],

    [1, PHI, 0],
    [-1, PHI, 0],
    [1, -PHI, 0],
    [-1, -PHI, 0],

    [PHI, 0, 1],
    [PHI, 0, -1],
    [-PHI, 0, 1],
    [-PHI, 0, -1],
  ];

  // Rotación para conseguir una presentación tridimensional
  const rotacionX = 0.28;
  const rotacionY = 0.42;

  return vertices.map(([x, y, z]) => {
    const y1 = y * Math.cos(rotacionX) - z * Math.sin(rotacionX);
    const z1 = y * Math.sin(rotacionX) + z * Math.cos(rotacionX);

    const x2 = x * Math.cos(rotacionY) + z1 * Math.sin(rotacionY);
    const z2 = -x * Math.sin(rotacionY) + z1 * Math.cos(rotacionY);

    return [
      x2 * ESCALA,
      y1 * ESCALA,
      z2 * ESCALA,
    ];
  });
}

// Identifica las 20 caras triangulares del icosaedro
function crearCaras(vertices) {
  const caras = [];

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const a = vertices[i];
        const b = vertices[j];
        const c = vertices[k];

        const distancia = (p, q) =>
          (p[0] - q[0]) ** 2 +
          (p[1] - q[1]) ** 2 +
          (p[2] - q[2]) ** 2;

        if (
          Math.abs(distancia(a, b) - 4) < 0.001 &&
          Math.abs(distancia(b, c) - 4) < 0.001 &&
          Math.abs(distancia(c, a) - 4) < 0.001
        ) {
          const centroZ = (a[2] + b[2] + c[2]) / 3;

          caras.push({
            vertices: [a, b, c],
            profundidad: centroZ,
            centro: [
              (a[0] + b[0] + c[0]) / 3,
              (a[1] + b[1] + c[1]) / 3,
            ],
          });
        }
      }
    }
  }

  // Dibujar primero las caras posteriores
  caras.sort((a, b) => a.profundidad - b.profundidad);

  return caras;
}

function dibujarPinata() {
  dibujo.replaceChildren();
  conos = [];

  const vertices = crearVerticesIcosaedro();
  const caras = crearCaras(vertices);

  // Las 20 caras del icosaedro
  caras.forEach((cara, i) => {
    const grupo = crear('g', {}, dibujo);

    const puntos = cara.vertices
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');

    const color = (i % 3) + 1;

    const profundidad = Math.max(
      0.4,
      Math.min(1, 0.55 + (cara.profundidad / (PHI * ESCALA)) * 0.45)
    );

    crear(
      'polygon',
      {
        points: puntos,
        class: `relleno-${color} contorno`,
        opacity: profundidad,
      },
      grupo
    );

    // Detalle geométrico interior de cada cara
    const centro = cara.centro;

    const puntosInterior = cara.vertices.map(([x, y]) => [
      x * 0.72 + centro[0] * 0.28,
      y * 0.72 + centro[1] * 0.28,
    ]);

    crear(
      'polygon',
      {
        points: puntosInterior
          .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
          .join(' '),
        fill: 'none',
        stroke: '#C7B182',
        'stroke-width': '1.5',
        opacity: '0.65',
      },
      grupo
    );

    // Registrar cada cara para que pueda salir volando al romperse
    conos.push({
      grupo,
      angulo: Math.atan2(centro[1], centro[0]),
      centro,
    });
  });

  // Grietas que aparecen progresivamente con los golpes
  const capaGrietas = crear('g', {}, dibujo);

  grietas = [];

  const total = 8;

  for (let i = 0; i < total; i++) {
    const angulo = (i / total) * 2 * Math.PI + azar(-0.3, 0.3);

    let r = azar(4, 18);
    let d = `M${xy([
      r * Math.cos(angulo),
      r * Math.sin(angulo),
    ])}`;

    while (r < RADIO + 25) {
      r += azar(14, 24);

      const punto = [
        r * Math.cos(angulo + azar(-0.35, 0.35)),
        r * Math.sin(angulo + azar(-0.35, 0.35)),
      ];

      d += ` L${xy(punto)}`;
    }

    grietas.push(
      crear('path', {
        d,
        class: 'grieta',
      }, capaGrietas)
    );
  }

  grietas.sort(() => Math.random() - 0.5);
}

// ----- Golpes -----

function cantar() {
  verso.textContent = letra[linea % letra.length];
  linea++;

  reiniciarAnimacion(verso, 'nuevo');
}

function reiniciarAnimacion(elemento, clase) {
  elemento.classList.remove(clase);
  void elemento.offsetWidth;
  elemento.classList.add(clase);
}

function batear(x, y) {
  const lado = x < innerWidth / 2 ? 'izquierda' : 'derecha';

  palo.className = `palo ${lado}`;
  palo.style.left = `${x}px`;
  palo.style.top = `${y}px`;

  reiniciarAnimacion(palo, 'activo');
}

function mostrarTexto(x, y, texto, clase = '') {
  const pum = document.createElement('p');

  pum.className = `pum ${clase}`;
  pum.textContent = texto;
  pum.style.left = `${x}px`;
  pum.style.top = `${y}px`;

  pum.addEventListener('animationend', () => pum.remove());

  document.body.append(pum);
}

function pegar(x, y) {
  if (rota) return;

  golpes++;
  intentos++;

  cantar();
  batear(x, y);

  mostrarTexto(
    x,
    y,
    golpesFuertes[Math.floor(Math.random() * golpesFuertes.length)]
  );

  reiniciarAnimacion(dibujo, 'golpe');

  const caja = pinata.getBoundingClientRect();

  const direccion =
    x < caja.left + caja.width / 2 ? -1 : 1;

  pendulo.velocidad += direccion * azar(70, 120);

  const visibles = Math.floor(
    (golpes / golpesNecesarios) * (grietas.length + 1)
  );

  grietas.forEach((grieta, i) => {
    grieta.classList.toggle('visible', i < visibles);
  });

  marcador.textContent = `Golpes: ${golpes}`;

  if (golpes >= golpesNecesarios) romper();
}

function fallar(x, y) {
  if (rota) return;

  intentos++;

  cantar();
  batear(x, y);

  mostrarTexto(x, y, '¡Aire!', 'aire');
}

// Interacción táctil y mouse
pinata.addEventListener('pointerdown', (evento) => {
  evento.stopPropagation();
  pegar(evento.clientX, evento.clientY);
});

// Teclado: Enter o espacio
pinata.addEventListener('click', (evento) => {
  if (evento.detail !== 0) return;

  const caja = pinata.getBoundingClientRect();

  pegar(
    caja.left + caja.width * azar(0.3, 0.7),
    caja.top + caja.height * 0.5
  );
});

patio.addEventListener('pointerdown', (evento) => {
  if (evento.target.closest('.final')) return;

  fallar(evento.clientX, evento.clientY);
});

// ----- ¡Se rompió el icosaedro! -----

function agregarPieza(pieza) {
  capa.append(pieza.el);

  piezas.push({
    giro: 0,
    vgiro: 0,
    gravedad: 1400,
    ...pieza,
  });
}

function romper() {
  rota = true;

  const origen = capa.getBoundingClientRect();
  const caja = dibujo.getBoundingClientRect();
  const tam = dibujo.offsetWidth;

  const centroX = caja.left + caja.width / 2 - origen.left;
  const centroY = caja.top + caja.height / 2 - origen.top;

  const escala = tam / 400;

  if (!sinMovimiento) {
    // Las 20 caras triangulares salen volando
    for (const cara of conos) {
      const svg = document.createElementNS(SVG, 'svg');

      svg.setAttribute('viewBox', '-200 -200 400 400');
      svg.setAttribute('class', 'fragmento');

      svg.style.width = svg.style.height = `${tam}px`;

      svg.style.transformOrigin =
        `${(cara.centro[0] + 200) * escala}px ` +
        `${(cara.centro[1] + 200) * escala}px`;

      svg.append(cara.grupo.cloneNode(true));

      const fuerza = azar(220, 420);

      agregarPieza({
        el: svg,
        tipo: 'fragmento',
        x: centroX - tam / 2,
        y: centroY - tam / 2,
        vx: Math.cos(cara.angulo) * fuerza,
        vy: Math.sin(cara.angulo) * fuerza - 250,
        vgiro: azar(-300, 300),
        vida: 1.6,
      });
    }

    // Confeti de papel de china
    for (let i = 0; i < 45; i++) {
      const confeti = document.createElement('span');

      confeti.className = 'confeti';

      confeti.style.background =
        `var(${[
          '--color-1',
          '--color-2',
          '--color-3',
          '--cuerpo',
        ][i % 4]})`;

      agregarPieza({
        el: confeti,
        tipo: 'confeti',
        x: centroX + azar(-30, 30),
        y: centroY + azar(-30, 30),
        vx: azar(-380, 380),
        vy: azar(-650, -150),
        vgiro: azar(-720, 720),
        gravedad: 700,
        fase: azar(0, 6),
        vida: azar(2.5, 4),
      });
    }
  }

  // Los dulces caen al piso
  for (let i = 0; i < 28; i++) {
    const dulce = document.createElement('span');

    dulce.className = 'dulce';
    dulce.textContent = contenido[i % contenido.length];

    const pieza = {
      el: dulce,
      tipo: 'dulce',
      x: centroX + azar(-20, 20),
      y: centroY + azar(-20, 20),
      vx: azar(-280, 280),
      vy: azar(-560, -120),
      vgiro: azar(-400, 400),
      suelo: capa.clientHeight - azar(18, 46),
    };

    dulce.addEventListener('pointerdown', () => juntar(pieza));

    agregarPieza(pieza);
  }

  pinata.hidden = true;
  marcador.hidden = true;
  verso.textContent = '';
  bolsa.hidden = false;

  setTimeout(() => {
    resumen.textContent =
      `Le pegaste ${golpes} ${golpes === 1 ? 'vez' : 'veces'} ` +
      `en ${intentos} ${intentos === 1 ? 'intento' : 'intentos'}. ` +
      'Toca los dulces para juntarlos.';

    final.hidden = false;

    botonOtra.focus({ preventScroll: true });
  }, 700);
}

function juntar(pieza) {
  if (pieza.juntado) return;

  pieza.juntado = true;

  const origen = capa.getBoundingClientRect();
  const destino = bolsa.getBoundingClientRect();

  const x = destino.left + destino.width / 2 - origen.left;
  const y = destino.top + destino.height / 2 - origen.top;

  pieza.el.style.transition =
    'transform 0.45s cubic-bezier(0.5, -0.4, 0.7, 1), opacity 0.45s ease';

  pieza.el.style.transform =
    `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.4)`;

  pieza.el.style.opacity = '0';

  setTimeout(() => {
    pieza.el.remove();

    piezas = piezas.filter((otra) => otra !== pieza);

    juntados++;

    contadorBolsa.textContent = juntados;

    reiniciarAnimacion(bolsa, 'lleno');
  }, 450);
}

// ----- Reiniciar juego -----

botonOtra.addEventListener('click', () => {
  piezas.forEach((pieza) => pieza.el.remove());

  piezas = [];

  golpes = 0;
  intentos = 0;
  linea = 0;
  rota = false;

  pendulo.angulo = 0;
  pendulo.velocidad = 0;

  dibujarPinata();

  pinata.hidden = false;
  marcador.hidden = false;

  marcador.textContent = 'Golpes: 0';
  verso.textContent = 'Toca el icosaedro para pegarle';

  final.hidden = true;

  pinata.focus({ preventScroll: true });
});

// ----- Movimiento del icosaedro -----

const pendulo = {
  angulo: 0,
  velocidad: 0,
};

let tiempo = 0;
let anterior = performance.now();
let largoCuerda = cuerda.offsetHeight;
let jalon = 0;
let siguienteJalon = azar(2, 4);

addEventListener('resize', () => {
  largoCuerda = cuerda.offsetHeight;
});

function moverPiezas(dt) {
  for (const p of piezas) {
    if (p.juntado || p.quieto) continue;

    p.vy += p.gravedad * dt;

    if (p.tipo === 'confeti') {
      p.vx *= 1 - 1.8 * dt;
      p.vy = Math.min(p.vy, 130);
      p.x += Math.sin(tiempo * 6 + p.fase) * 40 * dt;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.giro += p.vgiro * dt;

    if (p.tipo === 'dulce') {
      if (p.y > p.suelo) {
        p.y = p.suelo;

        p.vy = Math.abs(p.vy) < 90 ? 0 : p.vy * -0.35;

        p.vx *= 0.6;
        p.vgiro *= 0.5;

        if (p.vy === 0 && Math.abs(p.vx) < 2) {
          p.quieto = true;
        }
      }

      const pared = capa.clientWidth - 20;

      if (p.x < 20 || p.x > pared) {
        p.x = Math.min(pared, Math.max(20, p.x));
        p.vx *= -0.5;
      }

      p.el.style.transform =
        `translate(${p.x}px, ${p.y}px) ` +
        `translate(-50%, -50%) rotate(${p.giro}deg)`;
    } else {
      p.vida -= dt;

      p.el.style.opacity = Math.min(1, Math.max(0, p.vida));

      const centrar =
        p.tipo === 'confeti' ? ' translate(-50%, -50%)' : '';

      p.el.style.transform =
        `translate(${p.x}px, ${p.y}px)` +
        `${centrar} rotate(${p.giro}deg)`;
    }
  }

  piezas = piezas.filter((p) => {
    if (p.vida !== undefined && p.vida <= 0) {
      p.el.remove();
      return false;
    }

    return true;
  });
}

function animar(ahora) {
  const dt = Math.min(0.05, (ahora - anterior) / 1000);

  anterior = ahora;
  tiempo += dt * movimiento.rapidez;

  const objetivo =
    movimiento.mecer *
    (
      0.65 * Math.sin(tiempo * 1.3) +
      0.35 * Math.sin(tiempo * 2.9 + 1)
    );

  pendulo.velocidad +=
    (
      -(pendulo.angulo - objetivo) * 28 -
      pendulo.velocidad * 2.2
    ) * dt;

  pendulo.angulo += pendulo.velocidad * dt;

  if (movimiento.subir > 0) {
    siguienteJalon -= dt;

    if (siguienteJalon <= 0) {
      jalon = 1;

      siguienteJalon =
        azar(1.5, 4) / movimiento.rapidez;

      pendulo.velocidad +=
        azar(-3, 3) * movimiento.mecer;
    }

    jalon = Math.max(0, jalon - dt * 1.8);
  }

  const subida = 1 - Math.sin(jalon * Math.PI);

  const bajada =
    movimiento.subir *
    ((1 - Math.cos(tiempo * 1.6)) / 2) *
    (0.6 + 0.4 * Math.sin(tiempo * 0.5)) *
    subida;

  colgante.style.transform =
    `rotate(${pendulo.angulo}deg)`;

  cuerda.style.transform =
    `scaleY(${(largoCuerda + bajada) / largoCuerda})`;

  pinata.style.transform =
    `translateY(${bajada}px)`;

  moverPiezas(dt);

  requestAnimationFrame(animar);
}

// ----- Iniciar -----

dibujarPinata();
requestAnimationFrame(animar);
