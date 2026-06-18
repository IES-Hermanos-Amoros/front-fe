import { create } from "zustand";
import { sendRequest } from "../utils/functions";

const useCategoryStore = create((set, get) => ({
  categories: [],

  cargarCategorias: async () => {
    if (get().categories.length > 0) return get().categories;

    const res = await sendRequest("GET", null, "/categories");

    if (res.success) {
      const categories = Array.isArray(res.data)
        ? res.data
        : res.data?.categories || [];

      set({ categories });
      return categories;
    }

    return [];
  },

  getCategoryArray: () => get().categories || []
}));

export default useCategoryStore;
