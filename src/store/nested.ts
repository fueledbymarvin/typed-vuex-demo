import { Getters, Module } from "vuex-smart-module";
import vx, { wrap } from ".";

export class NestedState {
  value = "hello";
}

class NestedGetters extends Getters<NestedState> {
  greeting(name: string): string {
    // You don't get access to root getters so you have to use the special
    // object to access it directly
    return this.state.value + ", " + name + vx.context.state.punctuation;
  }
}

export default wrap(
  new Module({
    state: NestedState,
    getters: NestedGetters,
  })
);
