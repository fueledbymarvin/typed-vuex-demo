import Vue from "vue";
import Vuex from "vuex";
import {
  Getters,
  Mutations,
  Actions,
  Module,
  Context,
  createStore,
  createMapper,
  registerModule,
  unregisterModule,
} from "vuex-smart-module";
import { ComponentMapper } from "vuex-smart-module/lib/mapper";
import get from "lodash/get";
import set from "lodash/set";
import unset from "lodash/unset";
import fooById, { FooByIdState } from "./fooById";
import nested, { NestedState } from "./nested";

Vue.use(Vuex);

export interface Wrapper<
  S,
  G extends Getters<S>,
  M extends Mutations<S>,
  A extends Actions<S, G, M>
> {
  module: Module<S, G, M, A>;
  mapper: ComponentMapper<S, G, M, A>;
  context: Context<Module<S, G, M, A>>;
}

export function wrap<
  S,
  G extends Getters<S>,
  M extends Mutations<S>,
  A extends Actions<S, G, M>
>(module: Module<S, G, M, A>): Wrapper<S, G, M, A> {
  return {
    module,
    mapper: createMapper(module),
    context: module.context(store),
  };
}

export function register<
  S,
  G extends Getters<S>,
  M extends Mutations<S>,
  A extends Actions<S, G, M>
>(wrapper: Wrapper<S, G, M, A>, path: string[]): void {
  const vxPath = path.flatMap((s) => ["modules", s]);
  if (get(vx, vxPath)) return;
  set(
    vx,
    path.flatMap((s) => ["modules", s]),
    wrapper
  );
  registerModule(store, path, path.join("/"), wrapper.module);
}

export function unregister(path: string[]): void {
  const vxPath = path.flatMap((s) => ["modules", s]);
  if (!get(vx, vxPath)) return;
  unregisterModule(store, get(vx, vxPath).module);
  unset(vx, vxPath);
}

class RootState {
  punctuation = "!";
  // Need to declare nested state so the typechecker will know about it
  // (doesn't get automatically added when passing in the nested modules when
  // creating a new module)
  nested!: NestedState;
  fooById!: FooByIdState;
}

const module = new Module({
  modules: {
    nested: nested.module,
    fooById: fooById.module,
  },
  state: RootState,
});

export const store = createStore(module);

// We need to be able to get access to the module instance if we want to use
// them in our components. Usually you would just access the `modules` property
// on the root context, but it doesn't know about dynamically registered ones.
// To get around that, we use this special object that explicitly sets the type
// for the modules that may be dynamically registered in the future. This object
// also just sets up the mapper and context for convenience when importing into
// components. If we want to keep this structure, we can wrap `registerModule`
// and `unregisterModule` to auto-build this object.
const vx = {
  module,
  mapper: createMapper(module),
  context: module.context(store),
  modules: {
    nested,
    fooById,
  },
};

export default vx;
