const { Restaurant, Category, User } = require("../models"); // 新增這裡
const { localFileHandler } = require("../helpers/file-helpers"); // 將 file-helper 載進來

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category],
    })

      .then((restaurants) => {
        res.render("admin/restaurants", { restaurants });
      })

      .catch((err) => {
        next(err);
      });
  },
  createRestaurant: (req, res, next) => {
    return Category.findAll({
      raw: true,
    })
      .then((categories) =>
        res.render("admin/create-restaurant", { categories })
      )
      .catch((err) => next(err));
  },

  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } =
      req.body;
    if (!name) throw new Error("Restaurant name is required!");
    // 修改以下
    const { file } = req; // 把檔案取出來，也可以寫成 const file = req.file
    localFileHandler(file) // 把取出的檔案傳給 file-helper 處理後
      .then((filePath) =>
        Restaurant.create({
          // 再 create 這筆餐廳資料
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId,
        })
      )
      .then(() => {
        req.flash("success_messages", "restaurant was successfully created");
        res.redirect("/admin/restaurants");
      })
      .catch((err) => next(err));
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      // 去資料庫用 id 找一筆資料
      raw: true, // 找到以後整理格式再回傳
      nest: true,
      include: [Category],
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!"); //  如果找不到，回傳錯誤訊息，後面不執行
        res.render("admin/restaurant", { restaurant });
      })
      .catch((err) => next(err));
  },
  editRestaurant: (req, res, next) => {
    return Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true }),
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant doesn't exist!");
        res.render("admin/edit-restaurant", { restaurant, categories });
      })
      .catch((err) => next(err));
  },

  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } =
      req.body;
    if (!name) throw new Error("Restaurant name is required!");
    const { file } = req; // 把檔案取出來
    Promise.all([
      // 非同步處理
      Restaurant.findByPk(req.params.id), // 去資料庫查有沒有這間餐廳
      localFileHandler(file), // 把檔案傳到 file-helper 處理
    ])
      .then(([restaurant, filePath]) => {
        // 以上兩樣事都做完以後
        if (!restaurant) throw new Error("Restaurant didn't exist!");
        return restaurant.update({
          // 修改這筆資料
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId,
        });
      })
      .then(() => {
        req.flash("success_messages", "restaurant was successfully to update");
        res.redirect("/admin/restaurants");
      })
      .catch((err) => next(err));
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!");
        return restaurant.destroy();
      })
      .then(() => res.redirect("/admin/restaurants"))
      .catch((err) => next(err));
  },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true,
    })

      .then((users) => res.render("admin/users", { users }))

      .catch((err) => next(err));
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        if (!user) throw new Error("User didn't exist!");
        if (user.email === "root@example.com") {
          req.flash("error_messages", "禁止變更 root 權限");
          res.redirect("back");
        } else {
          req.flash("success_messages", "使用者權限變更成功");
          res.redirect("/admin/users");
          return user.update({ isAdmin: !user.isAdmin });
        }
      })
      .catch((err) => next(err));
  },
};

module.exports = adminController;
