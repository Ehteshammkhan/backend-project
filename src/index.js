import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!!", err);
  });

// Express global error handler middleware (recommended way)
app.use((err, req, res, next) => {
  console.error("Express error occurred:", err);
  res.status(500).send("Internal Server Error");
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
