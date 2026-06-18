import { create } from "zustand";
import { sendRequest } from "../utils/functions";

const useSkillStore = create((set, get) => ({
  skills: [],
  loadingSkills: false,
  skillsLoaded: false,

  cargarSkills: async () => {
    if (get().skillsLoaded || get().loadingSkills) {
      return get().skills;
    }

    set({ loadingSkills: true });

    const res = await sendRequest("GET", null, "/skills");

    if (res.success) {
      const skills = Array.isArray(res.data) ? res.data : [];

      set({
        skills,
        loadingSkills: false,
        skillsLoaded: true,
      });

      return skills;
    }

    set({ loadingSkills: false });
    return [];
  },

  getSkillArray: () => get().skills,
  findSkillById: (id) => get().skills.find(skill => skill._id === id) || null,
}));

export default useSkillStore;
