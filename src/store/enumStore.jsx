import { create } from "zustand";
import { sendRequest } from "../utils/functions";

const useEnumStore = create((set, get) => ({
  enums: {},  

  cargarEnums: async () => {
    // Si ya tenemos enums, no volvemos a llamar al servidor
    if (Object.keys(get().enums).length > 0) return;

    const res = await sendRequest("GET",null, "/enums");

    console.log("Respuesta de enums:", res);
    
    if (res.success) {
      set({ enums: res.data }); 
    }
  },

  //helper para obtener un array específico de un enumerado por su nombre
  getEnumArray: (name) => {
    const enums = get().enums;
    return enums[name] || []; 
  }
}))

export default useEnumStore;


