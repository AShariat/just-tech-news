const express = require("express");
const routes = require("./controllers/");
const sequelize = require("./config/connection");
const path = require("path");
const helpers = require("./utils/helpers");

const app = express();
const PORT = process.env.PORT || 3001;

// This code sets up an Express.js session and connects the session to our Sequelize database. As you may be able to guess, "Super secret secret" should be replaced by an actual secret and stored in the .env file.
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sess = {
  secret: "Super secret secret",
  // All we need to do to tell our session to use cookies is to set cookie to be {}. If we wanted to set additional options on the cookie, like a maximum age, we would add the options to that object.
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};
app.use(session(sess));

// Set up Handlebars.js as my app's template engine of choice.
const exphbs = require("express-handlebars");
const hbs = exphbs.create({ helpers });
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// The express.static() method is a built-in Express.js middleware function that can take all of the contents of a folder and serve them as static assets. This is useful for front-end specific files like images, style sheets, and JavaScript files.
app.use(express.static(path.join(__dirname, "public")));

// turn on routes. Since we set up the routes the way we did, we don't have to worry about importing multiple files for different endpoints. The router instance in routes/index.js collected everything for us and packaged them up for server.js to use.
app.use(routes);

// turn on connection to db and server. We use the sequelize.sync() method to establish the connection to the database. The "sync" part means that this is Sequelize taking the models and connecting them to associated database tables. If it doesn't find a table, it'll create it for you! The other thing to notice is the use of {force: false} in the .sync() method. This doesn't have to be included, but if it were set to true, it would drop and re-create all of the database tables on startup. This is great for when we make changes to the Sequelize models, as the database would need a way to understand that something has changed. This definition performs similarly to DROP TABLE IF EXISTS, which was used previously. This allows the table to be overwritten and re-created. By forcing the sync method to true, we will make the tables re-create if there are any association changes.
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Now listening"));
});
