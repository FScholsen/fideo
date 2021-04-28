/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// scss exports (to load exported variables as ES modules)
declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}
