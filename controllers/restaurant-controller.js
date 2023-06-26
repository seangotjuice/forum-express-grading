const { Restaurant, Category } = require("../models");
const { getOffset, getPagination } = require("../helpers/pagination-helper");

const restaurantController = {
  getRestaurants: (req, res) => {
    const DEFAULT_LIMIT = 9;
    const categoryId = Number(req.query.categoryId) || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || DEFAULT_LIMIT;
    const offset = getOffset(limit, page);

    return Promise.all([
      Restaurant.findAndCountAll({
        // 修改這裡
        include: Category,
        where: {
          ...(categoryId ? { categoryId } : {}),
        },
        limit,
        offset,
        nest: true,
        raw: true,
      }),
      Category.findAll({ raw: true }),
    ]).then(([restaurants, categories]) => {
      const data = restaurants.rows.map((r) => ({
        // 修改這裡，加上 .rows
        ...r,
        description: r.description.substring(0, 50),
      }));
      return res.render("restaurants", {
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count), // 修改這裡，把 pagination 資料傳回樣板
      });
    });
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
    })
      .then((restaurant) => {
        if (!restaurant) {
          throw new Error("Restaurant didn't exist in detail!");
        }
        return restaurant.increment("viewCounts", { by: 1 });
      })
      .then((restaurant) => {
        return res.render("restaurant", { restaurant: restaurant.toJSON() });
      })
      .catch((err) => next(err));
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true,
    })
      .then((restaurant) => {
        if (!restaurant) {
          throw new Error("Restaurant didn't exist in dashboard!");
        }
        return res.render("dashboard", {
          restaurant,
        });
      })
      .catch((err) => next(err));
  },
};
module.exports = restaurantController;
