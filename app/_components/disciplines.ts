export interface Discipline {
  name: string;
  image: string;
  alt?: string;
  imageClassName?: string;
  phone?: string;
}

export const DISCIPLINES: Discipline[] = [
  {
    name: "Arquería",
    image: "/club/arqueria.jpg",
    alt: "Mujer practicando arquería al aire libre",
    imageClassName: "photo-cover--archery",
    phone: "341 661 6556",
  },
  {
    name: "Entrenamiento funcional",
    image: "/club/entrenamiento-funcional.jpg",
    alt: "Elementos de entrenamiento funcional en el salón del club",
    imageClassName: "photo-cover--functional",
    phone: "341 336 4815",
  },
  {
    name: "Wing Chun",
    image: "/club/wing-chun-recortado.jpg",
    alt: "Practicante de Wing Chun en postura de defensa",
    imageClassName: "photo-cover--wing-chun",
    phone: "341 336 4815",
  },
  {
    name: "Pádel",
    image: "/club/padel.jpg",
    alt: "Jugador de pádel preparando el saque en la cancha del club",
    imageClassName: "photo-cover--padel",
    phone: "341 337 7790",
  },
  {
    name: "Patín artístico",
    image: "/club/patin-artistico.jpg",
    alt: "Patines artísticos dispuestos en círculo",
    imageClassName: "photo-cover--skating",
    phone: "341 224 4593",
  },
  {
    name: "Patín competitivo",
    image: "/club/patin-competitivo.jpg",
    alt: "Patinadora de patín competitivo durante una presentación",
    imageClassName: "photo-cover--skating",
    phone: "341 224 4593",
  },
  {
    name: "Pelota paleta",
    image: "/club/pelota-paleta.jpg",
    alt: "Jugadores de pelota paleta posando en el frontón del club",
    imageClassName: "photo-cover--pelota-paleta",
    phone: "341 645 0496",
  },
  {
    name: "Taekwondo",
    image: "/club/taekwondo-recortado.jpg",
    alt: "Dos competidores de taekwondo durante un combate",
    phone: "341 623 7696",
  },
  {
    name: "Sóftbol",
    image: "/club/softbol.jpg",
    alt: "Bateador de sóftbol conectando un lanzamiento durante un entrenamiento",
    phone: "341 353 1655",
  },
  {
    name: "Ultimate Frisbee",
    image: "/club/ultimate.jpg",
    alt: "Jugadores de ultimate disputando el disco en una cancha de césped",
    phone: "11 2254 5969",
  },
  {
    name: "Grupo Scout",
    image: "/club/scouts-ronda.webp",
    alt: "Grupo Scout Domingo Matheu reunido en ronda en el predio",
    phone: "341 769 0001",
  },
  {
    name: "Vóley",
    image: "/club/voley.jpg",
    alt: "Jugadoras de vóley entrenando en la cancha al aire libre del club",
    imageClassName: "photo-cover--volleyball",
    phone: "341 600 1397",
  },
  {
    name: "Hockey",
    image: "/club/hockey-entrenamiento.jpg",
    alt: "Jugadoras de hockey entrenando de noche en el predio",
    imageClassName: "photo-cover--hockey",
    phone: "341 746 1974",
  },
];
