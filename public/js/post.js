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
function getPostId() {
	const url = new URL(location.href);
	const v = url.searchParams.get("id");
	return Number(v);
}

const container = document.getElementById("postContainer");

function renderNotFound() {
	// figure out how much 	ght is left after header/footer
	const headerH = document.querySelector("header")?.offsetHeight || 0;
	const footerH = document.querySelector("footer")?.offsetHeight || 0;
	const available = Math.max(0, window.innerHeight - headerH - footerH);

	// center inside that available space (no page scroll)
	Object.assign(container.style, {
		minHeight: available + "px",
		display: "grid",
		placeItems: "center",
		padding: "16px",
		overflow: "hidden",
	});

	container.innerHTML = `
      <div class="w-full max-w-sm p-6 bg-white rounded-2xl shadow text-center">
        <h1 class="text-xl font-bold">This post is unavailable</h1>
        <p class="text-gray-600 mt-2">
          This link might be wrong or the post was deleted.
        </p>
        <a href="index.html"
           class="inline-block mt-4 px-4 py-2 rounded bg-gray-900 text-white">
          Back to Home
        </a>
      </div>
    `;
}
function renderPost(post) {
	const article = document.createElement("article");
	article.className = "mt-6 bg-white rounded-2xl shadow p-6";

	const h1 = document.createElement("h1");
	h1.className = "text-2xl font-bold";
	h1.textContent = post.title;

	const meta = document.createElement("div");
	meta.className =
		"mt-2 text-xs text-gray-500 flex items-center justify-between";

	const tagsBox = document.createElement("div");
	tagsBox.className = "space-x-1 ";
	const tags = Array.isArray(post.tags) ? post.tags : [];
	tags.forEach((t) => {
		const badge = document.createElement("span");
		badge.className = "text-xs bg-gray-100 px-3 py-1 rounded";
		badge.textContent = `#${t}`;
		tagsBox.appendChild(badge);
	});

	const time = document.createElement("time");
	time.textContent = new Date(post.createdAt).toLocaleString();

	meta.appendChild(tagsBox);
	meta.appendChild(time);

	const body = document.createElement("p");
	body.className = "mt-4 whitespace-pre-wrap leading-7";
	body.textContent = post.content || "";

	const back = document.createElement("div");
	back.innerHTML = `<a href="index.html" class="text-sm text-blue-500 hover:underline">← Back to Home</a>`;

	article.appendChild(h1);
	article.appendChild(meta);
	article.appendChild(body);
	article.appendChild(back);

	container.innerHTML = "";
	container.appendChild(article);
}

const id = getPostId();
if (!Number.isFinite(id)) {
	renderNotFound();
} else {
	const post = loadPosts().find((p) => p.id === id);
	post ? renderPost(post) : renderNotFound();
}
