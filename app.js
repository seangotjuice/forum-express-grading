const express = require("express");
const routes = require("./routes");
const handlebars = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("./config/passport");
const app = express();
const port = process.env.PORT || 3000;
const SESSION_SECRET = "secret"; // 新增這行
const { getUser } = require("./helpers/auth-helpers");
const handlebarsHelpers = require("./helpers/handlebars-helpers"); // 引入 handlebars-helpers
const methodOverride = require("method-override"); // 引入套件 method-override
const path = require("path"); // 引入 path 套件

app.engine("hbs", handlebars({ extname: ".hbs", helpers: handlebarsHelpers }));
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true })); // 加入這行
app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
);
app.use(passport.initialize()); // 增加這行，初始化 Passport
app.use(passport.session()); // 增加這行，啟動 session 功能
app.use(flash()); // 掛載套件
app.use(methodOverride("_method"));
app.use("/upload", express.static(path.join(__dirname, "upload"))); // 新增這裡

app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success_messages"); // 設定 success_msg 訊息
  res.locals.error_messages = req.flash("error_messages"); // 設定 warning_msg 訊息
  res.locals.user = getUser(req); // 增加這行
  next();
});
app.use(routes);

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`);
});

module.exports = app;
