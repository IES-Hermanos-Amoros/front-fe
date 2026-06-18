import { create } from 'zustand';
import { sendRequest } from '../utils/functions'; // Asegúrate de importar tu utilidad

const mockData = {
  conveniosPorCurso: {
    labels: ['21/22', '22/23', '23/24', '24/25', '25/26'],
    data: [80, 110, 95, 130, 154]
  },
  fctPorCurso: {
    labels: ['21/22', '22/23', '23/24', '24/25', '25/26'],
    data: [120, 150, 140, 190, 210]
  },
  tecnologiasDemandadas: [
    { value: 40, name: 'React' },
    { value: 30, name: 'Node.js' },
    { value: 20, name: 'Python' },
    { value: 10, name: 'Java' }
  ],
  habilidadesAlumnos: [
    { value: 35, name: 'Trabajo Equipo' },
    { value: 25, name: 'Resolución Problemas' },
    { value: 20, name: 'Adaptabilidad' },
    { value: 20, name: 'Comunicación' }
  ],
  alumnadoPorLocalidad: [
    { value: 45, name: 'Villena' },
    { value: 25, name: 'Almansa' },
    { value: 18, name: 'Yecla' },
    { value: 12, name: 'Biar' },
    { value: 10, name: 'Caudete' },
    { value: 8, name: 'Alicante' },
    { value: 5, name: 'Elche' }
  ]
};

export const useStatsStore = create((set, get) => ({ // Añadimos 'get' para acceder a otras funciones
  stats: {
    conveniosPorCurso: { labels: [], data: [] },
    fctPorCurso: { labels: [], data: [] },
    tecnologiasDemandadas: [],
    habilidadesAlumnos: [],
    alumnadoPorLocalidad: []
  },
  isLoadingStats: false,
  error: null,

  // Función para cargar el Mock
  fetchMock: async () => {
    set({ isLoadingStats: true });
    // Simulamos latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ stats: mockData, isLoadingStats: false, error: null });
    console.log("⚠️ Trabajando con datos Mock");
  },

  // Función principal
  fetchStats: async () => {
    set({ isLoadingStats: true, error: null });

    try {
      const res = await sendRequest("GET", null, "/stats",false,"",false);
      
      // Validamos que la respuesta sea exitosa y tenga datos
      if (res && res.success && res.data) {
        set({ stats: res.data, isLoadingStats: false });
      } else {
        // Si el servidor responde pero sin datos (o 404), tiramos de mock
        get().fetchMock(); 
      }
    } catch (error) {
      console.error("Error en API, cargando Mock...", error);
      // Si la petición falla (servidor apagado, etc), cargamos mock
      get().fetchMock(); 
    }
  }
}));

/*
  ENDPOINT pendiente /stats
  Ejemplo JSON Devolución:

    {
      "conveniosPorCurso": {
        "labels": ["23/24", "24/25"],
        "data": [95, 130]
      },
      "tecnologiasDemandadas": [
        { "name": "React", "value": 45 },
        { "name": "Node", "value": 30 }
      ],
      "habilidadesAlumnos": [
        { "name": "Liderazgo", "value": 80 },
        { "name": "Inglés", "value": 60 }
      ]
    }

*/