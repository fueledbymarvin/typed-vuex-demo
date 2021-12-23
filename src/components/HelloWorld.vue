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
import vx from "@/store";

export default Vue.extend({
  name: "HelloWorld",
  data() {
    return {
      id: 0,
    };
  },
  computed: {
    // typechecker knows what strings are possible here but trying to map a
    // nested item directly from the root context does not work with the type
    // checker, e.g., it won't recognize "nested/greeting"
    ...vx.modules.nested.mapper.mapGetters(["greeting"]),
    foos() {
      return Object.entries(vx.context.state.fooById).map(([k, v]) => [
        k,
        v.count,
      ]);
    },
  },
  methods: {
    ...vx.modules.fooById.mapper.mapActions(["registerFoo", "unregisterFoo"]),
    register() {
      this.id = this.id + 1;
      this.registerFoo({ id: this.id.toString() });
    },
    increment(id: string) {
      // accessing dynamically registered nested modules doesn't work since
      // vuex-smart-module doesn't know about them during initialization so we
      // have to use the special object we created
      vx.modules.fooById.modules[id].context.mutations.increment(1);
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
