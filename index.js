const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //form-encoding

//Serving frontend from public
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
	res.json({
		status: "ok",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	});
});

const postsRouter = require("./src/posts.routes");
app.use("/api/posts", postsRouter);

// // 404 Error
// app.use("/api", (req, res) => {
// 	res.status(400).json({
// 		error: "Not Found",
// 	});
// });

// app.use((err, req, res, next) => {
// 	console.error("[ERROR]", err);
// 	res.status(err.status || 500).json({
// 		error: err.message || "Internal Server Error",
// 	});
// });

app.listen(PORT, () => {
	console.log(`✅ Server running at http://localhost:${PORT}`);
});
