/**
 * Accepts bare hosts (`acme.io`), leading-slash slips (`//acme.io`), or full
 * URLs. Returns an https:// URL when no scheme is present, preserves an
 * explicit http:// when the buyer typed it. Empty input is returned as-is so
 * required-field validators upstream still fire.
 */
export function normalizeUrl(input: string): string {
	let url = input.trim();
	if (!url) return url;
	url = url.replace(/^\/+/, "");
	if (!/^https?:\/\//i.test(url)) {
		url = "https://" + url;
	}
	return url;
}

/**
 * Light sanity check: a normalized URL must parse and have a host with a
 * dotted suffix. Returns null on success, a user-facing error message on
 * failure. Use after `normalizeUrl` so bare-host input gets a fair chance.
 */
export function validateNormalizedUrl(url: string): string | null {
	try {
		const u = new URL(url);
		if (!/\.[a-z]{2,}$/i.test(u.hostname)) {
			return "Please enter a valid website (e.g. acme.io or https://acme.io).";
		}
		return null;
	} catch {
		return "Please enter a valid website (e.g. acme.io or https://acme.io).";
	}
}
