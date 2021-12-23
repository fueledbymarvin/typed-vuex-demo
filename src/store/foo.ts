import { Getters, Mutations, Actions, Module } from "vuex-smart-module";
import { Wrapper, wrap } from ".";

export class FooState {
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

export type FooWrapper = Wrapper<
  FooState,
  FooGetters,
  FooMutations,
  FooActions
>;

export const create: () => FooWrapper = () =>
  wrap(
    new Module({
      state: FooState,
      getters: FooGetters,
      mutations: FooMutations,
      actions: FooActions,
    })
  );
