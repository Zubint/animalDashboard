var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var app = express();

app.use(express.static(__dirname+"/static"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views", __dirname+"/views");

//connect to the database

mongoose.connect("mongodb://localhost/animalDash");
mongoose.connection.on('error', function(err){console.log(err)});

//create the schema --> ERD 'diagram'

var animalSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  created_on: Date,
  updated_on: Date
});

//set validation rules

animalSchema.path('name').required(true, "You must include an animal name");
animalSchema.path('type').required(true, "You must include an animal type");
animalSchema.path('description').required(true, "You must include an animal description");
//created on and updated on are internal items so no validation is required.

//create the table - equivalent of running the SQL forward engineer to build the 'table'
mongoose.model("Animal", animalSchema);
var Animal = mongoose.model('Animal');

var errorsArray=[];

app.get("/", function(req, res){

  //after you add an animal, you can see all the animals here;
  // console.log(animal);
  Animal.find({}, function(err, animal){
    if(err){
      console.log(err);
    }else {
      {
        res.render("index", {allAnimals:animal});
      }
    }
  })
})

app.get("/animal/edit/:id", function(req, res){

  //load the view with the id passed in through the ur

  Animal.find({_id:req.params.id}, function(err, animalToEdit){

    if (err){
      errorsArray =[];
      for(var idx in err){
        errorsArray.push(err.errors[idx].message)
        console.log(errorsArray);
      }
    }else{
      console.log(animalToEdit);
      res.render("edit", {animalToEdit:animalToEdit});
    }
  })
  console.log(req.params.id);
})

app.get("/animal/new", function(req, res){
  res.render("new", {errorsArray:errorsArray});
})

app.post("/animal", function(req, res){

  // console.log(req.body); we have lift off!

  //add this to the database using the model

    var animal = new Animal({
      name: req.body.name.trim(),
      type: req.body.type.trim(),
      description: req.body.description.trim(),
      created_on: Date("YYYY-MM-DDTHH:MM:SS"),
      created_on: Date("YYYY-MM-DDTHH:MM:SS"),

    })

    animal.save(function(err){
      if(err){
        errorsArray=[];  //must clear this array, otherwise you'll keep carying errors forward.
        for (var idx in err.errors){
          errorsArray.push(err.errors[idx].message)
        }
        console.log(errorsArray);
        res.redirect("/animal/new");  //go back to the add form and show the errors
      }else {
        res.redirect("/");   //go home and show all the animals.
      }
    })
})

app.post("/animal/:id", function(req, res){
  Animal.update({_id:req.params.id},
    {name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    updated_on: Date("YYYY-MM-DDTHH:MM:SS")},
    function(err, user){
      if(err){
        console.log(err);
      }else {
        res.redirect("/");
      }
    })
  })

  app.post("/animal/delete/:id", function(req, res){
    Animal.remove({_id:req.params.id}, function(err){
      if(err){
        console.log(err)
      }else {
        res.redirect("/");
      }
    })
  })


app.listen(8000, function(){
  console.log("Server listening on port 8000");
})
