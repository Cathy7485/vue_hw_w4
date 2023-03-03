
import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.45/vue.esm-browser.min.js";
import pagination from "./pagination.js"; //引入分頁

let productModal = {};
let delProductModal = {};
// vue
const app = createApp({
  //資料
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2/",
      apiPath: "kc777",
      products: [],
      tempProduct: {
        imagesUrl: [],
      },
      isNew: false, //判斷是編輯還是新增
      page:{}//儲值分頁資料 
    }
  },
  //方法集合
  methods: {
    checkAdmin() {
      const url = `${this.apiUrl}api/user/check`;
      axios.post(url)
        .then(() => {
          this.getProducts();
        })
        .catch(() => {
          alert('您無權限進入！');
          window.location = 'login.html';
        })
    },
    getProducts(page = 1) { //預設頁數是1
      const url = `${this.apiUrl}api/${this.apiPath}/admin/products/?page=${page}`;
      axios.get(url)
        .then((res) => {
          this.products = res.data.products;
          this.page = res.data.pagination;
        })
        .catch((error) => {
          alert(error.data.message);
        })
    },
    openModal(status, product) {
      if (status === 'add') {
        productModal.show();
        this.isNew = true; //是新增
        //帶入初始化資料
        this.tempProduct = {
          imagesUrl: [],
        };
      } else if (status === 'edit') {
        productModal.show();
        this.isNew = false; //不是新增
        //會帶入當前要編輯的資料
        this.tempProduct = { ...product }; //要展開才不會沒儲存就資料連動
      } else if(status === 'del'){
        delProductModal.show();
        this.tempProduct = { ...product }; // 等等要取id使用
      }
    },
    updateProduct(){
      let url = `${this.apiUrl}api/${this.apiPath}/admin/product`;
      //用this.isNew 判斷API要怎麼運行
      let method = 'post';
      //如果不是新增，把路徑跟方法改成編輯
      if(!this.isNew){
        url = `${this.apiUrl}api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
        method = 'put';
      }
      axios[method](url, {data: this.tempProduct})
      .then(()=>{
        this.getProducts(); //新增完重新取得產品資料
        productModal.hide();//新增完關閉視窗
      })
      .catch(error=>{
        alert(error.data.message);
      }) 
    },
    deleteProduct(){
      const url = `${this.apiUrl}api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
      axios.delete(url)
        .then(() => {
          this.getProducts(); //重新取得產品資料
          delProductModal.hide(); //關閉視窗
          alert('刪除成功！');
        })
        .catch(error => {
          alert(error.data.message);
        }) 
    }
  },
  //區域元件
  components: {
    pagination,
  },
  //生命週期
  mounted() {
    // 取得Token
    const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('hexToken='))//test2要改成hexToken
    ?.split('=')[1];
    axios.defaults.headers.common['Authorization'] = token; // defaults = 每次都把token夾帶到headers裡
    this.checkAdmin();

    productModal = new bootstrap.Modal("#productModal");
    delProductModal = new bootstrap.Modal('#delProductModal');
  },
});


app.component('product-modal',{
  props: ['tempProduct','updateProduct'],
  template: '#product-modal-template',
});

app.mount("#app");