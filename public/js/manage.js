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

function savePosts(posts) {
	localStorage.setItem("posts", JSON.stringify(posts));
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
	const post = loadPosts().find((p) => p.id === id);
	if (!post) return;
	editingId = id;
	titleInput.value = post.title || "";
	excerptInput.value = post.excerpt || "";
	contentInput.value = post.content || "";
	tagsInput.value = (post.tags || []).join(", ");

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

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const title = titleInput.value.trim();
	const excerpt = excerptInput.value.trim();
	const content = contentInput.value.trim();
	const tags = tagsInput.value
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	const posts = loadPosts();
	const now = Date.now();

	if (!title || !content) {
		showMsg("Title and Content must not be empty", "error");
		return;
	}
	if (editingId) {
		const index = posts.findIndex((p) => p.id === editingId);
		if (index !== -1) {
			const updated = posts.map((p) =>
				p.id === editingId
					? { ...p, title, excerpt, content, tags, updatedAt: now }
					: p
			);
			savePosts(updated);
			showMsg("Updated!", "success");
			resetForm();
		} else {
			showMsg("Post not found.", "error");
			resetForm();
			return;
		}
	} else {
		const newPost = {
			id: now,
			title,
			excerpt,
			content,
			tags,
			createdAt: now,
			updatedAt: now,
		};
		try {
			posts.push(newPost);
			savePosts(posts);
			form.reset();
			showMsg("Recording successful!!!", "success");
			location.href = "index.html";
		} catch (err) {
			showMsg(
				"Failed to save (storage error). Try clearing some posts.",
				"error"
			);
			console.log(err);
		}
	}
	renderManageList();
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

function renderManageList() {
	const posts = loadPosts().sort((a, b) => b.createdAt - a.createdAt);
	listEl.innerHTML = "";

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
}

renderManageList();
