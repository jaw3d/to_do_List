

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDb");

const itemsSchema = {
  name:  String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

Item.find({}, function(err, foundItems){

  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully saved default items to DB.");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", { ListTittle: "Today", newListItems: foundItems});
  }

});

});

app.get("/:customListName", function(req, res){
  const customListName =  req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
          const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //Show an existing list
        res.render("list", { ListTittle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;                                                                 

    const item = new Item({
      name: itemName
    });

    item.save();
    res.redirect("/");
});

  app.post("/delete", function(req, res){
      const checkedItemId = req.body.checkbox;

      Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
          console.log("Successfully deleted Item.");
          res.redirect("/");
        }
      });
  });

app.get("/work", function(req, res){
  res.render("list", {ListTittle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(5000, function(){
  console.log("Server started on port 5000");
});
