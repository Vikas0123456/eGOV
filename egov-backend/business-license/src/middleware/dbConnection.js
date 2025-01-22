const {
  createSequelizeInstance,
  allModelAndAssociate,
} = require("../config/config");
const { default: axios } = require("axios");

const dbConnection = async (req, res, next) => {
  try {
    const { slug } = req.body?.data;
    let getService;
    try {
      getService = await axios.post(
        `${process.env.SERVICEMANAGEMENT}/service/getById`,
        {
          data: {
            slug: slug,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
    if (getService.data) {
      await createSequelizeInstance(getService.data.data.databaseName).then(
        async (res) => {
          req.service = getService.data.data;
          req.sequelize = res;
          await allModelAndAssociate(req);
        }
      );
      next();
    } else {      
      return res.status(404).json({
        message: "Invalid request",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong! Please try again later." });
  }
};

module.exports = { dbConnection };
