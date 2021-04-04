import { createLogger, createStore } from 'vuex';

export default createStore({
  state: {
    counter: 0,
  },
  mutations: {
    increment(state) {
      state.counter++;
    },
  },
  actions: {
    increment({ commit }) {
      commit('increment');
    },
  },
  getters: {
    counter: (state) => {
      return state.counter;
    },
  },
  plugins: [createLogger()],
  modules: {
    calls: {
      namespaced: true,
      state: {
        registered: true,
      },
      mutations: {
        setRegistered(state, payload) {
          state.registered = payload;
        },
      },
      actions: {
        register({ commit }) {
          commit('setRegistered', true);
        },
        unregister({ commit }) {
          commit('setRegistered', false);
        },
      },
      getters: {
        isRegistered: (state) => {
          return state.registered;
        },
      },
    },
  },
});
