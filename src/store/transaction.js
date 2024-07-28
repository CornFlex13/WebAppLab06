import { defineStore } from "pinia";
import { call, db } from "@/firebase"
import { collection, query, where, onSnapshot, QuerySnapshot} from "firebase/firestore";

export const useTransactionStore = defineStore({
  id: "transaction",
  state: () => {
    return {
      transactions : [],
      loading : false
    }
  },
  actions: {
    async fetchTransaction(){
      this.loading = true
      const q = query(collection(db, "transaction"));
      const unSubscribe = onSnapshot(q, (querySnapshot) => {
        this.transactions = []
        querySnapshot.forEach((doc) => {
          this.transactions.push(doc.data())
        });
      });
      this.loading = false
    },
    async addTransaction(transaction) {
      //generate id
      transaction.id = Math.random().toString(36).substr(2, 9)
      // created date
      transaction.created = new Date()
      this.transactions.push(transaction)
      // call cloud function
      let res = await call("billTable",{name : transaction.table});
      if(!res.success){
        console.lof("error adding transaction")
      }
    }
  }
});
