const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();
const methodOverride = require('method-override');
const MongoDbStore = require('connect-mongodb-session')(session);
const db = require('./config/dbConfig'); // Import the mongoose connection
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 3001;

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const app = express();

app.use(methodOverride('_method'));

// Initialize MongoDbStore with existing mongoose connection
const store = new MongoDbStore({
  collection: 'sessions',
  connection: db // Use the mongoose connection
});

app.use(session({
  secret: 'ash',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 * 24 },
  store: store // Use the initialized store
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.errorMessage = req.flash('error');
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views', 'layout'),
  partialsDir: path.join(__dirname, 'views', 'partial'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.post('/checkout', (req, res) => {
  console.log("bbhjbhjbjhbhjb",req.body);  // This should log all form data if working correctly
  res.send('Form submitted');
});

 
app.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
});


module.exports = {app};
