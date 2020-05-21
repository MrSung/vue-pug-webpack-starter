import Vue from 'vue';
import '../../scss/sp/sample_sp.scss';
import App from '../../vue/sample/App.vue';

new Vue({
  render: (h) => h(App),
}).$mount('#app');

// eslint-disable-next-line no-console
document.body.insertAdjacentHTML('beforeend', 'sample sp text from JS file');
