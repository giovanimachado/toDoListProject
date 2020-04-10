//jshint esversion:6

//To connect to mongoDB atlas to mongodb Sheel:
// Choose mongo Shell VErsion 3.4 or earlier
// mongo "mongodb://cluster0-shard-00-00-6dtk5.mongodb.net:27017,cluster0-shard-00-01-6dtk5.mongodb.net:27017,cluster0-shard-00-02-6dtk5.mongodb.net:27017/test?replicaSet=Cluster0-shard-0" --ssl --authenticationDatabase admin  --username admin-giovani --password <password>

//To connect with application
// Choose Driver Node;JS and Version 2.014 or earlier
//mongodb://admin-giovani:<password>@cluster0-shard-00-00-6dtk5.mongodb.net:27017,cluster0-shard-00-01-6dtk5.mongodb.net:27017,cluster0-shard-00-02-6dtk5.mongodb.net:27017/<colletcionName>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

// Use body Parser to receive forms inputs values
app.use(bodyParser.urlencoded({
  extended: true
}));

// Make public folder available
app.use(express.static("public"));

// Conect to MongoDB
mongoose.connect("mongodb://admin-giovani:Test123@cluster0-shard-00-00-6dtk5.mongodb.net:27017,cluster0-shard-00-01-6dtk5.mongodb.net:27017,cluster0-shard-00-02-6dtk5.mongodb.net:27017/todolistDB?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// use ejs as view engine
app.set("view engine", "ejs");

// Create the document's schema
const itemsSchema = {
  item: String
};

//Create a mongoose model based on the schema
//Mongoose model is usually Capitalized
const Item = mongoose.model("Item", itemsSchema);

//Create standard documents
const item1 = new Item({
  item: "Welcome to your todolist!"
});
const item2 = new Item({
  item: "Hit the + button to add new item."
});
const item3 = new Item({
  item: "<-- Hit this to delete and item"
});

// Create an array of items
const defaultItems = [item1, item2, item3];

// Create Custom list Schema
const listSchema = {
  name: String,
  items : [itemsSchema]
};

// Create a mongoose model to the custom lists
const List = mongoose.model("List", listSchema);

// Receive get request on root route
app.get("/", function(req, res) {
  Item.find({}, function(err, results) {
    if (err) {
      console.log("Found error");
    } else {
      if (results.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Success");
          }
        });
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItem: results,
          url: "/"
        });
      }
    }
  });
});

// Receive post request on root rout
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    item: itemName
  });
  item.save();
  console.log(req.body.newItem);
  res.redirect("/"); // Redirect to home route.
});

// Receive post request do delete list items
app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log("Logs from delete route:");
  console.log(checkItemId);
  console.log(listName);

  if (listName === "Today"){
    Item.findByIdAndRemove(checkItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Item " + checkItemId +" removed" );
      }
    });
    res.redirect("/");
  } else {
    // Find an ID inside an array in a document
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkItemId}}},
      function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Item: " + checkItemId +
          " from list: "+ listName + " removed" );
        }
      });
    res.redirect("/"+listName);
  }
  console.log("End of logs from delete route: \n" );
});

// Custom list name using Express Route Parameters
app.get("/:pageName", function(req, res){
  const customListName = _.capitalize(req.params.pageName);
  console.log("Get request to: "+customListName);
  List.findOne({name: customListName}, function(err, result){
    if (!err){
      if (!result){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else{
        // render an existing listTitle
        // const route = ("/"+req.params.pageName);
        const url = ("/"+customListName);
        res.render("list", {
          listTitle: result.name,
          newListItem: result.items,
          url: url
        });
      }
    }
  });
  // list.save();
});

app.post("/:pageName", function(req, res) {
  // Receive the value of the button name equals to list
  listName = req.body.list;
  itemFilled = _.capitalize(req.body.newItem);
  // req.params.pageName is equal to the "pageName"
  console.log("Post request in list: " +
    req.params.pageName + ", to add new item: " + itemFilled +"\n");

  const newCustomItem = new Item({
    item: itemFilled
  });

  List.findOne({name: listName}, function(err, searchResult){
    if (err){
      console.log("Erro na busca");
    } else {
      // console.log(searchResult);
      // newCustomItem needs to be an Item type
      searchResult.items.push(newCustomItem);
      searchResult.save();
      console.log("Success");
      // res.redirect("/" + req.params.pageName); // Works too!
      res.redirect("/" + listName);
    }
  });
});

app.listen(3000, function() {
  console.log("Server running on 3000");
});
