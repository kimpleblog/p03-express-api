async function includePartials() {
	const nodes = document.querySelectorAll("[data-include]");
	await Promise.all(
		[...nodes].map(async (el) => {
			const url = el.getAttribute("data-include");
			try {
				const res = await fetch(url);
				if (!res.ok) throw new Error(res.status);
				const html = await res.text();
				el.outerHTML = html;
			} catch (err) {
				console.error("Include failed:", url, err);
			}
		})
	);
	highlightActiveNav();
	setYear();
}

function highlightActiveNav() {
	const file = location.pathname.split("/").pop() || "index.html";
	const map = {
		"index.html": "home",
		"about.html": "about",
		"contact.html": "contact",
		"manage.html": "manage",
	};

	const key = map[file];
	if (!key) return;

	document
		.querySelectorAll(`[data-nav="${key}"]`)
		.forEach((a) => a.classList.add("text-blue-600", "font-semibold"));
}

function setYear() {
	const y = document.getElementById("year");
	if (y) y.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", includePartials);
