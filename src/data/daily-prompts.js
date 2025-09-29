// 365 prompts del CSV, uno para cada día del año
const DAILY_PROMPTS = [
  {
    "id": 1,
    "day": 1,
    "tematica": "Números2026",
    "prompt_es": "Dibujo de los números 2026 decorados con globos, confeti y elementos festivos para colorear solo contornos, celebrando el primer día del año",
    "prompt_en": "Outline drawing of the numbers 2026 decorated with balloons, confetti and festive elements to color, celebrating the first day of the year",
    "difficulty": "Medio"
  },
  {
    "id": 2,
    "day": 2,
    "tematica": "PaisajeNevado",
    "prompt_es": "Dibujo de un paisaje nevado con colinas y árboles para colorear solo contornos",
    "prompt_en": "Outline drawing of a snowy landscape with hills and trees to color",
    "difficulty": "Fácil"
  },
  {
    "id": 3,
    "day": 3,
    "tematica": "CoposNieve",
    "prompt_es": "Dibujo de copos de nieve de distintos tamaños para colorear solo contornos",
    "prompt_en": "Outline drawing of snowflakes of different sizes to color",
    "difficulty": "Fácil"
  },
  {
    "id": 4,
    "day": 4,
    "tematica": "MuñecoNieve",
    "prompt_es": "Dibujo de un muñeco de nieve con bufanda y gorro para colorear solo contornos",
    "prompt_en": "Outline drawing of a snowman with scarf and hat to color",
    "difficulty": "Medio"
  },
  {
    "id": 5,
    "day": 5,
    "tematica": "MandalaNaturaleza",
    "prompt_es": "Dibujo de mandala con flores, hojas y ramas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with flowers, leaves and branches to color",
    "difficulty": "Fácil"
  },
  {
    "id": 6,
    "day": 6,
    "tematica": "ReyesMagos",
    "prompt_es": "Dibujo de los Reyes Magos con camellos y regalos caminando por el desierto para colorear solo contornos (5 de enero)",
    "prompt_en": "Outline drawing of the Three Wise Men with camels and gifts walking through the desert to color (January 5th)",
    "difficulty": "Difícil"
  },
  {
    "id": 7,
    "day": 7,
    "tematica": "CasaInvierno",
    "prompt_es": "Dibujo de una casa con humo saliendo de la chimenea y árboles para colorear solo contornos",
    "prompt_en": "Outline drawing of a house with smoke coming from the chimney and trees to color",
    "difficulty": "Medio"
  },
  {
    "id": 8,
    "day": 8,
    "tematica": "AmigosTé",
    "prompt_es": "Dibujo de amigos tomando té y galletas en una sala acogedora para colorear solo contornos",
    "prompt_en": "Outline drawing of friends having tea and cookies in a cozy living room to color",
    "difficulty": "Fácil"
  },
  {
    "id": 9,
    "day": 9,
    "tematica": "PatioNevado",
    "prompt_es": "Dibujo de un patio con nieve y niños jugando para colorear solo contornos",
    "prompt_en": "Outline drawing of a snowy yard with children playing to color",
    "difficulty": "Medio"
  },
  {
    "id": 10,
    "day": 10,
    "tematica": "MandalaAnimales",
    "prompt_es": "Dibujo de mandala con animales del bosque y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with forest animals and leaves to color",
    "difficulty": "Difícil"
  },
  {
    "id": 11,
    "day": 11,
    "tematica": "Biblioteca",
    "prompt_es": "Dibujo de una biblioteca con estanterías y libros abiertos para colorear solo contornos",
    "prompt_en": "Outline drawing of a library with bookshelves and open books to color",
    "difficulty": "Medio"
  },
  {
    "id": 12,
    "day": 12,
    "tematica": "LagoInvierno",
    "prompt_es": "Dibujo de un lago parcialmente congelado con patinadores para colorear solo contornos",
    "prompt_en": "Outline drawing of a partially frozen lake with skaters to color",
    "difficulty": "Medio"
  },
  {
    "id": 13,
    "day": 13,
    "tematica": "Cocina",
    "prompt_es": "Dibujo de una cocina rústica con utensilios y comida sobre la mesa para colorear solo contornos",
    "prompt_en": "Outline drawing of a rustic kitchen with utensils and food on the table to color",
    "difficulty": "Medio"
  },
  {
    "id": 14,
    "day": 14,
    "tematica": "CaféAmigos",
    "prompt_es": "Dibujo de amigos charlando y tomando café en un café acogedor para colorear solo contornos",
    "prompt_en": "Outline drawing of friends chatting and having coffee in a cozy cafe to color",
    "difficulty": "Fácil"
  },
  {
    "id": 15,
    "day": 15,
    "tematica": "Esquí",
    "prompt_es": "Dibujo de un esquiador descendiendo por la montaña con árboles alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a skier going down the mountain with trees around to color",
    "difficulty": "Difícil"
  },
  {
    "id": 16,
    "day": 16,
    "tematica": "MandalaFloral",
    "prompt_es": "Dibujo de mandala con flores y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with flowers and leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 17,
    "day": 17,
    "tematica": "SalaEstar",
    "prompt_es": "Dibujo de una sala de estar con sofá, lámpara y alfombra para colorear solo contornos",
    "prompt_en": "Outline drawing of a living room with sofa, lamp and rug to color",
    "difficulty": "Fácil"
  },
  {
    "id": 18,
    "day": 18,
    "tematica": "AnimalesBosque",
    "prompt_es": "Dibujo de zorros y conejos en un bosque para colorear solo contornos",
    "prompt_en": "Outline drawing of foxes and rabbits in a forest to color",
    "difficulty": "Medio"
  },
  {
    "id": 19,
    "day": 19,
    "tematica": "TéCaliente",
    "prompt_es": "Dibujo de una taza de té caliente con crema y malvaviscos para colorear solo contornos",
    "prompt_en": "Outline drawing of a cup of hot tea with cream and marshmallows to color",
    "difficulty": "Fácil"
  },
  {
    "id": 20,
    "day": 20,
    "tematica": "Patinaje",
    "prompt_es": "Dibujo de niños patinando sobre un lago congelado para colorear solo contornos",
    "prompt_en": "Outline drawing of children ice skating on a frozen lake to color",
    "difficulty": "Medio"
  },
  {
    "id": 21,
    "day": 21,
    "tematica": "MandalaInvierno",
    "prompt_es": "Dibujo de mandala con copos de nieve y formas geométricas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with snowflakes and geometric shapes to color",
    "difficulty": "Fácil"
  },
  {
    "id": 22,
    "day": 22,
    "tematica": "Chimenea",
    "prompt_es": "Dibujo de chimenea encendida con calcetines colgados para colorear solo contornos",
    "prompt_en": "Outline drawing of a fireplace with stockings hanging to color",
    "difficulty": "Medio"
  },
  {
    "id": 23,
    "day": 23,
    "tematica": "Ciervo",
    "prompt_es": "Dibujo de un ciervo en un claro del bosque para colorear solo contornos",
    "prompt_en": "Outline drawing of a deer in a forest clearing to color",
    "difficulty": "Medio"
  },
  {
    "id": 24,
    "day": 24,
    "tematica": "JardínInvierno",
    "prompt_es": "Dibujo de un jardín con arbustos y senderos cubiertos de nieve para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with bushes and paths covered in snow to color",
    "difficulty": "Medio"
  },
  {
    "id": 25,
    "day": 25,
    "tematica": "AmigosJuego",
    "prompt_es": "Dibujo de niños jugando a juegos de mesa en casa para colorear solo contornos",
    "prompt_en": "Outline drawing of children playing board games at home to color",
    "difficulty": "Fácil"
  },
  {
    "id": 26,
    "day": 26,
    "tematica": "ChocolateCaliente",
    "prompt_es": "Dibujo de taza de chocolate con crema y galletas para colorear solo contornos",
    "prompt_en": "Outline drawing of a cup of hot chocolate with cream and cookies to color",
    "difficulty": "Fácil"
  },
  {
    "id": 27,
    "day": 27,
    "tematica": "MandalaNaturaleza2",
    "prompt_es": "Dibujo de mandala con árboles, hojas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with trees, leaves and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 28,
    "day": 28,
    "tematica": "CalendarioEnero",
    "prompt_es": "Dibujo de calendario de enero con días señalados para colorear solo contornos",
    "prompt_en": "Outline drawing of a January calendar with highlighted days to color",
    "difficulty": "Medio"
  },
  {
    "id": 29,
    "day": 29,
    "tematica": "NieveJugando",
    "prompt_es": "Dibujo de niños haciendo ángeles y bolas de nieve para colorear solo contornos",
    "prompt_en": "Outline drawing of children making snow angels and snowballs to color",
    "difficulty": "Fácil"
  },
  {
    "id": 30,
    "day": 30,
    "tematica": "FuegosInvierno",
    "prompt_es": "Dibujo de fuegos artificiales sobre un paisaje nevado para colorear solo contornos",
    "prompt_en": "Outline drawing of fireworks over a snowy landscape to color",
    "difficulty": ""
  },
  {
    "id": 31,
    "day": 31,
    "tematica": "DesayunoCozy",
    "prompt_es": "Dibujo de una mesa de desayuno acogedora con pan, té y frutas para colorear solo contornos",
    "prompt_en": "Outline drawing of a cozy breakfast table with bread, tea, and fruits to color",
    "difficulty": "Fácil"
  },
  {
    "id": 32,
    "day": 32,
    "tematica": "Perrito",
    "prompt_es": "Dibujo de un perrito dormido en una manta suave para colorear solo contornos",
    "prompt_en": "Outline drawing of a puppy sleeping on a soft blanket to color",
    "difficulty": "Fácil"
  },
  {
    "id": 33,
    "day": 33,
    "tematica": "Gatito",
    "prompt_es": "Dibujo de un gatito jugando con ovillos de lana para colorear solo contornos",
    "prompt_en": "Outline drawing of a kitten playing with balls of yarn to color",
    "difficulty": "Fácil"
  },
  {
    "id": 34,
    "day": 34,
    "tematica": "Lectura",
    "prompt_es": "Dibujo de una persona leyendo en un sillón con manta y taza de té para colorear solo contornos",
    "prompt_en": "Outline drawing of a person reading in an armchair with a blanket and cup of tea to color",
    "difficulty": "Medio"
  },
  {
    "id": 35,
    "day": 35,
    "tematica": "PicnicInvierno",
    "prompt_es": "Dibujo de un picnic acogedor en un jardín con mantas y comida para colorear solo contornos",
    "prompt_en": "Outline drawing of a cozy picnic in a garden with blankets and food to color",
    "difficulty": "Medio"
  },
  {
    "id": 36,
    "day": 36,
    "tematica": "MandalaFlores",
    "prompt_es": "Dibujo de mandala con flores suaves y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with gentle flowers and leaves to color",
    "difficulty": "Fácil"
  },
  {
    "id": 37,
    "day": 37,
    "tematica": "PerritosAmigos",
    "prompt_es": "Dibujo de dos perritos jugando juntos en el jardín para colorear solo contornos",
    "prompt_en": "Outline drawing of two puppies playing together in the garden to color",
    "difficulty": "Fácil"
  },
  {
    "id": 38,
    "day": 38,
    "tematica": "CasaAcogedora",
    "prompt_es": "Dibujo de una casa acogedora con chimenea y luces suaves para colorear solo contornos",
    "prompt_en": "Outline drawing of a cozy house with fireplace and soft lights to color",
    "difficulty": "Medio"
  },
  {
    "id": 39,
    "day": 39,
    "tematica": "TéTarde",
    "prompt_es": "Dibujo de taza de té caliente con galletas y libro sobre la mesa para colorear solo contornos",
    "prompt_en": "Outline drawing of a cup of hot tea with cookies and a book on the table to color",
    "difficulty": "Fácil"
  },
  {
    "id": 40,
    "day": 40,
    "tematica": "CorazónValentín",
    "prompt_es": "Dibujo de corazón decorativo con flores y globos, para celebrar el día de San Valentín para colorear solo contornos (14 de febrero)",
    "prompt_en": "Outline drawing of a decorative heart with flowers and balloons, celebrating Valentine’s Day to color (February 14th)",
    "difficulty": "Medio"
  },
  {
    "id": 41,
    "day": 41,
    "tematica": "PerritoDormilón",
    "prompt_es": "Dibujo de un perrito acurrucado en una cama mullida para colorear solo contornos",
    "prompt_en": "Outline drawing of a puppy curled up on a fluffy bed to color",
    "difficulty": "Fácil"
  },
  {
    "id": 42,
    "day": 42,
    "tematica": "GatoTaza",
    "prompt_es": "Dibujo de un gatito dentro de una taza de té grande para colorear solo contornos",
    "prompt_en": "Outline drawing of a kitten inside a big tea cup to color",
    "difficulty": "Fácil"
  },
  {
    "id": 43,
    "day": 43,
    "tematica": "Hojas",
    "prompt_es": "Dibujo de hojas suaves cayendo alrededor de un banco con manta para colorear solo contornos",
    "prompt_en": "Outline drawing of gentle leaves falling around a bench with a blanket to color",
    "difficulty": "Medio"
  },
  {
    "id": 44,
    "day": 44,
    "tematica": "Estudio",
    "prompt_es": "Dibujo de un escritorio ordenado con libros, lámpara y tazas para colorear solo contornos",
    "prompt_en": "Outline drawing of a tidy desk with books, lamp and cups to color",
    "difficulty": "Medio"
  },
  {
    "id": 45,
    "day": 45,
    "tematica": "LecturaNiño",
    "prompt_es": "Dibujo de un niño leyendo junto a la ventana con mantita para colorear solo contornos",
    "prompt_en": "Outline drawing of a child reading by the window with a blanket to color",
    "difficulty": "Fácil"
  },
  {
    "id": 46,
    "day": 46,
    "tematica": "MandalaCorazón",
    "prompt_es": "Dibujo de mandala con corazones y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with hearts and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 47,
    "day": 47,
    "tematica": "AmigosChoc",
    "prompt_es": "Dibujo de amigos compartiendo chocolate caliente en un sofá para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sharing hot chocolate on a sofa to color",
    "difficulty": "Fácil"
  },
  {
    "id": 48,
    "day": 48,
    "tematica": "PerritoInvierno",
    "prompt_es": "Dibujo de un perrito con bufanda jugando en la nieve para colorear solo contornos",
    "prompt_en": "Outline drawing of a puppy with a scarf playing in the snow to color",
    "difficulty": "Medio"
  },
  {
    "id": 49,
    "day": 49,
    "tematica": "GatitoSueño",
    "prompt_es": "Dibujo de un gatito dormido sobre cojines suaves para colorear solo contornos",
    "prompt_en": "Outline drawing of a kitten sleeping on soft cushions to color",
    "difficulty": "Fácil"
  },
  {
    "id": 50,
    "day": 50,
    "tematica": "ChocolateTaza",
    "prompt_es": "Dibujo de taza de chocolate con crema y malvaviscos sobre mesa de madera para colorear solo contornos",
    "prompt_en": "Outline drawing of a cup of hot chocolate with cream and marshmallows on a wooden table to color",
    "difficulty": "Fácil"
  },
  {
    "id": 51,
    "day": 51,
    "tematica": "MandalaSuave",
    "prompt_es": "Dibujo de mandala con patrones suaves de hojas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with soft patterns of leaves and flowers to color",
    "difficulty": "Fácil"
  },
  {
    "id": 52,
    "day": 52,
    "tematica": "SillónAcogedor",
    "prompt_es": "Dibujo de un sillón cómodo con manta, cojín y libro para colorear solo contornos",
    "prompt_en": "Outline drawing of a comfortable armchair with blanket, pillow and book to color",
    "difficulty": "Medio"
  },
  {
    "id": 53,
    "day": 53,
    "tematica": "PerritoAmigos",
    "prompt_es": "Dibujo de varios perritos jugando juntos en un jardín con flores para colorear solo contornos",
    "prompt_en": "Outline drawing of several puppies playing together in a garden with flowers to color",
    "difficulty": "Fácil"
  },
  {
    "id": 54,
    "day": 54,
    "tematica": "GatoVentana",
    "prompt_es": "Dibujo de un gatito mirando por la ventana con plantas alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a kitten looking through a window with plants around to color",
    "difficulty": "Fácil"
  },
  {
    "id": 55,
    "day": 55,
    "tematica": "TéCálido",
    "prompt_es": "Dibujo de taza de té con galletas y un libro abierto para colorear solo contornos",
    "prompt_en": "Outline drawing of a cup of tea with cookies and an open book to color",
    "difficulty": "Fácil"
  },
  {
    "id": 56,
    "day": 56,
    "tematica": "AmigosMerienda",
    "prompt_es": "Dibujo de amigos compartiendo merienda con pasteles y jugo para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sharing a snack with cakes and juice to color",
    "difficulty": "Fácil"
  },
  {
    "id": 57,
    "day": 57,
    "tematica": "MandalaAnimales",
    "prompt_es": "Dibujo de mandala con animales adorables y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with cute animals and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 58,
    "day": 58,
    "tematica": "Estudio creativo",
    "prompt_es": "Dibujo de mesa con material de arte y dibujos en proceso para colorear solo contornos",
    "prompt_en": "Outline drawing of a creative desk with art supplies and drawings in progress to color",
    "difficulty": "Medio"
  },
  {
    "id": 59,
    "day": 59,
    "tematica": "DesayunoCozy",
    "prompt_es": "Mesa de desayuno con pan, té, frutas y galletas para colorear solo contornos",
    "prompt_en": "Outline drawing of a breakfast table with bread, tea, fruits and cookies to color",
    "difficulty": "Fácil"
  },
  {
    "id": 60,
    "day": 60,
    "tematica": "MandalaFlores",
    "prompt_es": "Mandala con flores y hojas delicadas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with delicate flowers and leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 61,
    "day": 61,
    "tematica": "Unicornio",
    "prompt_es": "Unicornio corriendo en pradera con flores y mariposas para colorear solo contornos",
    "prompt_en": "Outline drawing of a unicorn running in a meadow with flowers and butterflies to color",
    "difficulty": "Medio"
  },
  {
    "id": 62,
    "day": 62,
    "tematica": "CaféAmigos",
    "prompt_es": "Amigos compartiendo café y pasteles en café acogedor para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sharing coffee and pastries in a cozy café to color",
    "difficulty": "Fácil"
  },
  {
    "id": 63,
    "day": 63,
    "tematica": "DinosaurioAmigable",
    "prompt_es": "Dinosaurio pequeño y adorable con flores y arbustos para colorear solo contornos",
    "prompt_en": "Outline drawing of a cute small dinosaur with flowers and bushes to color",
    "difficulty": "Medio"
  },
  {
    "id": 64,
    "day": 64,
    "tematica": "TejidoCozy",
    "prompt_es": "Persona tejiendo un jersey con lana y agujas en sillón acogedor para colorear solo contornos",
    "prompt_en": "Outline drawing of a person knitting a sweater with yarn and needles in a cozy armchair to color",
    "difficulty": "Medio"
  },
  {
    "id": 65,
    "day": 65,
    "tematica": "PatioCozy",
    "prompt_es": "Patio con bancos, plantas y mantas para colorear solo contornos",
    "prompt_en": "Outline drawing of a cozy patio with benches, plants and blankets to color",
    "difficulty": "Medio"
  },
  {
    "id": 66,
    "day": 66,
    "tematica": "MandalaAnimales",
    "prompt_es": "Mandala con animales adorables y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with cute animals and leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 67,
    "day": 67,
    "tematica": "PicnicInterior",
    "prompt_es": "Picnic en suelo de habitación con mantas, cojines y comida para colorear solo contornos",
    "prompt_en": "Outline drawing of an indoor picnic with blankets, cushions and food to color",
    "difficulty": "Medio"
  },
  {
    "id": 68,
    "day": 68,
    "tematica": "StPatrick",
    "prompt_es": "Tréboles, sombrero y monedas de oro para St. Patrick’s Day (17 de marzo) para colorear solo contornos",
    "prompt_en": "Outline drawing of shamrocks, hat, and gold coins to celebrate St. Patrick’s Day to color (March 17th)",
    "difficulty": "Medio"
  },
  {
    "id": 69,
    "day": 69,
    "tematica": "Cohete",
    "prompt_es": "Cohete despegando al espacio con planetas y estrellas para colorear solo contornos",
    "prompt_en": "Outline drawing of a rocket launching into space with planets and stars to color",
    "difficulty": "Medio"
  },
  {
    "id": 70,
    "day": 70,
    "tematica": "Astronauta",
    "prompt_es": "Astronauta flotando entre planetas y estrellas para colorear solo contornos",
    "prompt_en": "Outline drawing of an astronaut floating among planets and stars to color",
    "difficulty": "Medio"
  },
  {
    "id": 71,
    "day": 71,
    "tematica": "DragónPequeño",
    "prompt_es": "Dragón amistoso entre flores y arbustos para colorear solo contornos",
    "prompt_en": "Outline drawing of a friendly little dragon among flowers and bushes to color",
    "difficulty": "Medio"
  },
  {
    "id": 72,
    "day": 72,
    "tematica": "VentanaCozy",
    "prompt_es": "Ventana con plantas y luz suave entrando para colorear solo contornos",
    "prompt_en": "Outline drawing of a window with plants and soft light coming in to color",
    "difficulty": "Medio"
  },
  {
    "id": 73,
    "day": 73,
    "tematica": "TéConLibro",
    "prompt_es": "Taza de té sobre mesa con libro abierto y galletas para colorear solo contornos",
    "prompt_en": "Outline drawing of a cup of tea on a table with open book and cookies to color",
    "difficulty": "Fácil"
  },
  {
    "id": 74,
    "day": 74,
    "tematica": "MandalaEspacio",
    "prompt_es": "Mandala con planetas, estrellas y constelaciones para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with planets, stars and constellations to color",
    "difficulty": "Fácil"
  },
  {
    "id": 75,
    "day": 75,
    "tematica": "Horno",
    "prompt_es": "Persona horneando galletas y pasteles en cocina acogedora para colorear solo contornos",
    "prompt_en": "Outline drawing of a person baking cookies and cakes in a cozy kitchen to color",
    "difficulty": "Medio"
  },
  {
    "id": 76,
    "day": 76,
    "tematica": "DinosaurioBosque",
    "prompt_es": "Dinosaurio explorando bosque con flores y arbustos para colorear solo contornos",
    "prompt_en": "Outline drawing of a dinosaur exploring a forest with flowers and bushes to color",
    "difficulty": "Medio"
  },
  {
    "id": 77,
    "day": 77,
    "tematica": "MandalaPrimavera",
    "prompt_es": "Mandala con flores y mariposas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with flowers and butterflies to color",
    "difficulty": "Fácil"
  },
  {
    "id": 78,
    "day": 78,
    "tematica": "JardínPrimavera",
    "prompt_es": "Jardín con flores, senderos y bancos para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with flowers, paths and benches to color",
    "difficulty": "Medio"
  },
  {
    "id": 79,
    "day": 79,
    "tematica": "ConejoFantástico",
    "prompt_es": "Conejo con alas y flores alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a rabbit with wings and flowers around to color",
    "difficulty": "Medio"
  },
  {
    "id": 80,
    "day": 80,
    "tematica": "BibliotecaPrimavera",
    "prompt_es": "Biblioteca con ventanas abiertas y plantas alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a library with open windows and plants around to color",
    "difficulty": "Medio"
  },
  {
    "id": 81,
    "day": 81,
    "tematica": "UnicornioBosque",
    "prompt_es": "Unicornio en bosque con árboles y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a unicorn in a forest with trees and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 82,
    "day": 82,
    "tematica": "RincónTé",
    "prompt_es": "Rincón acogedor con sillón, manta, mesa con té y galletas para colorear solo contornos",
    "prompt_en": "Outline drawing of a cozy corner with armchair, blanket, table with tea and cookies to color",
    "difficulty": "Fácil"
  },
  {
    "id": 83,
    "day": 83,
    "tematica": "AmigosPrimavera",
    "prompt_es": "Amigos sentados en jardín charlando y tomando limonada para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sitting in a garden chatting and having lemonade to color",
    "difficulty": "Fácil"
  },
  {
    "id": 84,
    "day": 84,
    "tematica": "MandalaAnimalesFantásticos",
    "prompt_es": "Mandala con criaturas mitológicas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with mythical creatures and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 85,
    "day": 85,
    "tematica": "CoheteEspacio",
    "prompt_es": "Cohete con astronautas flotando y planetas alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a rocket with astronauts floating and planets around to color",
    "difficulty": "Medio"
  },
  {
    "id": 86,
    "day": 86,
    "tematica": "PicnicPrimavera",
    "prompt_es": "Picnic en césped con mantas, cesta y comida para colorear solo contornos",
    "prompt_en": "Outline drawing of a picnic on the grass with blankets, basket and food to color",
    "difficulty": "Fácil"
  },
  {
    "id": 87,
    "day": 87,
    "tematica": "JardínFlores",
    "prompt_es": "Jardín con flores variadas, senderos y bancos para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with various flowers, paths and benches to color",
    "difficulty": "Medio"
  },
  {
    "id": 88,
    "day": 88,
    "tematica": "DinosaurioAmistoso",
    "prompt_es": "Dinosaurio amistoso jugando con mariposas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a friendly dinosaur playing with butterflies and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 89,
    "day": 89,
    "tematica": "MandalaFloresPrimavera",
    "prompt_es": "Mandala con flores y hojas de primavera para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with spring flowers and leaves to color",
    "difficulty": "Fácil"
  },
  {
    "id": 90,
    "day": 90,
    "tematica": "DesayunoPrimavera",
    "prompt_es": "Mesa de desayuno con pan, frutas, flores y té para colorear solo contornos",
    "prompt_en": "Outline drawing of a breakfast table with bread, fruits, flowers and tea to color",
    "difficulty": "Fácil"
  },
  {
    "id": 91,
    "day": 91,
    "tematica": "MandalaFlores",
    "prompt_es": "Mandala con flores primaverales y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with spring flowers and leaves to color",
    "difficulty": "Difícil"
  },
  {
    "id": 92,
    "day": 92,
    "tematica": "UnicornioBosque",
    "prompt_es": "Unicornio caminando en bosque con flores y mariposas para colorear solo contornos",
    "prompt_en": "Outline drawing of a unicorn walking in a forest with flowers and butterflies to color",
    "difficulty": "Medio"
  },
  {
    "id": 93,
    "day": 93,
    "tematica": "CaféAmigos",
    "prompt_es": "Amigos compartiendo café y pasteles en café acogedor para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sharing coffee and pastries in a cozy café to color",
    "difficulty": "Fácil"
  },
  {
    "id": 94,
    "day": 94,
    "tematica": "DragónPequeño",
    "prompt_es": "Dragón amistoso explorando jardín con flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a friendly small dragon exploring a garden with flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 95,
    "day": 95,
    "tematica": "TejidoCozy",
    "prompt_es": "Persona tejiendo un jersey con lana y agujas en sillón acogedor para colorear solo contornos",
    "prompt_en": "Outline drawing of a person knitting a sweater with yarn and needles in a cozy armchair to color",
    "difficulty": "Medio"
  },
  {
    "id": 96,
    "day": 96,
    "tematica": "PicnicInterior",
    "prompt_es": "Picnic en el suelo de una habitación con mantas, cojines y comida para colorear solo contornos",
    "prompt_en": "Outline drawing of an indoor picnic with blankets, cushions and food to color",
    "difficulty": "Medio"
  },
  {
    "id": 97,
    "day": 97,
    "tematica": "MandalaAnimales",
    "prompt_es": "Mandala con animales adorables y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with cute animals and leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 98,
    "day": 98,
    "tematica": "BibliotecaAcogedora",
    "prompt_es": "Biblioteca con sillón, lámpara y estanterías llenas de libros para colorear solo contornos",
    "prompt_en": "Outline drawing of a cozy library with armchair, lamp and bookshelves to color",
    "difficulty": "Medio"
  },
  {
    "id": 99,
    "day": 99,
    "tematica": "Cohete",
    "prompt_es": "Cohete despegando al espacio con planetas y estrellas para colorear solo contornos",
    "prompt_en": "Outline drawing of a rocket launching into space with planets and stars to color",
    "difficulty": "Medio"
  },
  {
    "id": 100,
    "day": 100,
    "tematica": "Astronauta",
    "prompt_es": "Astronauta flotando entre planetas y constelaciones para colorear solo contornos",
    "prompt_en": "Outline drawing of an astronaut floating among planets and constellations to color",
    "difficulty": "Medio"
  },
  {
    "id": 101,
    "day": 101,
    "tematica": "Horno",
    "prompt_es": "Persona horneando pasteles y galletas en cocina acogedora para colorear solo contornos",
    "prompt_en": "Outline drawing of a person baking cakes and cookies in a cozy kitchen to color",
    "difficulty": "Medio"
  },
  {
    "id": 102,
    "day": 102,
    "tematica": "DinosaurioBosque",
    "prompt_es": "Dinosaurio explorando bosque con flores y arbustos para colorear solo contornos",
    "prompt_en": "Outline drawing of a dinosaur exploring a forest with flowers and bushes to color",
    "difficulty": "Medio"
  },
  {
    "id": 103,
    "day": 103,
    "tematica": "MandalaPrimavera",
    "prompt_es": "Mandala con flores, mariposas y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with flowers, butterflies and leaves to color",
    "difficulty": "Fácil"
  },
  {
    "id": 104,
    "day": 104,
    "tematica": "JardínPrimavera",
    "prompt_es": "Jardín con flores, senderos y bancos para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with flowers, paths and benches to color",
    "difficulty": "Medio"
  },
  {
    "id": 105,
    "day": 105,
    "tematica": "ConejoPascua",
    "prompt_es": "Conejo con huevos de Pascua y cestas de flores para colorear solo contornos (Easter 5 de abril)",
    "prompt_en": "Outline drawing of a bunny with Easter eggs and flower baskets to color (Easter April 5th)",
    "difficulty": "Medio"
  },
  {
    "id": 106,
    "day": 106,
    "tematica": "HuevosDecorados",
    "prompt_es": "Huevos de Pascua decorativos con patrones y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of decorative Easter eggs with patterns and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 107,
    "day": 107,
    "tematica": "MandalaHuevos",
    "prompt_es": "Mandala con huevos de Pascua, flores y detalles primaverales para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with Easter eggs, flowers and spring details to color",
    "difficulty": "Fácil"
  },
  {
    "id": 108,
    "day": 108,
    "tematica": "BibliotecaPrimavera",
    "prompt_es": "Biblioteca con ventanas abiertas y plantas alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a library with open windows and plants around to color",
    "difficulty": "Medio"
  },
  {
    "id": 109,
    "day": 109,
    "tematica": "PicnicPrimavera",
    "prompt_es": "Picnic en césped con mantas, cesta y comida para colorear solo contornos",
    "prompt_en": "Outline drawing of a picnic on grass with blankets, basket and food to color",
    "difficulty": "Fácil"
  },
  {
    "id": 110,
    "day": 110,
    "tematica": "GenteTejiendo",
    "prompt_es": "Personas sentadas en círculo tejiendo y charlando para colorear solo contornos",
    "prompt_en": "Outline drawing of people sitting in a circle knitting and chatting to color",
    "difficulty": "Medio"
  },
  {
    "id": 111,
    "day": 111,
    "tematica": "MandalaAnimalesFantásticos",
    "prompt_es": "Mandala con criaturas fantásticas, flores y hojas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with mythical creatures, flowers and leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 112,
    "day": 112,
    "tematica": "TerrazaAcogedora",
    "prompt_es": "Terraza con plantas, luces y sillones para colorear solo contornos",
    "prompt_en": "Outline drawing of a terrace with plants, lights and armchairs to color",
    "difficulty": "Medio"
  },
  {
    "id": 113,
    "day": 113,
    "tematica": "DragónJardín",
    "prompt_es": "Dragón pequeño jugando entre flores y arbustos para colorear solo contornos",
    "prompt_en": "Outline drawing of a small dragon playing among flowers and bushes to color",
    "difficulty": "Medio"
  },
  {
    "id": 114,
    "day": 114,
    "tematica": "MandalaEspacio",
    "prompt_es": "Mandala con planetas, estrellas y constelaciones para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with planets, stars and constellations to color",
    "difficulty": "Medio"
  },
  {
    "id": 115,
    "day": 115,
    "tematica": "AmigosPrimavera",
    "prompt_es": "Amigos sentados en jardín charlando y tomando limonada para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sitting in a garden chatting and having lemonade to color",
    "difficulty": "Fácil"
  },
  {
    "id": 116,
    "day": 116,
    "tematica": "JardínFlores",
    "prompt_es": "Jardín con flores variadas, senderos y bancos para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with various flowers, paths and benches to color",
    "difficulty": "Medio"
  },
  {
    "id": 117,
    "day": 117,
    "tematica": "DinosaurioAmistoso",
    "prompt_es": "Dinosaurio amistoso jugando con mariposas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a friendly dinosaur playing with butterflies and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 118,
    "day": 118,
    "tematica": "DíaTierra",
    "prompt_es": "Escena con niños plantando árboles y cuidando jardín para colorear solo contornos (Día de la Tierra 22 de abril)",
    "prompt_en": "Outline drawing of children planting trees and taking care of a garden to color (Earth Day April 22nd)",
    "difficulty": "Medio"
  },
  {
    "id": 119,
    "day": 119,
    "tematica": "MandalaFloresPrimavera",
    "prompt_es": "Mandala con flores y hojas de primavera para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with spring flowers and leaves to color",
    "difficulty": "Fácil"
  },
  {
    "id": 120,
    "day": 120,
    "tematica": "DesayunoMontaña",
    "prompt_es": "Mesa de desayuno en cabaña con vista a montaña para colorear solo contornos",
    "prompt_en": "Outline drawing of a breakfast table in a cabin with mountain view to color",
    "difficulty": "Fácil"
  },
  {
    "id": 121,
    "day": 121,
    "tematica": "MandalaGeometrico",
    "prompt_es": "Mandala con patrones geométricos y detalles arquitectónicos para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with geometric patterns and architectural details to color",
    "difficulty": "Medio"
  },
  {
    "id": 122,
    "day": 122,
    "tematica": "Castillo",
    "prompt_es": "Castillo medieval con torre y puente levadizo para colorear solo contornos",
    "prompt_en": "Outline drawing of a medieval castle with tower and drawbridge to color",
    "difficulty": "Medio"
  },
  {
    "id": 123,
    "day": 123,
    "tematica": "GloboAerostático",
    "prompt_es": "Persona en globo aerostático sobre paisaje de colinas para colorear solo contornos",
    "prompt_en": "Outline drawing of a person in a hot air balloon over hilly landscape to color",
    "difficulty": "Medio"
  },
  {
    "id": 124,
    "day": 124,
    "tematica": "Faro",
    "prompt_es": "Faro en acantilado con olas rompiendo para colorear solo contornos",
    "prompt_en": "Outline drawing of a lighthouse on a cliff with waves crashing to color",
    "difficulty": "Medio"
  },
  {
    "id": 125,
    "day": 125,
    "tematica": "CincoDeMayo",
    "prompt_es": "Sombrero, piñata y tacos para celebrar Cinco de Mayo para colorear solo contornos (5 de mayo)",
    "prompt_en": "Outline drawing of a sombrero, piñata and tacos to celebrate Cinco de Mayo to color (May 5th)",
    "difficulty": "Fácil"
  },
  {
    "id": 126,
    "day": 126,
    "tematica": "MandalaMontaña",
    "prompt_es": "Mandala con montañas, ríos y árboles para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with mountains, rivers and trees to color",
    "difficulty": "Fácil"
  },
  {
    "id": 127,
    "day": 127,
    "tematica": "PuebloMedieval",
    "prompt_es": "Pueblo medieval con casas de piedra y tejados a dos aguas para colorear solo contornos",
    "prompt_en": "Outline drawing of a medieval village with stone houses and gabled roofs to color",
    "difficulty": "Medio"
  },
  {
    "id": 128,
    "day": 128,
    "tematica": "TrenMontaña",
    "prompt_es": "Tren antiguo recorriendo montaña con puentes para colorear solo contornos",
    "prompt_en": "Outline drawing of an old train traveling through mountains with bridges to color",
    "difficulty": "Medio"
  },
  {
    "id": 129,
    "day": 129,
    "tematica": "BibliotecaGigante",
    "prompt_es": "Biblioteca con estanterías altas y escaleras para colorear solo contornos",
    "prompt_en": "Outline drawing of a library with tall shelves and ladders to color",
    "difficulty": "Medio"
  },
  {
    "id": 130,
    "day": 130,
    "tematica": "MandalaEstrellas",
    "prompt_es": "Mandala con estrellas, planetas y constelaciones para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with stars, planets and constellations to color",
    "difficulty": "Medio"
  },
  {
    "id": 131,
    "day": 131,
    "tematica": "Observatorio",
    "prompt_es": "Observatorio con telescopio y cielo estrellado para colorear solo contornos",
    "prompt_en": "Outline drawing of an observatory with telescope and starry sky to color",
    "difficulty": "Medio"
  },
  {
    "id": 132,
    "day": 132,
    "tematica": "PuenteRío",
    "prompt_es": "Puente antiguo sobre río con árboles alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of an old bridge over a river with trees around to color",
    "difficulty": "Medio"
  },
  {
    "id": 133,
    "day": 133,
    "tematica": "DíaMadre",
    "prompt_es": "Regalos, flores y tarjetas para celebrar el Día de la Madre para colorear solo contornos (10 de mayo)",
    "prompt_en": "Outline drawing of gifts, flowers and cards to celebrate Mother’s Day to color (May 10th)",
    "difficulty": "Fácil"
  },
  {
    "id": 134,
    "day": 134,
    "tematica": "MandalaCastillo",
    "prompt_es": "Mandala con torres, almenas y jardines para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with towers, battlements and gardens to color",
    "difficulty": "Medio"
  },
  {
    "id": 135,
    "day": 135,
    "tematica": "JardínSecreto",
    "prompt_es": "Jardín con senderos, fuentes y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with paths, fountains and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 136,
    "day": 136,
    "tematica": "Carrusel",
    "prompt_es": "Carrusel antiguo con caballos y luces para colorear solo contornos",
    "prompt_en": "Outline drawing of an old carousel with horses and lights to color",
    "difficulty": "Medio"
  },
  {
    "id": 137,
    "day": 137,
    "tematica": "PuestaSol",
    "prompt_es": "Paisaje de colinas al atardecer con árboles y nubes para colorear solo contornos",
    "prompt_en": "Outline drawing of hills at sunset with trees and clouds to color",
    "difficulty": "Medio"
  },
  {
    "id": 138,
    "day": 138,
    "tematica": "MandalaNaturaleza",
    "prompt_es": "Mandala con árboles, flores y animales del bosque para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with trees, flowers and forest animals to color",
    "difficulty": "Medio"
  },
  {
    "id": 139,
    "day": 139,
    "tematica": "PlayaRocas",
    "prompt_es": "Playa con acantilados, olas y rocas para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach with cliffs, waves and rocks to color",
    "difficulty": "Medio"
  },
  {
    "id": 140,
    "day": 140,
    "tematica": "Glaciar",
    "prompt_es": "Paisaje de glaciar con montañas y cielo nublado para colorear solo contornos",
    "prompt_en": "Outline drawing of a glacier landscape with mountains and cloudy sky to color",
    "difficulty": "Medio"
  },
  {
    "id": 141,
    "day": 141,
    "tematica": "PuenteColgante",
    "prompt_es": "Puente colgante sobre río con vegetación para colorear solo contornos",
    "prompt_en": "Outline drawing of a suspension bridge over river with vegetation to color",
    "difficulty": "Medio"
  },
  {
    "id": 142,
    "day": 142,
    "tematica": "Mercadillo",
    "prompt_es": "Mercadillo con puestos, frutas, flores y faroles para colorear solo contornos",
    "prompt_en": "Outline drawing of a market with stalls, fruits, flowers and lanterns to color",
    "difficulty": "Medio"
  },
  {
    "id": 143,
    "day": 143,
    "tematica": "MandalaArquitectura",
    "prompt_es": "Mandala con formas de edificios, torres y ventanas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with building shapes, towers and windows to color",
    "difficulty": "Fácil"
  },
  {
    "id": 144,
    "day": 144,
    "tematica": "FaroNoche",
    "prompt_es": "Faro iluminando el mar y el cielo estrellado para colorear solo contornos",
    "prompt_en": "Outline drawing of a lighthouse lighting the sea and starry sky to color",
    "difficulty": "Medio"
  },
  {
    "id": 145,
    "day": 145,
    "tematica": "CastilloColina",
    "prompt_es": "Castillo sobre colina con murallas y árboles alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a castle on a hill with walls and trees around to color",
    "difficulty": "Medio"
  },
  {
    "id": 146,
    "day": 146,
    "tematica": "TrenPuente",
    "prompt_es": "Tren antiguo cruzando puente sobre río con montañas para colorear solo contornos",
    "prompt_en": "Outline drawing of an old train crossing a bridge over a river with mountains to color",
    "difficulty": "Medio"
  },
  {
    "id": 147,
    "day": 147,
    "tematica": "MontañaRío",
    "prompt_es": "Paisaje de montaña con río, árboles y sendero para colorear solo contornos",
    "prompt_en": "Outline drawing of a mountain landscape with river, trees and path to color",
    "difficulty": "Medio"
  },
  {
    "id": 148,
    "day": 148,
    "tematica": "JardínFaroles",
    "prompt_es": "Jardín nocturno con faroles, flores y senderos para colorear solo contornos",
    "prompt_en": "Outline drawing of a night garden with lanterns, flowers and paths to color",
    "difficulty": "Medio"
  },
  {
    "id": 149,
    "day": 149,
    "tematica": "MandalaFiesta",
    "prompt_es": "Mandala con elementos de festividades y decoraciones para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with festival elements and decorations to color",
    "difficulty": "Medio"
  },
  {
    "id": 150,
    "day": 150,
    "tematica": "BibliotecaCastillo",
    "prompt_es": "Biblioteca dentro de castillo con estanterías y escalera en espiral para colorear solo contornos",
    "prompt_en": "Outline drawing of a library inside a castle with shelves and spiral staircase to color",
    "difficulty": "Medio"
  },
  {
    "id": 151,
    "day": 151,
    "tematica": "DesayunoVerano",
    "prompt_es": "Mesa de desayuno con frutas, zumos y sombrero de paja para colorear solo contornos",
    "prompt_en": "Outline drawing of a breakfast table with fruits, juices and straw hat to color",
    "difficulty": "Fácil"
  },
  {
    "id": 152,
    "day": 152,
    "tematica": "MandalaVerano",
    "prompt_es": "Mandala con soles, olas, flores y frutas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with suns, waves, flowers and fruits to color",
    "difficulty": "Medio"
  },
  {
    "id": 153,
    "day": 153,
    "tematica": "Playa",
    "prompt_es": "Escena de playa con sombrillas, toallas y conchas para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach scene with umbrellas, towels and shells to color",
    "difficulty": "Medio"
  },
  {
    "id": 154,
    "day": 154,
    "tematica": "PicnicParque",
    "prompt_es": "Amigos haciendo picnic en parque con manta y frutas para colorear solo contornos",
    "prompt_en": "Outline drawing of friends having a picnic in a park with blanket and fruits to color",
    "difficulty": "Fácil"
  },
  {
    "id": 155,
    "day": 155,
    "tematica": "CarruselFeria",
    "prompt_es": "Carrusel con caballos, luces y globos para colorear solo contornos",
    "prompt_en": "Outline drawing of a carousel with horses, lights and balloons to color",
    "difficulty": "Medio"
  },
  {
    "id": 156,
    "day": 156,
    "tematica": "AlgodónAzúcar",
    "prompt_es": "Puesto de algodón de azúcar con niños felices para colorear solo contornos",
    "prompt_en": "Outline drawing of a cotton candy stand with happy children to color",
    "difficulty": "Medio"
  },
  {
    "id": 157,
    "day": 157,
    "tematica": "MandalaFrutas",
    "prompt_es": "Mandala con frutas veraniegas, hojas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with summer fruits, leaves and flowers to color",
    "difficulty": "Fácil"
  },
  {
    "id": 158,
    "day": 158,
    "tematica": "CastilloVerano",
    "prompt_es": "Castillo con jardines, fuentes y mariposas para colorear solo contornos",
    "prompt_en": "Outline drawing of a castle with gardens, fountains and butterflies to color",
    "difficulty": "Medio"
  },
  {
    "id": 159,
    "day": 159,
    "tematica": "SombreroSol",
    "prompt_es": "Persona con sombrero de paja caminando por sendero soleado para colorear solo contornos",
    "prompt_en": "Outline drawing of a person wearing straw hat walking on sunny path to color",
    "difficulty": "Fácil"
  },
  {
    "id": 160,
    "day": 160,
    "tematica": "Helados",
    "prompt_es": "Niños comiendo helados en verano para colorear solo contornos",
    "prompt_en": "Outline drawing of children eating ice creams in summer to color",
    "difficulty": "Fácil"
  },
  {
    "id": 161,
    "day": 161,
    "tematica": "MandalaOlas",
    "prompt_es": "Mandala con olas, peces y estrellas de mar para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with waves, fish and starfish to color",
    "difficulty": "Difícil"
  },
  {
    "id": 162,
    "day": 162,
    "tematica": "Piscina",
    "prompt_es": "Niños jugando en piscina con flotadores y pelotas para colorear solo contornos",
    "prompt_en": "Outline drawing of children playing in a pool with floaties and balls to color",
    "difficulty": "Medio"
  },
  {
    "id": 163,
    "day": 163,
    "tematica": "LecturaExterior",
    "prompt_es": "Persona leyendo en hamaca con sombrero y flores alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a person reading in a hammock with hat and flowers around to color",
    "difficulty": "Fácil"
  },
  {
    "id": 164,
    "day": 164,
    "tematica": "ParqueVerano",
    "prompt_es": "Parque con bancos, flores, caminos y niños jugando para colorear solo contornos",
    "prompt_en": "Outline drawing of a park with benches, flowers, paths and children playing to color",
    "difficulty": "Medio"
  },
  {
    "id": 165,
    "day": 165,
    "tematica": "MandalaAnimalesVerano",
    "prompt_es": "Mandala con pájaros, mariposas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with birds, butterflies and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 166,
    "day": 166,
    "tematica": "GlaciarVerano",
    "prompt_es": "Paisaje de montaña con glaciar y lago para colorear solo contornos",
    "prompt_en": "Outline drawing of a mountain landscape with glacier and lake to color",
    "difficulty": "Medio"
  },
  {
    "id": 167,
    "day": 167,
    "tematica": "FarolaFeria",
    "prompt_es": "Puesto de feria con farolas, globos y niños jugando para colorear solo contornos",
    "prompt_en": "Outline drawing of a fair stand with lanterns, balloons and children playing to color",
    "difficulty": "Medio"
  },
  {
    "id": 168,
    "day": 168,
    "tematica": "TrenVerano",
    "prompt_es": "Tren recorriendo colinas y campos soleados para colorear solo contornos",
    "prompt_en": "Outline drawing of a train traveling through hills and sunny fields to color",
    "difficulty": "Medio"
  },
  {
    "id": 169,
    "day": 169,
    "tematica": "MandalaCastillo",
    "prompt_es": "Mandala con castillo, torres y jardines para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with castle, towers and gardens to color",
    "difficulty": "Medio"
  },
  {
    "id": 170,
    "day": 170,
    "tematica": "BicicletaVerano",
    "prompt_es": "Persona paseando en bicicleta por sendero con flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a person riding a bike on a path with flowers to color",
    "difficulty": "Fácil"
  },
  {
    "id": 171,
    "day": 171,
    "tematica": "Atardecer",
    "prompt_es": "Paisaje de playa al atardecer con olas y palmeras para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach at sunset with waves and palm trees to color",
    "difficulty": "Medio"
  },
  {
    "id": 172,
    "day": 172,
    "tematica": "GenteTejiendo",
    "prompt_es": "Amigos tejiendo mantas en jardín soleado para colorear solo contornos",
    "prompt_en": "Outline drawing of friends knitting blankets in sunny garden to color",
    "difficulty": "Medio"
  },
  {
    "id": 173,
    "day": 173,
    "tematica": "MandalaSoles",
    "prompt_es": "Mandala con soles, nubes y rayos para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with suns, clouds and rays to color",
    "difficulty": "Medio"
  },
  {
    "id": 174,
    "day": 174,
    "tematica": "PicnicPlaya",
    "prompt_es": "Picnic en arena con sombrillas, frutas y bebida para colorear solo contornos",
    "prompt_en": "Outline drawing of a picnic on sand with umbrellas, fruits and drinks to color",
    "difficulty": "Fácil"
  },
  {
    "id": 175,
    "day": 175,
    "tematica": "BibliotecaVerano",
    "prompt_es": "Biblioteca al aire libre con libros, sillones y plantas para colorear solo contornos",
    "prompt_en": "Outline drawing of an outdoor library with books, armchairs and plants to color",
    "difficulty": "Medio"
  },
  {
    "id": 176,
    "day": 176,
    "tematica": "CastilloFeria",
    "prompt_es": "Castillo con feria de luces y carruseles alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a castle with lights and carousel fair around to color",
    "difficulty": "Medio"
  },
  {
    "id": 177,
    "day": 177,
    "tematica": "MandalaMariposas",
    "prompt_es": "Mandala con mariposas, flores y hojas veraniegas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with butterflies, flowers and summer leaves to color",
    "difficulty": "Difícil"
  },
  {
    "id": 178,
    "day": 178,
    "tematica": "AtardecerMontaña",
    "prompt_es": "Paisaje de montaña con sol poniente y sendero para colorear solo contornos",
    "prompt_en": "Outline drawing of a mountain landscape with setting sun and path to color",
    "difficulty": "Medio"
  },
  {
    "id": 179,
    "day": 179,
    "tematica": "DíaPadre",
    "prompt_es": "Regalos, tarjetas y figuras paternas para celebrar Día del Padre (21 de junio) para colorear solo contornos",
    "prompt_en": "Outline drawing of gifts, cards and fatherly figures to celebrate Father’s Day to color (June 21st)",
    "difficulty": "Fácil"
  },
  {
    "id": 180,
    "day": 180,
    "tematica": "AmigosVerano",
    "prompt_es": "Amigos jugando al aire libre con frisbee y picnic para colorear solo contornos",
    "prompt_en": "Outline drawing of friends playing outdoors with frisbee and picnic to color",
    "difficulty": "Fácil"
  },
  {
    "id": 181,
    "day": 181,
    "tematica": "MandalaFrutasVerano",
    "prompt_es": "Mandala con frutas tropicales, hojas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with tropical fruits, leaves and flowers to color",
    "difficulty": "Difícil"
  },
  {
    "id": 182,
    "day": 182,
    "tematica": "PlayaRayas",
    "prompt_es": "Casas de playa a rayas con sombrillas y arena para colorear solo contornos",
    "prompt_en": "Outline drawing of striped beach houses with umbrellas and sand to color",
    "difficulty": "Medio"
  },
  {
    "id": 183,
    "day": 183,
    "tematica": "MandalaVerano",
    "prompt_es": "Mandala con soles, olas, conchas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with suns, waves, shells and flowers to color",
    "difficulty": "Difícil"
  },
  {
    "id": 184,
    "day": 184,
    "tematica": "SombreroSol",
    "prompt_es": "Persona con sombrero de paja caminando por playa soleada para colorear solo contornos",
    "prompt_en": "Outline drawing of a person wearing a straw hat walking on sunny beach to color",
    "difficulty": "Fácil"
  },
  {
    "id": 185,
    "day": 185,
    "tematica": "DíaIndependencia",
    "prompt_es": "Fuegos artificiales, banderas y picnic patriótico para celebrar 4 de julio para colorear solo contornos",
    "prompt_en": "Outline drawing of fireworks, flags and patriotic picnic to celebrate July 4th to color",
    "difficulty": "Medio"
  },
  {
    "id": 186,
    "day": 186,
    "tematica": "PicnicVerano",
    "prompt_es": "Amigos haciendo picnic en parque soleado con frutas y bebida para colorear solo contornos",
    "prompt_en": "Outline drawing of friends having a picnic in sunny park with fruits and drinks to color",
    "difficulty": "Fácil"
  },
  {
    "id": 187,
    "day": 187,
    "tematica": "CastilloArena",
    "prompt_es": "Niños construyendo castillo de arena con cubos y palas para colorear solo contornos",
    "prompt_en": "Outline drawing of children building a sandcastle with buckets and shovels to color",
    "difficulty": "Medio"
  },
  {
    "id": 188,
    "day": 188,
    "tematica": "Helado",
    "prompt_es": "Niños disfrutando de helados veraniegos para colorear solo contornos",
    "prompt_en": "Outline drawing of children enjoying summer ice creams to color",
    "difficulty": "Fácil"
  },
  {
    "id": 189,
    "day": 189,
    "tematica": "MandalaOlas",
    "prompt_es": "Mandala con olas, peces y estrellas de mar para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with waves, fish and starfish to color",
    "difficulty": "Difícil"
  },
  {
    "id": 190,
    "day": 190,
    "tematica": "Barco",
    "prompt_es": "Barco navegando en mar con gaviotas y olas para colorear solo contornos",
    "prompt_en": "Outline drawing of a boat sailing on the sea with seagulls and waves to color",
    "difficulty": "Medio"
  },
  {
    "id": 191,
    "day": 191,
    "tematica": "GloboViaje",
    "prompt_es": "Persona viajando en globo aerostático sobre paisaje veraniego para colorear solo contornos",
    "prompt_en": "Outline drawing of a person traveling in a hot air balloon over summer landscape to color",
    "difficulty": "Medio"
  },
  {
    "id": 192,
    "day": 192,
    "tematica": "Feria",
    "prompt_es": "Feria de verano con carrusel, luces y globos para colorear solo contornos",
    "prompt_en": "Outline drawing of a summer fair with carousel, lights and balloons to color",
    "difficulty": "Medio"
  },
  {
    "id": 193,
    "day": 193,
    "tematica": "AlgodónAzúcar",
    "prompt_es": "Puesto de algodón de azúcar con niños felices para colorear solo contornos",
    "prompt_en": "Outline drawing of a cotton candy stand with happy children to color",
    "difficulty": "Fácil"
  },
  {
    "id": 194,
    "day": 194,
    "tematica": "MandalaFrutas",
    "prompt_es": "Mandala con frutas veraniegas, hojas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with summer fruits, leaves and flowers to color",
    "difficulty": "Difícil"
  },
  {
    "id": 195,
    "day": 195,
    "tematica": "TrenVerano",
    "prompt_es": "Tren recorriendo colinas soleadas y campos floridos para colorear solo contornos",
    "prompt_en": "Outline drawing of a train traveling through sunny hills and flower fields to color",
    "difficulty": "Medio"
  },
  {
    "id": 196,
    "day": 196,
    "tematica": "BibliotecaExterior",
    "prompt_es": "Biblioteca al aire libre con libros, sillones y plantas para colorear solo contornos",
    "prompt_en": "Outline drawing of an outdoor library with books, armchairs and plants to color",
    "difficulty": "Medio"
  },
  {
    "id": 197,
    "day": 197,
    "tematica": "AtardecerPlaya",
    "prompt_es": "Playa con palmeras y sol poniéndose sobre el mar para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach with palm trees and sunset over the sea to color",
    "difficulty": "Medio"
  },
  {
    "id": 198,
    "day": 198,
    "tematica": "MandalaCastilloArena",
    "prompt_es": "Mandala con castillos de arena, palas y cubos para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with sandcastles, shovels and buckets to color",
    "difficulty": "Difícil"
  },
  {
    "id": 199,
    "day": 199,
    "tematica": "JardínVerano",
    "prompt_es": "Jardín con flores, senderos y bancos para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with flowers, paths and benches to color",
    "difficulty": "Medio"
  },
  {
    "id": 200,
    "day": 200,
    "tematica": "Bicicleta",
    "prompt_es": "Persona paseando en bicicleta por sendero soleado con flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a person riding a bike on sunny path with flowers to color",
    "difficulty": "Fácil"
  },
  {
    "id": 201,
    "day": 201,
    "tematica": "MandalaSoles",
    "prompt_es": "Mandala con soles, nubes y rayos para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with suns, clouds and rays to color",
    "difficulty": "Difícil"
  },
  {
    "id": 202,
    "day": 202,
    "tematica": "TerrazaVerano",
    "prompt_es": "Terraza con sombrillas, plantas y sillones para colorear solo contornos",
    "prompt_en": "Outline drawing of a terrace with umbrellas, plants and armchairs to color",
    "difficulty": "Medio"
  },
  {
    "id": 203,
    "day": 203,
    "tematica": "PicnicPlaya",
    "prompt_es": "Picnic en arena con sombrillas, frutas y bebida para colorear solo contornos",
    "prompt_en": "Outline drawing of a picnic on sand with umbrellas, fruits and drinks to color",
    "difficulty": "Fácil"
  },
  {
    "id": 204,
    "day": 204,
    "tematica": "AmigosVerano",
    "prompt_es": "Amigos jugando al aire libre con frisbee y pelota para colorear solo contornos",
    "prompt_en": "Outline drawing of friends playing outdoors with frisbee and ball to color",
    "difficulty": "Fácil"
  },
  {
    "id": 205,
    "day": 205,
    "tematica": "CastilloVerano",
    "prompt_es": "Castillo sobre colina con jardines y mariposas para colorear solo contornos",
    "prompt_en": "Outline drawing of a castle on a hill with gardens and butterflies to color",
    "difficulty": "Medio"
  },
  {
    "id": 206,
    "day": 206,
    "tematica": "MandalaMariposas",
    "prompt_es": "Mandala con mariposas, flores y hojas veraniegas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with butterflies, flowers and summer leaves to color",
    "difficulty": "Difícil"
  },
  {
    "id": 207,
    "day": 207,
    "tematica": "BarcoVela",
    "prompt_es": "Barco de vela navegando en mar con olas y gaviotas para colorear solo contornos",
    "prompt_en": "Outline drawing of a sailboat on the sea with waves and seagulls to color",
    "difficulty": "Medio"
  },
  {
    "id": 208,
    "day": 208,
    "tematica": "FarolaPlaya",
    "prompt_es": "Farola antigua en paseo marítimo con niños jugando para colorear solo contornos",
    "prompt_en": "Outline drawing of an old lamp on boardwalk with children playing to color",
    "difficulty": "Medio"
  },
  {
    "id": 209,
    "day": 209,
    "tematica": "HeladoFeria",
    "prompt_es": "Niños comiendo helados en feria con luces y globos para colorear solo contornos",
    "prompt_en": "Outline drawing of children eating ice creams at a fair with lights and balloons to color",
    "difficulty": "Fácil"
  },
  {
    "id": 210,
    "day": 210,
    "tematica": "MandalaViaje",
    "prompt_es": "Mandala con mapas, maletas, globos y soles para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with maps, suitcases, balloons and suns to color",
    "difficulty": "Difícil"
  },
  {
    "id": 211,
    "day": 211,
    "tematica": "PlayaAtardecer",
    "prompt_es": "Playa con conchas, sombrillas y cielo anaranjado al atardecer para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach with shells, umbrellas and orange sky at sunset to color",
    "difficulty": "Medio"
  },
  {
    "id": 212,
    "day": 212,
    "tematica": "AmigosPicnic",
    "prompt_es": "Amigos compartiendo picnic en jardín con frutas y manta para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sharing picnic in garden with fruits and blanket to color",
    "difficulty": "Fácil"
  },
  {
    "id": 213,
    "day": 213,
    "tematica": "PlayaSombrillas",
    "prompt_es": "Playa con sombrillas, toallas y conchas para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach with umbrellas, towels and shells to color",
    "difficulty": "Medio"
  },
  {
    "id": 214,
    "day": 214,
    "tematica": "MandalaVerano",
    "prompt_es": "Mandala con soles, olas, conchas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with suns, waves, shells and flowers to color",
    "difficulty": "Difícil"
  },
  {
    "id": 215,
    "day": 215,
    "tematica": "CastilloArena",
    "prompt_es": "Niños construyendo castillos de arena con cubos y palas para colorear solo contornos",
    "prompt_en": "Outline drawing of children building sandcastles with buckets and shovels to color",
    "difficulty": "Medio"
  },
  {
    "id": 216,
    "day": 216,
    "tematica": "Feria",
    "prompt_es": "Carrusel, luces y globos en feria de verano para colorear solo contornos",
    "prompt_en": "Outline drawing of a summer fair with carousel, lights and balloons to color",
    "difficulty": "Medio"
  },
  {
    "id": 217,
    "day": 217,
    "tematica": "AlgodónAzúcar",
    "prompt_es": "Puesto de algodón de azúcar con niños felices para colorear solo contornos",
    "prompt_en": "Outline drawing of a cotton candy stand with happy children to color",
    "difficulty": "Fácil"
  },
  {
    "id": 218,
    "day": 218,
    "tematica": "Helados",
    "prompt_es": "Niños disfrutando de helados veraniegos para colorear solo contornos",
    "prompt_en": "Outline drawing of children enjoying summer ice creams to color",
    "difficulty": "Fácil"
  },
  {
    "id": 219,
    "day": 219,
    "tematica": "MandalaAnimales",
    "prompt_es": "Mandala con pájaros, conejos y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with birds, rabbits and flowers to color",
    "difficulty": "Difícil"
  },
  {
    "id": 220,
    "day": 220,
    "tematica": "BarcoVela",
    "prompt_es": "Barco de vela navegando en mar con olas y gaviotas para colorear solo contornos",
    "prompt_en": "Outline drawing of a sailboat on the sea with waves and seagulls to color",
    "difficulty": "Medio"
  },
  {
    "id": 221,
    "day": 221,
    "tematica": "PicnicParque",
    "prompt_es": "Amigos haciendo picnic en parque soleado con frutas y manta para colorear solo contornos",
    "prompt_en": "Outline drawing of friends having a picnic in sunny park with fruits and blanket to color",
    "difficulty": "Fácil"
  },
  {
    "id": 222,
    "day": 222,
    "tematica": "BibliotecaExterior",
    "prompt_es": "Biblioteca al aire libre con libros, sillones y plantas para colorear solo contornos",
    "prompt_en": "Outline drawing of an outdoor library with books, armchairs and plants to color",
    "difficulty": "Medio"
  },
  {
    "id": 223,
    "day": 223,
    "tematica": "MandalaFrutas",
    "prompt_es": "Mandala con frutas veraniegas, hojas y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with summer fruits, leaves and flowers to color",
    "difficulty": "Difícil"
  },
  {
    "id": 224,
    "day": 224,
    "tematica": "PaseoBici",
    "prompt_es": "Persona paseando en bicicleta por sendero soleado con flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a person riding a bike on sunny path with flowers to color",
    "difficulty": "Fácil"
  },
  {
    "id": 225,
    "day": 225,
    "tematica": "AtardecerPlaya",
    "prompt_es": "Playa con palmeras y sol poniéndose sobre el mar para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach with palm trees and sunset over the sea to color",
    "difficulty": "Medio"
  },
  {
    "id": 226,
    "day": 226,
    "tematica": "MandalaOlas",
    "prompt_es": "Mandala con olas, peces y estrellas de mar para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with waves, fish and starfish to color",
    "difficulty": "Difícil"
  },
  {
    "id": 227,
    "day": 227,
    "tematica": "Faro",
    "prompt_es": "Faro en costa con olas rompiendo y cielo soleado para colorear solo contornos",
    "prompt_en": "Outline drawing of a lighthouse on coast with crashing waves and sunny sky to color",
    "difficulty": "Medio"
  },
  {
    "id": 228,
    "day": 228,
    "tematica": "AmigosVerano",
    "prompt_es": "Amigos jugando al aire libre con frisbee y pelota para colorear solo contornos",
    "prompt_en": "Outline drawing of friends playing outdoors with frisbee and ball to color",
    "difficulty": "Fácil"
  },
  {
    "id": 229,
    "day": 229,
    "tematica": "CastilloVerano",
    "prompt_es": "Castillo sobre colina con jardines y mariposas para colorear solo contornos",
    "prompt_en": "Outline drawing of a castle on a hill with gardens and butterflies to color",
    "difficulty": "Medio"
  },
  {
    "id": 230,
    "day": 230,
    "tematica": "MandalaMariposas",
    "prompt_es": "Mandala con mariposas, flores y hojas veraniegas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with butterflies, flowers and summer leaves to color",
    "difficulty": "Difícil"
  },
  {
    "id": 231,
    "day": 231,
    "tematica": "TrenVerano",
    "prompt_es": "Tren recorriendo colinas y campos soleados para colorear solo contornos",
    "prompt_en": "Outline drawing of a train traveling through sunny hills and fields to color",
    "difficulty": "Medio"
  },
  {
    "id": 232,
    "day": 232,
    "tematica": "TerrazaVerano",
    "prompt_es": "Terraza con sombrillas, plantas y sillones para colorear solo contornos",
    "prompt_en": "Outline drawing of a terrace with umbrellas, plants and armchairs to color",
    "difficulty": "Medio"
  },
  {
    "id": 233,
    "day": 233,
    "tematica": "GlaciarVerano",
    "prompt_es": "Paisaje de montaña con glaciar y lago para colorear solo contornos",
    "prompt_en": "Outline drawing of a mountain landscape with glacier and lake to color",
    "difficulty": "Medio"
  },
  {
    "id": 234,
    "day": 234,
    "tematica": "JardínVerano",
    "prompt_es": "Jardín con flores, senderos y bancos para colorear solo contornos",
    "prompt_en": "Outline drawing of a garden with flowers, paths and benches to color",
    "difficulty": "Medio"
  },
  {
    "id": 235,
    "day": 235,
    "tematica": "FeriaAnimales",
    "prompt_es": "Animales pequeños disfrutando de feria con luces y globos para colorear solo contornos",
    "prompt_en": "Outline drawing of small animals enjoying a fair with lights and balloons to color",
    "difficulty": "Medio"
  },
  {
    "id": 236,
    "day": 236,
    "tematica": "MandalaCastillo",
    "prompt_es": "Mandala con castillo, torres y jardines para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with castle, towers and gardens to color",
    "difficulty": "Difícil"
  },
  {
    "id": 237,
    "day": 237,
    "tematica": "PlayaAtardecer",
    "prompt_es": "Playa con conchas, sombrillas y cielo anaranjado al atardecer para colorear solo contornos",
    "prompt_en": "Outline drawing of a beach with shells, umbrellas and orange sky at sunset to color",
    "difficulty": "Medio"
  },
  {
    "id": 238,
    "day": 238,
    "tematica": "AmigosPicnic",
    "prompt_es": "Amigos compartiendo picnic en jardín con frutas y manta para colorear solo contornos",
    "prompt_en": "Outline drawing of friends sharing picnic in garden with fruits and blanket to color",
    "difficulty": "Fácil"
  },
  {
    "id": 239,
    "day": 239,
    "tematica": "BarcoPesca",
    "prompt_es": "Pequeño barco de pesca en mar tranquilo con peces y redes para colorear solo contornos",
    "prompt_en": "Outline drawing of a small fishing boat on calm sea with fish and nets to color",
    "difficulty": "Medio"
  },
  {
    "id": 240,
    "day": 240,
    "tematica": "MandalaSoles",
    "prompt_es": "Mandala con soles, nubes y rayos para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with suns, clouds and rays to color",
    "difficulty": "Difícil"
  },
  {
    "id": 241,
    "day": 241,
    "tematica": "PaseoMontaña",
    "prompt_es": "Persona caminando por sendero montañoso con mochila y flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a person hiking on mountain path with backpack and flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 242,
    "day": 242,
    "tematica": "FeriaNocturna",
    "prompt_es": "Feria de verano de noche con luces y globos para colorear solo contornos",
    "prompt_en": "Outline drawing of a summer night fair with lights and balloons to color",
    "difficulty": "Medio"
  },
  {
    "id": 243,
    "day": 243,
    "tematica": "HeladoFeria",
    "prompt_es": "Niños comiendo helados en feria con luces y globos para colorear solo contornos",
    "prompt_en": "Outline drawing of children eating ice creams at a fair with lights and balloons to color",
    "difficulty": "Fácil"
  },
  {
    "id": 244,
    "day": 244,
    "tematica": "VueltaColeMagica",
    "prompt_es": "Niños entrando al colegio con mochilas, acompañados de pequeños unicornios y arcoíris para colorear solo contornos",
    "prompt_en": "Outline drawing of children entering school with backpacks, accompanied by small unicorns and rainbow to color",
    "difficulty": "Medio"
  },
  {
    "id": 245,
    "day": 245,
    "tematica": "AulaArteMagica",
    "prompt_es": "Aula con niños pintando y pinceles mágicos, hadas volando alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of classroom with children painting with magical brushes, fairies flying around to color",
    "difficulty": "Medio"
  },
  {
    "id": 246,
    "day": 246,
    "tematica": "BibliotecaEncantada",
    "prompt_es": "Niños leyendo libros mágicos en biblioteca con estanterías flotantes para colorear solo contornos",
    "prompt_en": "Outline drawing of children reading magical books in library with floating shelves to color",
    "difficulty": "Medio"
  },
  {
    "id": 247,
    "day": 247,
    "tematica": "PatioJuegosFantasia",
    "prompt_es": "Niños jugando en patio escolar con criaturas fantásticas y arcoíris para colorear solo contornos",
    "prompt_en": "Outline drawing of children playing in schoolyard with fantasy creatures and rainbow to color",
    "difficulty": "Medio"
  },
  {
    "id": 248,
    "day": 248,
    "tematica": "MandalaEscuela",
    "prompt_es": "Mandala con lápices, libros, estrellas y varitas mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with pencils, books, stars and magic wands to color",
    "difficulty": "Difícil"
  },
  {
    "id": 249,
    "day": 249,
    "tematica": "LaboratorioMagico",
    "prompt_es": "Niños haciendo experimentos con pociones y varitas mágicas en aula de ciencia para colorear solo contornos",
    "prompt_en": "Outline drawing of children doing experiments with potions and magic wands in science classroom to color",
    "difficulty": "Medio"
  },
  {
    "id": 250,
    "day": 250,
    "tematica": "JardinUnicornio",
    "prompt_es": "Jardín escolar con flores, árboles y un unicornio paseando para colorear solo contornos",
    "prompt_en": "Outline drawing of school garden with flowers, trees and a unicorn walking to color",
    "difficulty": "Medio"
  },
  {
    "id": 251,
    "day": 251,
    "tematica": "TallerCreativo",
    "prompt_es": "Niños creando arte y figuras mágicas en taller de arte para colorear solo contornos",
    "prompt_en": "Outline drawing of children creating art and magical figures in art workshop to color",
    "difficulty": "Medio"
  },
  {
    "id": 252,
    "day": 252,
    "tematica": "MandalaArcoiris",
    "prompt_es": "Mandala con arcoíris, nubes, estrellas y pequeños unicornios para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with rainbow, clouds, stars and small unicorns to color",
    "difficulty": "Medio"
  },
  {
    "id": 253,
    "day": 253,
    "tematica": "PaseoMagico",
    "prompt_es": "Niños explorando bosque cercano al colegio con hadas y criaturas mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of children exploring forest near school with fairies and magical creatures to color",
    "difficulty": "Medio"
  },
  {
    "id": 254,
    "day": 254,
    "tematica": "FiestaBiblioteca",
    "prompt_es": "Personajes mágicos y niños leyendo juntos en biblioteca con globos y confeti para colorear solo contornos",
    "prompt_en": "Outline drawing of magical characters and children reading together in library with balloons and confetti to color",
    "difficulty": "Fácil"
  },
  {
    "id": 255,
    "day": 255,
    "tematica": "PatioDeportes",
    "prompt_es": "Niños jugando fútbol y saltando la cuerda junto a criaturas fantásticas para colorear solo contornos",
    "prompt_en": "Outline drawing of children playing soccer and jumping rope with fantasy creatures to color",
    "difficulty": "Fácil"
  },
  {
    "id": 256,
    "day": 256,
    "tematica": "MandalaMagica2",
    "prompt_es": "Mandala con libros, varitas, estrellas y pociones mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with books, wands, stars and magical potions to color",
    "difficulty": "Medio"
  },
  {
    "id": 257,
    "day": 257,
    "tematica": "ArcoirisCole",
    "prompt_es": "Niños en patio mirando arcoíris con pequeños dragones y unicornios para colorear solo contornos",
    "prompt_en": "Outline drawing of children in schoolyard watching rainbow with small dragons and unicorns to color",
    "difficulty": "Medio"
  },
  {
    "id": 258,
    "day": 258,
    "tematica": "AulaTecnologica",
    "prompt_es": "Niños usando tabletas y robots mágicos en aula para colorear solo contornos",
    "prompt_en": "Outline drawing of children using tablets and magical robots in classroom to color",
    "difficulty": "Medio"
  },
  {
    "id": 259,
    "day": 259,
    "tematica": "MandalaBosque",
    "prompt_es": "Mandala con árboles, hojas, setas y criaturas mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with trees, leaves, mushrooms and magical creatures to color",
    "difficulty": "Difícil"
  },
  {
    "id": 260,
    "day": 260,
    "tematica": "UnicornioJardínCole",
    "prompt_es": "Unicornio jugando con niños en jardín del colegio para colorear solo contornos",
    "prompt_en": "Outline drawing of a unicorn playing with children in school garden to color",
    "difficulty": "Medio"
  },
  {
    "id": 261,
    "day": 261,
    "tematica": "FiestaColeMagica",
    "prompt_es": "Fiesta en colegio con confeti, globos y personajes mágicos para colorear solo contornos",
    "prompt_en": "Outline drawing of a party at school with confetti, balloons and magical characters to color",
    "difficulty": "Fácil"
  },
  {
    "id": 262,
    "day": 262,
    "tematica": "PaseoCreativo",
    "prompt_es": "Niños pintando murales mágicos en patios y jardines del colegio para colorear solo contornos",
    "prompt_en": "Outline drawing of children painting magical murals in schoolyards and gardens to color",
    "difficulty": "Medio"
  },
  {
    "id": 263,
    "day": 263,
    "tematica": "MandalaEstrellas",
    "prompt_es": "Mandala con estrellas, libros y varitas mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with stars, books and magic wands to color",
    "difficulty": "Medio"
  },
  {
    "id": 264,
    "day": 264,
    "tematica": "PatioExploracion",
    "prompt_es": "Niños explorando rincón secreto del colegio con criaturas mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of children exploring secret corner of school with magical creatures to color",
    "difficulty": "Medio"
  },
  {
    "id": 265,
    "day": 265,
    "tematica": "JardinMagico",
    "prompt_es": "Jardín con caminos brillantes, flores mágicas y pequeños unicornios para colorear solo contornos",
    "prompt_en": "Outline drawing of garden with sparkling paths, magical flowers and small unicorns to color",
    "difficulty": "Medio"
  },
  {
    "id": 266,
    "day": 266,
    "tematica": "MandalaCuentos",
    "prompt_es": "Mandala con libros, castillos, dragones y estrellas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with books, castles, dragons and stars to color",
    "difficulty": "Difícil"
  },
  {
    "id": 267,
    "day": 267,
    "tematica": "ArcoirisFantasia",
    "prompt_es": "Niños volando sobre arcoíris con varitas y criaturas mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of children flying over rainbow with wands and magical creatures to color",
    "difficulty": "Medio"
  },
  {
    "id": 268,
    "day": 268,
    "tematica": "PatioCreativo",
    "prompt_es": "Niños jugando y haciendo arte en patio escolar con hadas para colorear solo contornos",
    "prompt_en": "Outline drawing of children playing and doing art in schoolyard with fairies to color",
    "difficulty": "Medio"
  },
  {
    "id": 269,
    "day": 269,
    "tematica": "BosqueEscuela",
    "prompt_es": "Bosque cercano al colegio con criaturas mágicas y niños explorando para colorear solo contornos",
    "prompt_en": "Outline drawing of forest near school with magical creatures and children exploring to color",
    "difficulty": "Medio"
  },
  {
    "id": 270,
    "day": 270,
    "tematica": "MandalaUnicornio2",
    "prompt_es": "Mandala con unicornios, flores y estrellas para colorear solo contornos",
    "prompt_en": "Outline drawing of a mandala with unicorns, flowers and stars to color",
    "difficulty": "Medio"
  },
  {
    "id": 271,
    "day": 271,
    "tematica": "TallerHechiceria",
    "prompt_es": "Niños creando pócimas y hechizos mágicos en aula para colorear solo contornos",
    "prompt_en": "Outline drawing of children making potions and magical spells in classroom to color",
    "difficulty": "Medio"
  },
  {
    "id": 272,
    "day": 272,
    "tematica": "FiestaMagica",
    "prompt_es": "Fiesta con niños y criaturas mágicas en patio escolar con globos y luces para colorear solo contornos",
    "prompt_en": "Outline drawing of a party with children and magical creatures in schoolyard with balloons and lights to color",
    "difficulty": "Fácil"
  },
  {
    "id": 273,
    "day": 273,
    "tematica": "ArcoirisCole2",
    "prompt_es": "Niños y pequeños dragones observando arcoíris sobre el colegio para colorear solo contornos",
    "prompt_en": "Outline drawing of children and small dragons watching rainbow above school to color",
    "difficulty": "Medio"
  },
  {
    "id": 274,
    "day": 274,
    "tematica": "Calabaza",
    "prompt_es": "Dibujo de una calabaza en un bosque con árboles de otoño para colorear solo contornos",
    "prompt_en": "Outline drawing of a pumpkin in a forest with autumn trees to color",
    "difficulty": "Fácil"
  },
  {
    "id": 275,
    "day": 275,
    "tematica": "Murciélago",
    "prompt_es": "Dibujo de un murciélago volando sobre un castillo embrujado para colorear solo contornos",
    "prompt_en": "Outline drawing of a bat flying over a haunted castle to color",
    "difficulty": "Medio"
  },
  {
    "id": 276,
    "day": 276,
    "tematica": "Fantasma",
    "prompt_es": "Dibujo de un fantasma saliendo de una casa embrujada para colorear solo contornos",
    "prompt_en": "Outline drawing of a ghost coming out of a haunted house to color",
    "difficulty": "Difícil"
  },
  {
    "id": 277,
    "day": 277,
    "tematica": "Bruja",
    "prompt_es": "Dibujo de una bruja con su escoba y un caldero burbujeante para colorear solo contornos",
    "prompt_en": "Outline drawing of a witch with her broom and a bubbling cauldron to color",
    "difficulty": "Fácil"
  },
  {
    "id": 278,
    "day": 278,
    "tematica": "Esqueleto",
    "prompt_es": "Dibujo de un esqueleto bailando en un cementerio con lápidas para colorear solo contornos",
    "prompt_en": "Outline drawing of a skeleton dancing in a graveyard with tombstones to color",
    "difficulty": "Medio"
  },
  {
    "id": 279,
    "day": 279,
    "tematica": "Araña",
    "prompt_es": "Dibujo de una araña tejiendo su telaraña en un rincón oscuro para colorear solo contornos",
    "prompt_en": "Outline drawing of a spider weaving its web in a dark corner to color",
    "difficulty": "Difícil"
  },
  {
    "id": 280,
    "day": 280,
    "tematica": "Gato",
    "prompt_es": "Dibujo de un gato negro sobre una valla con luna llena para colorear solo contornos",
    "prompt_en": "Outline drawing of a black cat on a fence with a full moon to color",
    "difficulty": "Fácil"
  },
  {
    "id": 281,
    "day": 281,
    "tematica": "Sombrero",
    "prompt_es": "Dibujo de un sombrero de bruja sobre una mesa con pociones mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of a witch hat on a table with magical potions to color",
    "difficulty": "Medio"
  },
  {
    "id": 282,
    "day": 282,
    "tematica": "Castillo",
    "prompt_es": "Dibujo de un castillo embrujado con murciélagos volando alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a haunted castle with bats flying around to color",
    "difficulty": "Difícil"
  },
  {
    "id": 283,
    "day": 283,
    "tematica": "Zombie",
    "prompt_es": "Dibujo de un zombie saliendo de la tierra en un cementerio para colorear solo contornos",
    "prompt_en": "Outline drawing of a zombie rising from the ground in a graveyard to color",
    "difficulty": "Fácil"
  },
  {
    "id": 284,
    "day": 284,
    "tematica": "Momia",
    "prompt_es": "Dibujo de una momia en un pasillo de pirámide con jeroglíficos para colorear solo contornos",
    "prompt_en": "Outline drawing of a mummy in a pyramid hallway with hieroglyphs to color",
    "difficulty": "Medio"
  },
  {
    "id": 285,
    "day": 285,
    "tematica": "Escoba",
    "prompt_es": "Dibujo de una escoba mágica volando sobre un pueblo en la noche para colorear solo contornos",
    "prompt_en": "Outline drawing of a magic broom flying over a village at night to color",
    "difficulty": "Difícil"
  },
  {
    "id": 286,
    "day": 286,
    "tematica": "Caldero",
    "prompt_es": "Dibujo de un caldero burbujeante rodeado de libros y velas para colorear solo contornos",
    "prompt_en": "Outline drawing of a bubbling cauldron surrounded by books and candles to color",
    "difficulty": "Fácil"
  },
  {
    "id": 287,
    "day": 287,
    "tematica": "Monstruo",
    "prompt_es": "Dibujo de un monstruo escondido detrás de árboles oscuros para colorear solo contornos",
    "prompt_en": "Outline drawing of a monster hiding behind dark trees to color",
    "difficulty": "Medio"
  },
  {
    "id": 288,
    "day": 288,
    "tematica": "Luna",
    "prompt_es": "Dibujo de la luna llena con murciélagos volando para colorear solo contornos",
    "prompt_en": "Outline drawing of the full moon with bats flying to color",
    "difficulty": "Difícil"
  },
  {
    "id": 289,
    "day": 289,
    "tematica": "Cementerio",
    "prompt_es": "Dibujo de un cementerio con fantasmas y lápidas antiguas para colorear solo contornos",
    "prompt_en": "Outline drawing of a graveyard with ghosts and old tombstones to color",
    "difficulty": "Fácil"
  },
  {
    "id": 290,
    "day": 290,
    "tematica": "Velas",
    "prompt_es": "Dibujo de unas velas encendidas sobre un altar con calaveras para colorear solo contornos",
    "prompt_en": "Outline drawing of candles lit on an altar with skulls to color",
    "difficulty": "Medio"
  },
  {
    "id": 291,
    "day": 291,
    "tematica": "Caramelos",
    "prompt_es": "Dibujo de caramelos esparcidos sobre una mesa de Halloween para colorear solo contornos",
    "prompt_en": "Outline drawing of candies scattered on a Halloween table to color",
    "difficulty": "Difícil"
  },
  {
    "id": 292,
    "day": 292,
    "tematica": "Búho",
    "prompt_es": "Dibujo de un búho en un árbol seco con luna de fondo para colorear solo contornos",
    "prompt_en": "Outline drawing of an owl in a bare tree with the moon behind to color",
    "difficulty": "Fácil"
  },
  {
    "id": 293,
    "day": 293,
    "tematica": "Calavera",
    "prompt_es": "Dibujo de una calavera decorada en un altar con flores para colorear solo contornos",
    "prompt_en": "Outline drawing of a decorated skull on an altar with flowers to color",
    "difficulty": "Medio"
  },
  {
    "id": 294,
    "day": 294,
    "tematica": "Bosque",
    "prompt_es": "Dibujo de un bosque oscuro con sombras y ojos brillantes para colorear solo contornos",
    "prompt_en": "Outline drawing of a dark forest with shadows and glowing eyes to color",
    "difficulty": "Difícil"
  },
  {
    "id": 295,
    "day": 295,
    "tematica": "HombreLobo",
    "prompt_es": "Dibujo de un hombre lobo aullando frente a la luna llena para colorear solo contornos",
    "prompt_en": "Outline drawing of a werewolf howling at the full moon to color",
    "difficulty": "Fácil"
  },
  {
    "id": 296,
    "day": 296,
    "tematica": "Casa",
    "prompt_es": "Dibujo de una casa embrujada rodeada de árboles y murciélagos para colorear solo contornos",
    "prompt_en": "Outline drawing of a haunted house surrounded by trees and bats to color",
    "difficulty": "Medio"
  },
  {
    "id": 297,
    "day": 297,
    "tematica": "Ratas",
    "prompt_es": "Dibujo de unas ratas corriendo entre calabazas para colorear solo contornos",
    "prompt_en": "Outline drawing of rats running among pumpkins to color",
    "difficulty": "Difícil"
  },
  {
    "id": 298,
    "day": 298,
    "tematica": "Telaraña",
    "prompt_es": "Dibujo de una telaraña gigante entre ramas de árboles para colorear solo contornos",
    "prompt_en": "Outline drawing of a giant spider web between tree branches to color",
    "difficulty": "Fácil"
  },
  {
    "id": 299,
    "day": 299,
    "tematica": "Espantapájaros",
    "prompt_es": "Dibujo de un espantapájaros en un campo con cuervos para colorear solo contornos",
    "prompt_en": "Outline drawing of a scarecrow in a field with crows to color",
    "difficulty": "Medio"
  },
  {
    "id": 300,
    "day": 300,
    "tematica": "Bebida",
    "prompt_es": "Dibujo de una bebida de poción en un frasco rodeada de ingredientes mágicos para colorear solo contornos",
    "prompt_en": "Outline drawing of a potion drink in a bottle surrounded by magical ingredients to color",
    "difficulty": "Difícil"
  },
  {
    "id": 301,
    "day": 301,
    "tematica": "Máscara",
    "prompt_es": "Dibujo de una máscara de halloween colgada en una puerta embrujada para colorear solo contornos",
    "prompt_en": "Outline drawing of a Halloween mask hanging on a haunted door to color",
    "difficulty": "Fácil"
  },
  {
    "id": 302,
    "day": 302,
    "tematica": "Espíritu",
    "prompt_es": "Dibujo de un espíritu flotando en un bosque misterioso para colorear solo contornos",
    "prompt_en": "Outline drawing of a spirit floating in a mysterious forest to color",
    "difficulty": "Medio"
  },
  {
    "id": 303,
    "day": 303,
    "tematica": "Corazón",
    "prompt_es": "Dibujo de un corazón oscuro rodeado de llamas mágicas para colorear solo contornos",
    "prompt_en": "Outline drawing of a dark heart surrounded by magical flames to color",
    "difficulty": "Difícil"
  },
  {
    "id": 304,
    "day": 304,
    "tematica": "Sombras",
    "prompt_es": "Dibujo de unas sombras misteriosas entre árboles retorcidos para colorear solo contornos",
    "prompt_en": "Outline drawing of mysterious shadows among twisted trees to color",
    "difficulty": "Fácil"
  },
  {
    "id": 305,
    "day": 305,
    "tematica": "Hojas",
    "prompt_es": "Dibujo de hojas de otoño cayendo de los árboles para colorear solo contornos",
    "prompt_en": "Outline drawing of autumn leaves falling from trees to color",
    "difficulty": "Fácil"
  },
  {
    "id": 306,
    "day": 306,
    "tematica": "Bosque",
    "prompt_es": "Dibujo de un bosque otoñal con árboles y hojas caídas para colorear solo contornos",
    "prompt_en": "Outline drawing of an autumn forest with trees and fallen leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 307,
    "day": 307,
    "tematica": "Ardilla",
    "prompt_es": "Dibujo de una ardilla con una bellota en un árbol para colorear solo contornos",
    "prompt_en": "Outline drawing of a squirrel with an acorn in a tree to color",
    "difficulty": "Difícil"
  },
  {
    "id": 308,
    "day": 308,
    "tematica": "Zorro",
    "prompt_es": "Dibujo de un zorro en el bosque con hojas caídas para colorear solo contornos",
    "prompt_en": "Outline drawing of a fox in the forest with fallen leaves to color",
    "difficulty": "Fácil"
  },
  {
    "id": 309,
    "day": 309,
    "tematica": "Cocina",
    "prompt_es": "Dibujo de una cocina rústica con estanterías y ollas para colorear solo contornos",
    "prompt_en": "Outline drawing of a rustic kitchen with shelves and pots to color",
    "difficulty": "Medio"
  },
  {
    "id": 310,
    "day": 310,
    "tematica": "TazaTé",
    "prompt_es": "Dibujo de una taza de té cozy sobre una mesa con galletas para colorear solo contornos",
    "prompt_en": "Outline drawing of a cozy tea cup on a table with cookies to color",
    "difficulty": "Fácil"
  },
  {
    "id": 311,
    "day": 311,
    "tematica": "Setas",
    "prompt_es": "Dibujo de setas en el bosque con hojas alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of mushrooms in the forest with leaves around to color",
    "difficulty": "Medio"
  },
  {
    "id": 312,
    "day": 312,
    "tematica": "Castañas",
    "prompt_es": "Dibujo de castañas sobre una mesa rústica para colorear solo contornos",
    "prompt_en": "Outline drawing of chestnuts on a rustic table to color",
    "difficulty": "Fácil"
  },
  {
    "id": 313,
    "day": 313,
    "tematica": "Fogata",
    "prompt_es": "Dibujo de una fogata en el campo con personas alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a campfire in the countryside with people around to color",
    "difficulty": "Difícil"
  },
  {
    "id": 314,
    "day": 314,
    "tematica": "Lago",
    "prompt_es": "Dibujo de un lago rodeado de árboles de otoño para colorear solo contornos",
    "prompt_en": "Outline drawing of a lake surrounded by autumn trees to color",
    "difficulty": "Medio"
  },
  {
    "id": 315,
    "day": 315,
    "tematica": "Montaña",
    "prompt_es": "Dibujo de montañas con un sendero y árboles otoñales para colorear solo contornos",
    "prompt_en": "Outline drawing of mountains with a path and autumn trees to color",
    "difficulty": "Difícil"
  },
  {
    "id": 316,
    "day": 316,
    "tematica": "Granja",
    "prompt_es": "Dibujo de una granja con animales para colorear solo contornos",
    "prompt_en": "Outline drawing of a farm with animals to color",
    "difficulty": "Medio"
  },
  {
    "id": 317,
    "day": 317,
    "tematica": "Gallinas",
    "prompt_es": "Dibujo de gallinas picoteando en el corral para colorear solo contornos",
    "prompt_en": "Outline drawing of hens pecking in the coop to color",
    "difficulty": "Fácil"
  },
  {
    "id": 318,
    "day": 318,
    "tematica": "Caballo",
    "prompt_es": "Dibujo de un caballo en el campo con hojas de otoño para colorear solo contornos",
    "prompt_en": "Outline drawing of a horse in the field with autumn leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 319,
    "day": 319,
    "tematica": "Campo",
    "prompt_es": "Dibujo de un campo con cultivos y árboles para colorear solo contornos",
    "prompt_en": "Outline drawing of a field with crops and trees to color",
    "difficulty": "Difícil"
  },
  {
    "id": 320,
    "day": 320,
    "tematica": "Frutas",
    "prompt_es": "Dibujo de frutas otoñales en una cesta para colorear solo contornos",
    "prompt_en": "Outline drawing of autumn fruits in a basket to color",
    "difficulty": "Fácil"
  },
  {
    "id": 321,
    "day": 321,
    "tematica": "Verduras",
    "prompt_es": "Dibujo de verduras frescas en un mercado rural para colorear solo contornos",
    "prompt_en": "Outline drawing of fresh vegetables in a rural market to color",
    "difficulty": "Medio"
  },
  {
    "id": 322,
    "day": 322,
    "tematica": "CasaRural",
    "prompt_es": "Dibujo de una casa rural con chimenea y árboles para colorear solo contornos",
    "prompt_en": "Outline drawing of a rural house with chimney and trees to color",
    "difficulty": "Fácil"
  },
  {
    "id": 323,
    "day": 323,
    "tematica": "Camino",
    "prompt_es": "Dibujo de un camino cubierto de hojas de otoño para colorear solo contornos",
    "prompt_en": "Outline drawing of a path covered with autumn leaves to color",
    "difficulty": "Medio"
  },
  {
    "id": 324,
    "day": 324,
    "tematica": "Pájaros",
    "prompt_es": "Dibujo de pájaros migrando en el cielo otoñal para colorear solo contornos",
    "prompt_en": "Outline drawing of birds migrating in the autumn sky to color",
    "difficulty": "Difícil"
  },
  {
    "id": 325,
    "day": 325,
    "tematica": "Nido",
    "prompt_es": "Dibujo de un nido con huevos en un árbol para colorear solo contornos",
    "prompt_en": "Outline drawing of a nest with eggs in a tree to color",
    "difficulty": "Fácil"
  },
  {
    "id": 326,
    "day": 326,
    "tematica": "Conejo",
    "prompt_es": "Dibujo de un conejo en el campo para colorear solo contornos",
    "prompt_en": "Outline drawing of a rabbit in the field to color",
    "difficulty": "Medio"
  },
  {
    "id": 327,
    "day": 327,
    "tematica": "NiñosJugando",
    "prompt_es": "Dibujo de niños jugando con hojas de otoño en un parque para colorear solo contornos",
    "prompt_en": "Outline drawing of children playing with autumn leaves in a park to color",
    "difficulty": "Fácil"
  },
  {
    "id": 328,
    "day": 328,
    "tematica": "Escuela",
    "prompt_es": "Dibujo de una escuela rural con árboles alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a rural school with trees around to color",
    "difficulty": "Medio"
  },
  {
    "id": 329,
    "day": 329,
    "tematica": "Familia",
    "prompt_es": "Dibujo de una madre con sus hijos caminando por el bosque para colorear solo contornos",
    "prompt_en": "Outline drawing of a mother with her children walking through the forest to color",
    "difficulty": "Difícil"
  },
  {
    "id": 330,
    "day": 330,
    "tematica": "Comida",
    "prompt_es": "Dibujo de comida otoñal en una mesa para colorear solo contornos",
    "prompt_en": "Outline drawing of autumn food on a table to color",
    "difficulty": "Fácil"
  },
  {
    "id": 331,
    "day": 331,
    "tematica": "Mercado",
    "prompt_es": "Dibujo de un mercado al aire libre con frutas y verduras para colorear solo contornos",
    "prompt_en": "Outline drawing of an outdoor market with fruits and vegetables to color",
    "difficulty": "Medio"
  },
  {
    "id": 332,
    "day": 332,
    "tematica": "Bicicleta",
    "prompt_es": "Dibujo de una bicicleta apoyada en un árbol otoñal para colorear solo contornos",
    "prompt_en": "Outline drawing of a bicycle leaning on an autumn tree to color",
    "difficulty": "Fácil"
  },
  {
    "id": 333,
    "day": 333,
    "tematica": "Princesa",
    "prompt_es": "Dibujo de una princesa con un vestido elegante en un jardín para colorear solo contornos",
    "prompt_en": "Outline drawing of a princess with an elegant dress in a garden to color",
    "difficulty": "Difícil"
  },
  {
    "id": 334,
    "day": 334,
    "tematica": "Lluvia",
    "prompt_es": "Dibujo de lluvia cayendo sobre un paisaje otoñal para colorear solo contornos",
    "prompt_en": "Outline drawing of rain falling on an autumn landscape to color",
    "difficulty": "Medio"
  },
  {
    "id": 335,
    "day": 335,
    "tematica": "ÁrbolNavidad",
    "prompt_es": "Dibujo de un árbol de Navidad decorado con luces y adornos para colorear solo contornos",
    "prompt_en": "Outline drawing of a Christmas tree decorated with lights and ornaments to color",
    "difficulty": "Fácil"
  },
  {
    "id": 336,
    "day": 336,
    "tematica": "Regalos",
    "prompt_es": "Dibujo de regalos apilados junto al árbol de Navidad para colorear solo contornos",
    "prompt_en": "Outline drawing of presents stacked next to a Christmas tree to color",
    "difficulty": "Medio"
  },
  {
    "id": 337,
    "day": 337,
    "tematica": "MuñecoNieve",
    "prompt_es": "Dibujo de un muñeco de nieve con bufanda y gorro en el jardín para colorear solo contornos",
    "prompt_en": "Outline drawing of a snowman with scarf and hat in the garden to color",
    "difficulty": "Fácil"
  },
  {
    "id": 338,
    "day": 338,
    "tematica": "Santa",
    "prompt_es": "Dibujo de Santa Claus con su saco de regalos frente a la chimenea para colorear solo contornos",
    "prompt_en": "Outline drawing of Santa Claus with his sack of gifts in front of the fireplace to color",
    "difficulty": "Medio"
  },
  {
    "id": 339,
    "day": 339,
    "tematica": "Renos",
    "prompt_es": "Dibujo de renos tirando del trineo de Santa sobre la nieve para colorear solo contornos",
    "prompt_en": "Outline drawing of reindeer pulling Santa's sleigh over the snow to color",
    "difficulty": "Difícil"
  },
  {
    "id": 340,
    "day": 340,
    "tematica": "CasaNevada",
    "prompt_es": "Dibujo de una casa cubierta de nieve con luces navideñas para colorear solo contornos",
    "prompt_en": "Outline drawing of a snowy house with Christmas lights to color",
    "difficulty": "Medio"
  },
  {
    "id": 341,
    "day": 341,
    "tematica": "Villancicos",
    "prompt_es": "Dibujo de niños cantando villancicos frente a una casa para colorear solo contornos",
    "prompt_en": "Outline drawing of children singing Christmas carols in front of a house to color",
    "difficulty": "Fácil"
  },
  {
    "id": 342,
    "day": 342,
    "tematica": "Galletas",
    "prompt_es": "Dibujo de galletas navideñas en una bandeja para colorear solo contornos",
    "prompt_en": "Outline drawing of Christmas cookies on a tray to color",
    "difficulty": "Fácil"
  },
  {
    "id": 343,
    "day": 343,
    "tematica": "Calcetines",
    "prompt_es": "Dibujo de calcetines navideños colgados de la chimenea para colorear solo contornos",
    "prompt_en": "Outline drawing of Christmas stockings hanging from the fireplace to color",
    "difficulty": "Medio"
  },
  {
    "id": 344,
    "day": 344,
    "tematica": "CoposNieve",
    "prompt_es": "Dibujo de copos de nieve cayendo sobre un paisaje invernal para colorear solo contornos",
    "prompt_en": "Outline drawing of snowflakes falling over a winter landscape to color",
    "difficulty": "Fácil"
  },
  {
    "id": 345,
    "day": 345,
    "tematica": "Trineo",
    "prompt_es": "Dibujo de un trineo sobre la nieve con regalos para colorear solo contornos",
    "prompt_en": "Outline drawing of a sled on the snow with presents to color",
    "difficulty": "Medio"
  },
  {
    "id": 346,
    "day": 346,
    "tematica": "Supermercado",
    "prompt_es": "Dibujo de personas comprando regalos y comida navideña en un supermercado para colorear solo contornos",
    "prompt_en": "Outline drawing of people shopping for Christmas gifts and food in a supermarket to color",
    "difficulty": "Difícil"
  },
  {
    "id": 347,
    "day": 347,
    "tematica": "PajarosInvierno",
    "prompt_es": "Dibujo de pájaros en ramas con nieve para colorear solo contornos",
    "prompt_en": "Outline drawing of birds on snowy branches to color",
    "difficulty": "Fácil"
  },
  {
    "id": 348,
    "day": 348,
    "tematica": "NieveJugando",
    "prompt_es": "Dibujo de niños jugando en la nieve con trineos y bolas de nieve para colorear solo contornos",
    "prompt_en": "Outline drawing of children playing in the snow with sleds and snowballs to color",
    "difficulty": "Medio"
  },
  {
    "id": 349,
    "day": 349,
    "tematica": "MuñecaNavidad",
    "prompt_es": "Dibujo de una muñeca vestida con ropa navideña para colorear solo contornos",
    "prompt_en": "Outline drawing of a doll wearing Christmas clothes to color",
    "difficulty": "Fácil"
  },
  {
    "id": 350,
    "day": 350,
    "tematica": "CoronaNavidad",
    "prompt_es": "Dibujo de una corona navideña colgada en la puerta para colorear solo contornos",
    "prompt_en": "Outline drawing of a Christmas wreath hanging on the door to color",
    "difficulty": "Medio"
  },
  {
    "id": 351,
    "day": 351,
    "tematica": "Ciervo",
    "prompt_es": "Dibujo de un ciervo en el bosque nevado para colorear solo contornos",
    "prompt_en": "Outline drawing of a deer in the snowy forest to color",
    "difficulty": "Medio"
  },
  {
    "id": 352,
    "day": 352,
    "tematica": "ChocolateCaliente",
    "prompt_es": "Dibujo de una taza de chocolate caliente con malvaviscos para colorear solo contornos",
    "prompt_en": "Outline drawing of a cup of hot chocolate with marshmallows to color",
    "difficulty": "Fácil"
  },
  {
    "id": 353,
    "day": 353,
    "tematica": "BastonDulce",
    "prompt_es": "Dibujo de bastones de caramelo navideños en un frasco para colorear solo contornos",
    "prompt_en": "Outline drawing of candy canes in a jar to color",
    "difficulty": "Fácil"
  },
  {
    "id": 354,
    "day": 354,
    "tematica": "CartaSanta",
    "prompt_es": "Dibujo de un niño escribiendo su carta a Santa Claus para colorear solo contornos",
    "prompt_en": "Outline drawing of a child writing a letter to Santa Claus to color",
    "difficulty": "Medio"
  },
  {
    "id": 355,
    "day": 355,
    "tematica": "NocheBuena",
    "prompt_es": "Dibujo de una familia reunida cenando en Nochebuena para colorear solo contornos",
    "prompt_en": "Outline drawing of a family gathered for Christmas Eve dinner to color",
    "difficulty": "Difícil"
  },
  {
    "id": 356,
    "day": 356,
    "tematica": "Chimenea",
    "prompt_es": "Dibujo de una chimenea encendida con adornos y regalos alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a fireplace with decorations and gifts around to color",
    "difficulty": "Medio"
  },
  {
    "id": 357,
    "day": 357,
    "tematica": "VillancicoPareja",
    "prompt_es": "Dibujo de una pareja cantando villancicos frente a un árbol para colorear solo contornos",
    "prompt_en": "Outline drawing of a couple singing carols in front of a Christmas tree to color",
    "difficulty": "Fácil"
  },
  {
    "id": 358,
    "day": 358,
    "tematica": "PapáInvierno",
    "prompt_es": "Dibujo de un hombre abrigado caminando por la nieve con bufanda y gorro para colorear solo contornos",
    "prompt_en": "Outline drawing of a man walking through the snow wearing scarf and hat to color",
    "difficulty": "Medio"
  },
  {
    "id": 359,
    "day": 359,
    "tematica": "RegalosParque",
    "prompt_es": "Dibujo de niños entregando regalos en el parque para colorear solo contornos",
    "prompt_en": "Outline drawing of children giving gifts in the park to color",
    "difficulty": "Fácil"
  },
  {
    "id": 360,
    "day": 360,
    "tematica": "FinAño",
    "prompt_es": "Dibujo de una fiesta de fin de año con confeti y globos para colorear solo contornos",
    "prompt_en": "Outline drawing of a New Year's Eve party with confetti and balloons to color",
    "difficulty": "Difícil"
  },
  {
    "id": 361,
    "day": 361,
    "tematica": "RelojMedianoche",
    "prompt_es": "Dibujo de un reloj marcando la medianoche con fuegos artificiales alrededor para colorear solo contornos",
    "prompt_en": "Outline drawing of a clock striking midnight with fireworks around to color",
    "difficulty": "Difícil"
  },
  {
    "id": 362,
    "day": 362,
    "tematica": "Brindis",
    "prompt_es": "Dibujo de personas brindando con copas para celebrar el año nuevo para colorear solo contornos",
    "prompt_en": "Outline drawing of people toasting with glasses to celebrate the New Year to color",
    "difficulty": "Medio"
  },
  {
    "id": 363,
    "day": 363,
    "tematica": "FuegosArtificiales",
    "prompt_es": "Dibujo de fuegos artificiales en el cielo nocturno para colorear solo contornos",
    "prompt_en": "Outline drawing of fireworks in the night sky to color",
    "difficulty": "Fácil"
  },
  {
    "id": 364,
    "day": 364,
    "tematica": "Calendario",
    "prompt_es": "Dibujo de un calendario de diciembre con fechas señaladas de fiestas para colorear solo contornos",
    "prompt_en": "Outline drawing of a December calendar with holiday dates marked to color",
    "difficulty": "Medio"
  }
];