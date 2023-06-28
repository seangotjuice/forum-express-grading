const express = require("express");
const router = express.Router();
const admin = require("./modules/admin");
const restController = require("../controllers/restaurant-controller");
const userController = require("../controllers/user-controller");
const { authenticated, authenticatedAdmin } = require("../middleware/auth");
const commentController = require("../controllers/comment-controller");
const { generalErrorHandler } = require("../middleware/error-handler");
const passport = require("../config/passport");

router.use("/admin", admin);
router.get("/signup", userController.signUpPage);
router.post("/signup", userController.signUp);
router.get("/signin", userController.signInPage);
router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/signin",
    failureFlash: true,
  }),
  userController.signIn
);
router.get("/logout", userController.logout);

router.get("/restaurants/feeds", authenticated, restController.getFeeds);
router.get(
  "/restaurants/:id/dashboard",
  authenticated,
  restController.getDashboard
);
router.get("/restaurants/:id", authenticated, restController.getRestaurant);
router.get("/restaurants", authenticated, restController.getRestaurants);

router.get("/", (req, res) => res.redirect("/restaurants"));
router.use("/", generalErrorHandler);
router.delete(
  "/comments/:id",
  authenticatedAdmin,
  commentController.deleteComment
);
router.post("/comments", authenticated, commentController.postComment);
router.post(
  "/favorite/:restaurantId",
  authenticated,
  userController.addFavorite
);
router.delete(
  "/favorite/:restaurantId",
  authenticated,
  userController.removeFavorite
);

module.exports = router;
