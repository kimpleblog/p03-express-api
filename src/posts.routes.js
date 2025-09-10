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

router.get("/:id", (req, res) => {
	const id = req.params.id;
	const post = posts.find((p) => p.id === id);
	if (!post) {
		return res.status(404).json({ error: "Post not found" });
	}
	res.json(post);
});

router.post("/", (req, res) => {
	const { title, body } = req.body || {};
	if (!title || !body) {
		return res.status(400).json({ error: "title and body are required" });
	}
	const now = new Date().toISOString();
	const newPost = {
		id: uuidv4(),
		title: String(title).trim(),
		body: String(body).trim(),
		createdAt: now,
	};

	posts.unshift(newPost);
	res.status(201).json(newPost);
});

router.put("/:id", (req, res) => {
	const id = req.params.id;
	const idx = posts.findIndex((p) => p.id === id);
	if (idx === -1) {
		return res.status(404).json({ error: "Post not found" });
	}

	const { title, body } = req.body || {};
	if (!title || !body) {
		return res.status(400).json({ error: "title and body are required" });
	}

	const now = new Date().toISOString();
	posts[idx] = {
		...posts[idx],
		title: String(title).trim(),
		body: String(body).trim(),
		updatedAt: now,
	};

	res.json(posts[idx]);
});

router.patch("/:id", (req, res) => {
	const id = req.params.id;
	const idx = posts.findIndex((p) => p.id === id);
	if (idx === -1) {
		return res.status(404).json({ error: "Post not found" });
	}

	const { title, body } = req.body || {};
	if (title === undefined && body === undefined) {
		return res
			.status(400)
			.json({ error: "Provide at least one field: title or body" });
	}

	const now = new Date().toISOString();
	if (title !== undefined) {
		posts[idx].title = String(title).trim();
	}
	if (body !== undefined) {
		posts[idx].body = String(body).trim();
	}
	posts[idx].updatedAt = now;

	res.json(posts[idx]);
});

router.delete("/:id", (req, res) => {
	const id = req.params.id;
	const idx = posts.findIndex((p) => p.id === id);
	if (idx === -1) {
		return res.status(404).json({ error: "Post not found" });
	}
	const removed = posts.splice(idx, 1)[0];
	res.json({ ok: true, removed });
});

module.exports = router;
