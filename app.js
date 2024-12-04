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
const socketIo = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 3001;

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const app = express();
const server = http.createServer(app); // Create an HTTP server instance
const io = socketIo(server); // Pass the server to socket.io

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
  },
  helpers: {
    eq: function (a, b) {
      return a === b;
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);

// Predefined Q&A object
const predefinedResponses = {
  "What are your store hours?": "We are open from 9 AM to 9 PM, Monday to Saturday.",
  "What is your return policy?": "You can return items within 30 days of purchase for a full refund.",
  "Do you offer gift wrapping?": "Yes, we offer gift wrapping for an additional fee.",
  "Where are you located?": "We are located at 123 Luxe Street, Cityville.",
  "Can I track my order?": "Yes, you can track your order using the tracking link sent to your email.",
};

// Socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user message', (msg) => {
      console.log('User message:', msg);
      let response;

      // Check if the message matches any predefined questions
      if (predefinedResponses[msg]) {
          response = predefinedResponses[msg];
      } else {
          response = "I'm sorry, I don't have an answer for that.";
      }

      // Send the response back to the client
      socket.emit('bot response', response);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});


// Start the server
server.listen(PORT, () => { // Use the server instance here
  console.log('Server is running on port:', PORT);
});

module.exports = { app };
