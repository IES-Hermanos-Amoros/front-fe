import { create } from 'zustand'

const useTableStore = create((set, get) => ({

  /* =========================
     STATE
  ========================= */

  tables: {},


  /* =========================
     SET STATE DE UNA TABLA
  ========================= */

  setTableState: (tableId, newState) =>

    set((state) => ({

      tables: {

        ...state.tables,

        [tableId]: {

          ...state.tables[tableId],

          ...newState,

        },

      },

    })),



  /* =========================
     GET STATE DE UNA TABLA
  ========================= */

  getTableState: (tableId) => {

    const tables = get().tables

    return tables[tableId] || {}

  },



  /* =========================
     RESET UNA TABLA
  ========================= */

  resetTableState: (tableId) =>

    set((state) => {

      const newTables = { ...state.tables }

      delete newTables[tableId]

      return {

        tables: newTables,

      }

    }),



  /* =========================
     RESET TODAS LAS TABLAS
  ========================= */

  resetAllTables: () =>

    set({

      tables: {},

    }),



}))

export default useTableStore