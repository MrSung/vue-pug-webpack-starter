import Vue from 'vue';
import '../scss/sample.scss';
import App from '../vue/sample/App.vue';

new Vue({
  render: (h) => h(App),
}).$mount('#app');

// eslint-disable-next-line no-console
document.body.insertAdjacentHTML('beforeend', 'sample text from JS file');
