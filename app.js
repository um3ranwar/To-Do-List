const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose');
const { Schema } = mongoose;


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://um3ranwar:Unity11@cluster0.xdklxlf.mongodb.net/todolistDB', {useNewUrlParser : true});

const itemsSchema = new Schema({
  name:  String
});

const listSchema = new Schema({
  name:  String,
  items :[itemsSchema]
});
const List = mongoose.model('List', listSchema);
const Item = mongoose.model('Item', itemsSchema);
const item1 = new Item({
  name:"Welcome to your ToDo List!"});
const item2 = new Item({
  name:"Hit the + button to add new item."});
const item3 = new Item({
  name:"<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {

Item.find({} ,function(err, foundItems){
  if (foundItems.length === 0) {
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Successfully saved default items to database.");
      }
      res.redirect("/");
    });
  }else{
    res.render("list", {

      kindofday: "Today",
      newListitems: foundItems,

    });
    };
});
});
app.get("/:paramas" , function(req , res){
const customListName = _.capitalize(req.params.paramas);
List.findOne({name : customListName } , function(err , foundList){
  if (!err) {
    if (!foundList) {
      const list = new List({
      name: customListName,
      items : defaultItems
      });
      list.save();
      res.redirect("/" + customListName)
    }

  else {
    res.render("list" ,  {

      kindofday: foundList.name,
      newListitems: foundList.items,

    })
  }
}
});

});
app.post("/", function(req, res) {
  var itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
if (listName === "Today") {
  item.save();
  res.redirect("/");
} else{
List.findOne({name: listName} , function(err , foundList){
foundList.items.push(item);
foundList.save();
res.redirect("/" + listName);
});

}


});

app.post("/delete" ,function(req ,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.deleteOne({_id:checkedItem} , function(err){
      if (!err) {
        console.log("Successfully Removed Item");
        res.redirect("/");
      }
  });
}else
{
List.findOneAndUpdate({name : listName },{$pull :{items: {_id : checkedItem}}}, function(err , foundList){
if (!err) {
  res.redirect("/" + listName);
}

});
}
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {

  console.log("server is ready at heroku");
});
