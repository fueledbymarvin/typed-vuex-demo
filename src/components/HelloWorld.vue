<template>
  <div class="hello">
    <div>{{ greeting("Looped") }}</div>
    <button @click="register">Register foo</button>
    <div v-for="[k, v] in foos" :key="k">
      <div>Foo {{ k }}: {{ v }}</div>
      <button @click="increment(k)">Increment</button>
      <button @click="unregisterFoo({ id: k })">Unregister</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { data } from "@/store";

export default Vue.extend({
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      id: 0,
    };
  },
  computed: {
    // typechecker knows what strings are possible here but trying to map a
    // nested item directly from the root context does not work with the type
    // checker, e.g., it won't recognize "nested/greeting"
    ...data.modules.nested.mapper.mapGetters(["greeting"]),
    foos() {
      return Object.entries(data.context.state.foo).map(([k, v]) => [
        k,
        v.count,
      ]);
    },
  },
  methods: {
    ...data.mapper.mapActions(["registerFoo", "unregisterFoo"]),
    register() {
      this.id = this.id + 1;
      this.registerFoo({ id: this.id.toString() });
    },
    increment(id: string) {
      // accessing dynamically registered nested modules doesn't work since
      // vuex-smart-module doesn't know about them during initialization so we
      // have to use the special object we created
      data.modules.foo.modules[id].context.mutations.increment(1);
    },
  },
});
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
