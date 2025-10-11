async function api(url, options = {}) {
	const res = await fetch(url, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(`HTTP ${res.status} - ${msg}`);
	}
	return res.json();
}

let _postsCache = []; //keep recently fetched posts

async function fetchPostsFromApi() {
	const items = await api("/api/posts");
	const posts = Array.isArray(items) ? items : [];

	//normalize it
	_postsCache = posts.map((post, index) => ({
		id: post.id || post._id || String(index),
		title: post.title || "",
		content: post.content || post.body || "",
		createdAt: post.createdAt ? new Date(post.createdAt).getTime() : Date.now(),
	}));

	return _postsCache;
}

function savePosts(_) {}
function loadPosts() {
	try {
		const raw = localStorage.getItem("posts");
		const data = raw ? JSON.parse(raw) : [];
		return Array.isArray(data) ? data : [];
	} catch {
		localStorage.removeItem("posts");
		return [];
	}
}

const form = document.getElementById("postForm");
const titleInput = document.getElementById("title");
const excerptInput = document.getElementById("excerpt");
const contentInput = document.getElementById("content");
const tagsInput = document.getElementById("tags");
const msg = document.getElementById("msg");

const listEl = document.getElementById("manageList");
const cancelBtn = document.getElementById("cancelEdit");
let editingId = null;

function startEdit(id) {
	const post = _postsCache.find((p) => p.id === id);
	if (!post) {
		showMsg("Post not found in cache.", "error");
		return;
	}

	editingId = id;
	titleInput.value = post.title || "";
	excerptInput.value = post.excerpt || "";
	contentInput.value = post.content || "";
	tagsInput.value = Array.isArray(post.tags) ? post.tags.join(", ") : "";

	form.querySelector('button[type="submit"]').textContent = "Update";
	cancelBtn.classList.remove("hidden");
	showMsg("Editing mode", "success");
}

function resetForm() {
	form.reset();
	editingId = null;
	form.querySelector('button[type="submit"]').textContent = "Save";
	cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", () => {
	resetForm();
});

function deletePost(id) {
	if (!confirm("Delete this post?")) return;
	const posts = loadPosts().filter((p) => p.id !== id);
	savePosts(posts);
	if (editingId === id) resetForm();
	renderManageList();
	showMsg("Deleted successfully.", "success");
}

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const title = titleInput.value.trim();
	const excerpt = excerptInput.value.trim();
	const content = contentInput.value.trim();
	const tags = tagsInput.value
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	const now = Date.now();

	if (!title || !content) {
		showMsg("Title and Content must not be empty", "error");
		return;
	}
	if (editingId) {
		const exists = _postsCache.some((p) => p.id === editingId);
		if (!exists) {
			showMsg("Post not found in cache", "error");
			resetForm();
			return;
		}

		_postsCache = _postsCache.map((p) =>
			p.id === editingId
				? { ...p, title, excerpt, content, tags, updatedAt: now }
				: p
		);
		showMsg("Updated (local)!", "success");
		resetForm();
		await renderManageList(true);
		return;
	} else {
		try {
			const created = await api("/api/posts", {
				method: "POST",
				body: JSON.stringify({ title, body: content }),
			});

			form.reset();
			showMsg("Recording successful!!!", "success");

			console.log("[created]", created);

			await renderManageList();
			return;
		} catch (err) {
			console.log(err);
			showMsg("Failed to save via API: " + err.message, "error");
		}
	}
	await renderManageList(true);
});

function showMsg(text, type = "success") {
	msg.textContent = text;
	msg.classList.remove(
		"hidden",
		"bg-green-50",
		"text-green-700",
		"bg-red-50",
		"text-red-700"
	);
	msg.classList.add("mb-4", "p-3", "rounded", "text-sm");

	if (type === "success") {
		msg.classList.add("bg-green-50", "text-green-700");
	} else {
		msg.classList.add("bg-red-50", "text-red-700");
	}

	clearTimeout(showMsg._t);
	showMsg._t = setTimeout(() => msg.classList.add("hidden"), 3000);
}

async function renderManageList(useCache = false) {
	listEl.innerHTML = "";

	try {
		// const posts = (await fetchPostsFromApi()).sort(
		// 	(a, b) => b.createdAt - a.createdAt
		// );
		const base = useCache ? _postsCache : await fetchPostsFromApi();
		const posts = [...base].sort((a, b) => b.createdAt - a.createdAt);

		if (posts.length === 0) {
			const li = document.createElement("li");
			li.className = "p-4 text-gray-500 text-center";
			li.textContent = "No posts yet.";
			listEl.appendChild(li);
			return;
		}

		posts.forEach((p) => {
			const li = document.createElement("li");
			li.className = "p-4 flex items-center justify-between gap-4";

			const left = document.createElement("div");
			left.className = "min-w-0";

			const title = document.createElement("div");
			title.className = "font-medium truncate";
			title.textContent = p.title;

			const meta = document.createElement("div");
			meta.className = "text-xs text-gray-500";
			meta.textContent = new Date(p.createdAt).toLocaleString();
			left.append(title, meta);

			const btns = document.createElement("div");
			btns.className = "shrink-0 flex gap-2";

			const editBtn = document.createElement("button");
			editBtn.className = "px-3 py-1 rounded border hover:bg-gray-50";
			editBtn.textContent = "Edit";
			editBtn.addEventListener("click", () => startEdit(p.id));

			const delBtn = document.createElement("button");
			delBtn.className =
				"px-3 py-1 rounded border text-red-600 hover:bg-red-50";
			delBtn.textContent = "Delete";
			delBtn.addEventListener("click", () => deletePost(p.id));

			btns.append(editBtn, delBtn);
			li.append(left, btns);
			listEl.appendChild(li);
		});
	} catch (e) {
		console.error(e);
		showMsg("Failed to load posts from API: " + e.message, "error");
	}
}

(async () => {
	try {
		await renderManageList();
	} catch (e) {
		console.error(e);
		showMsg("Failed to load posts from API: " + e.message, "error");
	}
})();
