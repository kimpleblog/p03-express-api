const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const posts = [];

/**
 * โครงสร้างโพสต์ตัวอย่าง:
 * {
 *   id: string,
 *   title: string,
 *   body: string,
 *   createdAt: ISOString
 * }
 */

router.get("/", (req, res) => {
	res.json(posts);
});

router.post("/", (req, res) => {
	const { title, body } = req.body;

	const newPost = {
		id: uuidv4(),
		title: title ?? "",
		body: body ?? "",
		createAt: new Date().toISOString(),
	};

	posts.unshift(newPost);
	res.status(201).json(newPost);
});

module.exports = router;
