import Vue from "vue";
import Vuex from "vuex";
import {
  Getters,
  Mutations,
  Actions,
  Module,
  Context,
  createStore,
  registerModule,
  unregisterModule,
  createMapper,
} from "vuex-smart-module";
import { ComponentMapper } from "vuex-smart-module/lib/mapper";

Vue.use(Vuex);

class FooState {
  count = 1;
}

class FooGetters extends Getters<FooState> {
  get double() {
    return this.state.count * 2;
  }
}

class FooMutations extends Mutations<FooState> {
  increment(payload: number) {
    this.state.count += payload;
  }
}

class FooActions extends Actions<
  FooState,
  FooGetters,
  FooMutations,
  FooActions
> {
  incrementAsync(payload: { amount: number; interval: number }) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.mutations.increment(payload.amount);
        resolve();
      }, payload.interval);
    });
  }
}

class FooByIdState {
  [key: string]: FooState;
}

const fooById = new Module({ state: FooByIdState });

class NestedState {
  value = "hello";
}

class NestedGetters extends Getters<NestedState> {
  greeting(name: string): string {
    // You don't get access to root getters so you have to use the special
    // object to access it directly
    return this.state.value + ", " + name + data.context.state.punctuation;
  }
}

export const nested = new Module({
  state: NestedState,
  getters: NestedGetters,
});

class RootState {
  punctuation = "!";
  // Need to declare nested state so the typechecker will know about it
  // (doesn't get automatically added when passing in the nested modules when
  // creating a new module)
  nested!: NestedState;
  foo!: FooByIdState;
}

class RootGetters extends Getters<RootState> {}

class RootMutations extends Mutations<RootState> {}

class RootActions extends Actions<
  RootState,
  RootGetters,
  RootMutations,
  RootActions
> {
  registerFoo(payload: { id: string }) {
    if (data.modules.foo.modules[payload.id]) return;
    const module = new Module({
      state: FooState,
      getters: FooGetters,
      mutations: FooMutations,
      actions: FooActions,
    });
    registerModule(store, ["foo", payload.id], `foo/${payload.id}`, module);
    data.modules.foo.modules[payload.id] = {
      module,
      mapper: createMapper(module),
      context: module.context(store),
    };
  }
  unregisterFoo(payload: { id: string }) {
    if (!data.modules.foo.modules[payload.id]) return;
    unregisterModule(store, data.modules.foo.modules[payload.id].module);
    Reflect.deleteProperty(data.modules.foo.modules, payload.id);
  }
}

const root = new Module({
  modules: {
    nested,
    foo: fooById,
  },
  state: RootState,
  getters: RootGetters,
  mutations: RootMutations,
  actions: RootActions,
});

const store = createStore(root);

// We need to be able to get access to the module instance if we want to use
// them in our components. Usually you would just access the `modules` property
// on the root context, but it doesn't know about dynamically registered ones.
// To get around that, we use this special object that explicitly sets the type
// for the modules that may be dynamically registered in the future. This object
// also just sets up the mapper and context for convenience when importing into
// components. If we want to keep this structure, we can wrap `registerModule`
// and `unregisterModule` to auto-build this object.
export const data = {
  module: root,
  // mapper allows you to use `mapGetters`, etc., in your components
  mapper: createMapper(root),
  // context gives you direct access to the module
  context: root.context(store),
  modules: {
    nested: {
      module: nested,
      mapper: createMapper(nested),
      context: nested.context(store),
    },
    foo: {
      module: fooById,
      mapper: createMapper(fooById),
      context: fooById.context(store),
      modules: {} as {
        [key: string]: {
          module: Module<FooState, FooGetters, FooMutations, FooActions>;
          mapper: ComponentMapper<
            FooState,
            FooGetters,
            FooMutations,
            FooActions
          >;
          context: Context<
            Module<FooState, FooGetters, FooMutations, FooActions>
          >;
        };
      },
    },
  },
};

export default store;
