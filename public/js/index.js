const vm = new Vue({
  el: "#app",
  data: {
    name: "",
    cost: "",
    quantity: "",
    items: [],
    isLoggedIn: false
  },
  computed: {
    total: function() {
      return this.items.reduce(
        (accumulator, currentValue) => accumulator + currentValue.subTotal,
        0
      );
    }
  },
  methods: {
    toggleLoggedIn: function() {
      this.isLoggedIn = !this.isLoggedIn;
    },
    onSubmit: function(event) {
      if (this.name == "" && this.cost == "" && this.quantity == "") {
        hoodie.store.withIdPrefix("item").add({
          name: this.name,
          cost: this.cost,
          quantity: this.quantity,
          subTotal: this.cost * this.quantity
        });

        this.name = "";
        this.cost = "";
        this.quantity = "";

        const snackbarContainer = document.querySelector("#toast");
        snackbarContainer.MaterialSnackbar.showSnackbar({
          message: "Item successfully added"
        });
      } else {
        const snackbarContainer = document.querySelector("#toast");
        snackbarContainer.MaterialSnackbar.showSnackbar({
          message: "An error occured. See details"
        });
      }//end_if
    },

    deleteRow: function(itemId) {
      hoodie.store.withIdPrefix("item").remove(itemId);
    },

    saveList: function() {
      hoodie.store
        .withIdPrefix("item")
        .findAll()
        .then(items => {
          //store the list
          hoodie.store.withIdPrefix("list").add({
            cost: this.total,
            items: items
          });

          //delete the items
          hoodie.store
            .withIdPrefix("item")
            .remove(items)
            .then(() => {
            //clear the table
            this.items = [];

            //notify the user
            var snackbarContainer = document.querySelector("#toast");
            snackbarContainer.MaterialSnackbar.showSnackbar({
                message: "List saved successfully"
            });
            })
            .catch(function(error) {
            //notify the user
            var snackbarContainer = document.querySelector("#toast");
            snackbarContainer.MaterialSnackbar.showSnackbar({
                message: error.message
            });
            });
        });
    }
  }, 
  created: function() {
    hoodie.store.withIdPrefix("item").on(
      "add",
      item => vm.items.push(item)
    );
    hoodie.store.withIdPrefix("item").on(
      "remove",
      deletedItem =>
        (vm.items = vm.items.filter(item => item._id !== deletedItem._id))
    );

    //retrieve items on the current list
    console.log("Retreiving items...");
    hoodie.store
      .withIdPrefix("item")
      .findAll()
      .then(items => (vm.items = items));

    hoodie.account.get("session").then(
      function(session) {
        // user is signed in
        vm.isLoggedIn = true;

        if (!session) {
          // user is singed out
          vm.isLoggedIn = false;
        } else if (session.invalid) {
          vm.isLoggedIn = false;
        } else {
          // user is signed in
          vm.isLoggedIn = true;
        }
      });
  }
});