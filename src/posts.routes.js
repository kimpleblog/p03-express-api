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
 *   excerpt: string,
 *   tags: string[],
 *   createdAt: ISOString,
 *   updatedAt: ISOString
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
	const { title, body, excerpt = "", tags = [] } = req.body || {};
	if (!title || !body) {
		return res.status(400).json({ error: "title and body are required" });
	}

	const parsedTags = Array.isArray(tags)
		? tags
		: String(tags || "")
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);

	const now = new Date().toISOString();
	const newPost = {
		id: uuidv4(),
		title: String(title).trim(),
		body: String(body).trim(),
		excerpt: String(excerpt).trim(),
		tags: parsedTags,
		createdAt: now,
		updatedAt: now,
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

	const { title, body, excerpt, tags } = req.body || {};
	if (!title || !body) {
		return res.status(400).json({ error: "title and body are required" });
	}

	const parsedTags =
		tags == null
			? posts[idx].tags
			: Array.isArray(tags)
				? tags
				: String(tags)
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean);

	const now = new Date().toISOString();

	posts[idx] = {
		...posts[idx],
		title: String(title).trim(),
		body: String(body).trim(),
		excerpt: excerpt != null ? String(excerpt).trim() : posts[idx].excerpt,
		tags: parsedTags,
		updatedAt: now,
	};

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
