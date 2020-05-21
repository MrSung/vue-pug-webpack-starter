import Vue from 'vue';
import '../../scss/pc/sample_pc.scss';
import App from '../../vue/sample/App.vue';

new Vue({
  render: (h) => h(App),
}).$mount('#app');

// eslint-disable-next-line no-console
document.body.insertAdjacentHTML('beforeend', 'sample pc text from JS file');
