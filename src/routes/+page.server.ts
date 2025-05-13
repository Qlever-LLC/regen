import { redirect } from "@sveltejs/kit";

// TODO: Make real index
export function load() {
	redirect(308, "/verify");
}
