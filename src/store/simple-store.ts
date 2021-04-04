/*
 *Simple store
 */

import {
  createStore,
  MutationTree,
  ActionContext,
  ActionTree,
  GetterTree,
  Store,
  CommitOptions,
  DispatchOptions,
  createLogger,
} from 'vuex';

// Declare state type
export type State = {
  counter: number;
};

// Set state
const state: State = {
  counter: 0,
};

// Declare mutations enums
export enum MutationTypes {
  INC_COUNTER = 'INC_COUNTER',
}
// Declare actions enums
export enum ActionTypes {
  INC_COUNTER = 'INC_COUNTER',
}

// Declare mutations types
export type Mutations<S = State> = {
  [MutationTypes.INC_COUNTER](state: S, payload: number): void;
};

// Define mutations
const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.INC_COUNTER](state: State, payload: number): void {
    state.counter += payload;
  },
};

// Declare actions types
type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

// Declare actions interface
export interface Actions {
  [ActionTypes.INC_COUNTER](
    { commit }: AugmentedActionContext,
    payload: number
  ): void;
}

// Define actions
export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.INC_COUNTER](
    { commit }: AugmentedActionContext,
    payload: number
  ): void {
    commit(MutationTypes.INC_COUNTER, payload);
  },
};

// Declare getters types
export type Getters = {
  getCounter(state: State): number;
};

// Define getters
export const getters: GetterTree<State, State> & Getters = {
  getCounter: (state: State) => state.counter,
};

// Declare store type
export type RootStore<S = State> = Omit<
  Store<S>,
  'getters' | 'commit' | 'dispatch'
> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
};

// Define store
export const store: RootStore<State> = createStore({
  state,
  mutations,
  actions,
  getters,
  plugins: [createLogger()],
  modules: {
    cart: {
      namespaced: true,
      state: {
        count: 0,
      },
      mutations: {
        increment(state) {
          state.count++;
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
    },
  },
});

export function useRootStore(): RootStore<State> {
  return store as RootStore;
}

/*
export default createStore({
  state,
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
  modules: {},
});
*/
