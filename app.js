const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require("mongoose");
const _ = require("lodash");
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// var items = ['Buy Food', 'Cook Food', 'Eat Food'];
var workItems = [];

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
const uri = "mongodb+srv://eiji-adm:test123@cluster0.eqs4a.mongodb.net/?retryWrites=true&w=majority";
// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://eiji-adm:test123@cluster0.eqs4a.mongodb.net/?retryWrites=true&w=majority");


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("todolistDB").collection("devices");
  // perform actions on the collection object

  const itemSchema = {
    name: {
      type: String,
      required: true
    }

  }

  const Item = mongoose.model("Item", itemSchema);

  const item1 = new Item({
    name: "Welcome to the todolist"

  })
  const item2 = new Item({
    name: "Click the + button to add an item"

  })
  const item3 = new Item({
    name: "<-- Click there to cross out and delete this item"

  })

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemSchema]
  };

  const List = mongoose.model("List", listSchema);

  // Home route

  app.get('/', function(req, res) {
    let day = "Today";

    Item.find({}, function(err, foundItems) {
      if (foundItems.length == 0) {
        // Inserting items on the database

        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Added all the data to your DB");
          }
        })
        res.redirect('/');
      } else {


        res.render('list', {
          pageTitle: day,
          newListItems: foundItems
        });

      }
    })


  })


  app.get('/:listName', function(req, res) {

    const listName =_.capitalize (req.params.listName);

    List.findOne({name: listName}, function(err, foundList) {
      if (!err) {

        if (!foundList) {
          // Create a new list

          const list = new List({
            name: listName,
            items: defaultItems

          })
          list.save();
          // Waiting for the list element to be added
          setTimeout(() => {res.redirect("/"+ listName);},1000);

        } else {
          // show existing list
          res.render("list", {
            pageTitle: foundList.name,
            newListItems: foundList.items
          })
        }

      } else {
        // console.log(err);
      }

    })



    // res.render('list', {
      //   pageTitle: req.params.listName + 'List',
      //   newListItems: workItems
      // });

    })

    app.get('/about', function(req, res) {

      res.render('about');
    })



    app.post('/', function(req, res) {


      const itemName = req.body.newItem;
      const listName = req.body.list;

      const item = new Item({
        name: itemName

      });

      if(listName == "Today"){


        item.save();
        res.redirect('/');
      } else {
        List.findOne({name:listName}, function(err, foundList){

          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        })

      }



    })


    app.post('/work', function(req, res) {
      let item = req.body.newItem;
      res.redirect('/work');
    })

    app.post('/delete', function(req, res) {

      const checked = req.body.checkbox;
      const listName = req.body.listName;

      if(listName == "Today"){


        Item.findByIdAndRemove(checked, function(err) {
          if (err) {

          } else {
            console.log("Succesfully deleted the item");
            res.redirect('/');
          }
        });
      } else{

        List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checked}}}, function(err, foundList){
          if(!err){
            res.redirect("/" + listName);
          }
        });
      }

    })

    // puxar tudo antes disso para fora
  client.close();
});


// Listen to port may need to be edited for a server

app.listen(3000, function(req, res) {

  console.log('Server started on port 3000');
})
