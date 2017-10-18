// Setup
var 	express 			= require('express'),
	app 				= express(),
	port				= 3000,
	mongoose 			= require('mongoose'),
	bodyParser 		= require("body-parser"),
	methodOverride		= require('method-override'),
	expressSanitizer	= require('express-sanitizer');

// App Config
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));	
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// Mongoose/MongoDB Setup
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/restful_blog",{useMongoClient: true});

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Fill DB with sample data
// Blog.create({
// 	title: "Test Blog",
// 	image: "http://via.placeholder.com/350x150",
// 	body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in iaculis purus, et auctor ligula. Sed in fermentum tortor. Integer nec lacus erat. Donec arcu ex, consectetur sit amet lectus luctus, aliquam mollis massa."
// });

// -----------------------------------------------------------------
// RESTful Routes
// -----------------------------------------------------------------

// INDEX - Show all blogs
app.get('/', function(req, res){
	res.redirect('/blogs');
});

app.get('/blogs', function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else {
			res.render('index', {blogs: blogs});
		}
	});
});

// NEW - New Blog Form
app.get('/blogs/new', function(req, res){
	res.render('new');
});

// CREATE - Create a new blog
app.post('/blogs', function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			console.log(err);
			res.render('new');
		} else {
			res.redirect('/blogs');
		}
	});	
});

// SHOW - Show a single blog
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

// EDIT - Show form to Update a blog
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE - Update blog
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id)
		}
	});
});

// DELETE - Delete a blog
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});



// Start Express Server
app.listen(port, function(){
	console.log('Server is running on Port: ',port);
});