//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

// Use
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
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

//Creating a document
const item1 = new Item({
  item: "Welcome to your todolist!"
});

const item2 = new Item({
  item: "Hit the + button to add new item."
});

const item3 = new Item({
  item: "<-- Hit this to delete and item"
});

const defaultItems = [item1, item2, item3];

// Create Custom list Schema
const listSchema = {
  name: String,
  items : [itemsSchema]
};

// Create
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  // res.send("Hello");

  // let options = {
  //   weekday: 'long',
  //   // year: 'numeric',
  //   month: 'long',
  //   day: 'numeric'
  // };
  //
  // let today = new Date();
  //
  // // console.log(today.toLocaleDateString("en-US")); // 9/17/2016
  // day = today.toLocaleDateString("en-US", options); // Saturday, September 17, 2016
  // let day = date.getDate(); // Simplify the code

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

// app.post("/", function(req, res) {
//   console.log(req.body);
//   // req.body.list returns the value of <%= listTitle %> from the button
//   // "name"=list
//   if (req.body.list === "Work"){
//     workItems.push(req.body.newItem);
//     res.redirect("/work");
//   } else {
//     item.push(req.body.newItem);
//     console.log(req.body.newItem);
//     res.redirect("/"); // Redirect to home reoute.
//   }
// });

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    item: itemName
  });
  item.save();
  console.log(req.body.newItem);
  res.redirect("/"); // Redirect to home reoute.
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
  console.log(customListName);
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
        console.log("Created new list");
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
  console.log("Page: " + req.params.pageName + ", Input Value: " + req.body.newItem);
  console.log("List Name: " + req.body.list);

  const newCustomItem = new Item({
    item: req.body.newItem
  });

  List.findOne({name: req.body.list}, function(err, searchResult){
    if (err){
      console.log("Erro na busca");
    } else {
      console.log(searchResult);
      searchResult.items.push(newCustomItem);
      searchResult.save();
      console.log("Sucesso");
      res.redirect("/" + req.params.pageName);
    }
  });
});

// app.get("/about", function(req, res) {
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server running on 3000");
});
