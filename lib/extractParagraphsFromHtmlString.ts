// N.B. gpt-4 generated

export function extractParagraphsFromHtmlString(htmlString: string) {
	const regex = /<p>(.*?)<\/p>/gs;
	const matches = htmlString.matchAll(regex);
	let paragraphs = [];

	for (const match of matches) {
		// The first capture group (index 1) contains the content of the paragraph
		paragraphs.push(match[1]);
	}

	return paragraphs;
}