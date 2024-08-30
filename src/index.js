import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is runing at port: ${process.env.PORT}`);
    });
    // Global error handling for Express app
    app.on("error", (error) => {
      console.log("Express error occurred:", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection faild !!!", err);
  });

/*
// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, World!"); // You can send any response here
});

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODBURL}/${DB_NAME}`);
    app.on("error", () => {
      console.log(
        "Database is connected maybe its express issue on any other problem",
        error
      );
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port, ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
})();
*/
