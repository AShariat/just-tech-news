const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

// create our Post model
class Post extends Model {
  // Here, we're using JavaScript's built-in static keyword to indicate that the upvote method is one that's based on the Post model and not an instance method like we used earlier with the User model.
  static upvote(body, models) {
    return models.Vote.create({
      user_id: body.user_id,
      post_id: body.post_id,
    }).then(() => {
      return Post.findOne({
        where: {
          id: body.post_id,
        },
        attributes: [
          "id",
          "post_url",
          "title",
          "created_at",
          [
            // Use raw MySQL aggregate function query to get a count of how many votes the post has and return it under the name `vote_count`. Under some circumstances, built-in Sequelize methods can do just that—specifically one called .findAndCountAll(). Unfortunately, because we're counting an associated table's data and not the post itself, that method won't work here. Instead of trying to predict and build a method for every possible use developers have for SQL databases, Sequelize provides us with a special method called .literal() that allows us to run regular SQL queries from within the Sequelize method-based queries. So when we vote on a post, we'll see that post—and its updated vote total—in the response.
            sequelize.literal(
              "(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)"
            ),
            "vote_count",
          ],
        ],
        include: [
          {
            model: models.Comment,
            attributes: [
              "id",
              "comment_text",
              "post_id",
              "user_id",
              "created_at",
            ],
            include: {
              model: models.User,
              attributes: ["username"],
            },
          },
        ],
      });
    });
  }
}

// create fields/columns for Post model
Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isURL: true,
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "post",
  }
);

module.exports = Post;
