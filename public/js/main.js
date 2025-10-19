async function loadPosts() {
	try {
		const res = await fetch("/api/posts");
		if (!res.ok) throw new Error("Failed to fetch posts");
		const items = await res.json();
		return items.map((p) => ({
			id: p.id,
			title: p.title || "",
			excerpt: p.excerpt || "",
			content: p.body || "",
			tags: Array.isArray(p.tags) ? p.tags : [],
			createdAt: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
			updatedAt: p.updatedAt ? new Date(p.createdAt).getTime() : Date.now(),
		}));
	} catch {
		return [];
	}
}
const postList = document.getElementById("postList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

function matchesQuery(p, q) {
	if (!q) return true;
	const needle = q.toLowerCase();
	const haystack = [
		p.title || "",
		p.excerpt || "",
		p.content || "",
		...(Array.isArray(p.tags) ? p.tags.map((t) => `#${t}`) : []),
	]
		.join(" ")
		.toLowerCase();

	return haystack.includes(needle);
}

function sortByMode(list, mode) {
	const sortedPost = [...list];
	if (mode === "oldest") {
		sortedPost.sort((a, b) => a.createdAt - b.createdAt);
	} else if (mode === "title") {
		sortedPost.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
	} else {
		sortedPost.sort((a, b) => b.createdAt - a.createdAt);
	}
	return sortedPost;
}

const pager = document.getElementById("pager");
const PAGE_SIZE = 6;
let page = 1;

(() => {
	const params = new URLSearchParams(location.search);
	const q0 = params.get("q") ?? "";
	const sort0 = params.get("sort") ?? "newest";
	const p0 = parseInt(params.get("page") || "1", 10);

	if (searchInput) searchInput.value = q0;
	if (sortSelect) sortSelect.value = sort0;
	if (Number.isFinite(p0) && p0 > 0) page = p0;
})();

function renderPager(totalPages) {
	if (!pager) return;
	if (totalPages <= 1) {
		pager.innerHTML = "";
		return;
	}

	pager.innerHTML = `
		<button id="prevPage" class="px-3 py-1 rounded border disabled:opacity-40" ${
			page === 1 ? "disabled" : ""
		}>Prev</button>
		<span class="text-sm">Page ${page} / ${totalPages}</span>
		<button id="nextPage" class="px-3 py-1 rounded border disabled:opacity-40" ${
			page === totalPages ? "disabled" : ""
		}>Next</button>
		
	`;
	document.getElementById("prevPage")?.addEventListener("click", () => {
		if (page > 1) {
			page--;
			renderPosts();
		}
	});
	document.getElementById("nextPage")?.addEventListener("click", () => {
		if (page < totalPages) {
			page++;
			renderPosts();
		}
	});
}

function syncURL(q, sort, p) {
	const params = new URLSearchParams();
	if (q) params.set("q", q);
	if (sort && sort !== "newest") params.set("sort", sort);
	if (p > 1) params.set("page", String(p));

	const qs = params.toString();
	const href = qs ? `?${qs}` : location.pathname;
	history.replaceState(null, "", href);
}

async function renderPosts() {
	const allposts = await loadPosts();
	const q = (searchInput?.value || "").trim();
	const mode = sortSelect?.value || "newest";
	const activeTag = q.startsWith("#") ? q.slice(1).toLowerCase() : "";

	if (allposts.length === 0) {
		postList.innerHTML = `<li class="col-span-full text-center text-gray-500 py-10">There are currently no posts.</li>`;

		if (pager) pager.innerHTML = "";
		syncURL(q, mode, 1);
		return;
	}

	const filteredPosts = allposts.filter((p) => matchesQuery(p, q));
	if (filteredPosts.length === 0) {
		postList.innerHTML = `<li class="col-span-full text-center text-gray-500 py-10">No posts matched</li>`;
		if (pager) pager.innerHTML = "";
		syncURL(q, mode, 1);
		return;
	}
	const posts = sortByMode(filteredPosts, mode);

	const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
	if (page > totalPages) page = totalPages;
	const start = (page - 1) * PAGE_SIZE;
	const pageItems = posts.slice(start, start + PAGE_SIZE);

	postList.innerHTML = "";
	for (const p of pageItems) {
		const li = document.createElement("li");
		li.className =
			"bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden";
		const tags =
			(p.tags || [])
				.map((t) => {
					const isActive = activeTag && t.toLowerCase() == activeTag;
					const baseCls = "text-xs px-2 py-1 rounded border";
					const normal = "bg-gray-100 hover:bg-gray-200 border-transparent";
					const active = "bg-blue-600 text-white border-blue-600";
					const cls = `${baseCls} ${isActive ? active : normal}`;
					return `<button type="button"
						data-tag="${t}"
						class="${cls}" 
						aria-pressed="${isActive ? "true" : "false"}">
						#${t}
					</button>
						`;
				})
				.join(" ") || "";
		li.innerHTML = `
                <article class="p-6">
                    <h2 class="font-semibold text-l">${p.title}</h2>
                    <p class="font-light mt-1">${p.excerpt || ""}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500 pt-2">
                        <div class="space-x-1">${tags}</div>
                        <time>${new Date(p.createdAt).toDateString()}</time>
                    </div>
                    <div class="mt-4">
                        <a href="post.html?id=${
													p.id
												}" class="text-blue-600 hover:underline">อ่านต่อ → </a>
                    </div>
                </article>
        `;
		postList.appendChild(li);
	}
	renderPager(totalPages);
	syncURL(q, mode, page);
}

postList?.addEventListener("click", (e) => {
	const btn = e.target.closest("[data-tag]");
	if (!btn) return;
	const tag = btn.dataset.tag;
	if (searchInput) searchInput.value = `#${tag}`;
	page = 1;
	renderPosts();
});

searchInput?.addEventListener("input", () => {
	page = 1;
	renderPosts();
});
sortSelect?.addEventListener("change", () => {
	page = 1;
	renderPosts();
});

renderPosts();
