import { call, db } from "@/firebase"
import { collection, query, where, onSnapshot, QuerySnapshot} from "firebase/firestore";

export const useTableStore = defineStore({
  id: "table",
  state: () => {
    return {
      loading: false,
      tables : [
      ]
    }
  },
  actions: {
    async addTable(data){
      this.loading = true
      let res = await call("addTable", data);
      if(res.success){
        this.tables.push(data)
      }
      this.loading = false      
    },
    async fetchTables(){
      this.loading = true
      const q = query(collection(db, "tables"));
      const unSubscribe = onSnapshot(q, (querySnapshot) => {
        this.tables = []
        querySnapshot.forEach((doc) => {
          this.tables.push(doc.data())
        });
      });
      this.loading = false
    },
    async reserveTable(data){
      this.loading = true
      let res = await call("reserveTable", data);
      if(res.success){
        const table = this.tables.find(table => table.name === data.name)
        if(table){
          table.status = "reserved"
        }
      }
      this.loading = false
    },
    async addFood(tablename, food) {
      this.loading = true;
      const table = this.tables.find(table => table.name === tablename)
      if(table){
        const index = table.foods.findIndex(item => item.name === food.name)
        if(index === -1){
          table.foods.push({...food, quantity: food.quantity})
        }else{
          table.foods[index].quantity += food.quantity;
        }
        //calculate total
        table.total = table.foods.reduce((acc, item) => acc + item.price * item.quantity, 0)
        let res = await call("addFood", table);
      }
      this.loading = false;
    },

    async clearTable(tablename) {
      const table = this.tables.find(table => table.name === tablename)
      table.checkin = ""
      table.checkout = ""
      table.total = 0
      table.users = 0
      table.status = "ready"
      table.foods = []
      let res = await call("clearFood", table);
    }
  }
});
