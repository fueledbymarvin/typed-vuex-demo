import { Getters, Mutations, Actions, Module } from "vuex-smart-module";
import { wrap, register, unregister } from ".";
import { create, FooState, FooWrapper } from "./foo";

export class FooByIdState {
  [key: string]: FooState;
}

class FooByIdActions extends Actions<
  FooByIdState,
  Getters<FooByIdState>,
  Mutations<FooByIdState>
> {
  registerFoo(payload: { id: string }) {
    register(create(), ["fooById", payload.id]);
  }
  unregisterFoo(payload: { id: string }) {
    unregister(["fooById", payload.id]);
  }
}

export default {
  ...wrap(new Module({ state: FooByIdState, actions: FooByIdActions })),
  modules: {} as {
    [key: string]: FooWrapper;
  },
};
