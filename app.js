//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const date = require(__dirname + "/date.js"); // require local module//
// console.log(date);

let item = ["Buy Food", "Buy Caffe"];
let workItems = [];
let url = "";

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// use ejs as view engine
app.set("view engine", "ejs");

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
  let day = date.getDate();
  res.render("list", {
    listTitle: day,
    newListItem: item,
    url: "/"
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
  item.push(req.body.newItem);
  console.log(req.body.newItem);
  res.redirect("/"); // Redirect to home reoute.
});

app.get("/work", function(req, res){
  res.render("list",{
    listTitle: "Work list",
    newListItem: workItems,
    url: "/work" // test //
  });
});

app.post("/work", function(req, res) {
    workItems.push(req.body.newItem);
    res.redirect("/work");
});

app.get("/about", function(req, res){
  res.render("about")
});

app.listen(3000, function() {
  console.log("Server running on 3000");
});
