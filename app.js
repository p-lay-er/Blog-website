//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");
require("dotenv").config();
const { auth } = require('express-openid-connect');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

// index.js

app.use(
  auth({
    authRequired:false,
    auth0Logout:true,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    idpLogout: true,
  })
);

const postSchela = {
  title: String,
  content: String
};
const Post = mongoose.model("Post", postSchela);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/admin");
// mongoose.connect("mongodb+srv://lay_000:lay12345@todo.hhtwc.mongodb.net/BlogDB?retryWrites=true&w=majority", { useNewUrlParser: true });

app.get('/',(req, res)=>{
  res.redirect(req.oidc.isAuthenticated()?'/home':'/login');
})

app.get('/login',(req,res)=>{
  res.redirect("/about");
});

app.get("/home", function (req, res) {
  Post.find({}, function (err, foundPosts) {
    if (!err) res.render("home", {
      startingContent: homeStartingContent,
      posts: foundPosts
    });
  })
});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: _.capitalize(req.body.postTitle),
    content: req.body.postBody
  });

  post.save(function (err) {
    if (!err)
      res.redirect("/home");
  });

});

app.get("/posts/:postName", function (req, res) {
  const requestedTitle = _.capitalize(req.params.postName);

  Post.findOne({ title: requestedTitle }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
      id :post._id
    });
  });
});

app.post("/delete",function (req, res){
  const deleteID = req.body.deleteId;
  Post.findByIdAndRemove(deleteID,function(err)
  {
    if(err)
      console.log(err);
    else
      console.log(`Successfully Deleted!!`);
  });
  res.redirect("/home");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server is up and running!!!");
});
