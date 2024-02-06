// sum.test.js
import { expect, test } from 'vitest'
import { extractParagraphsFromHtmlString } from '../lib/extractParagraphsFromHtmlString'

test('can get paragraphs from html string', () => {
	const htmlString = '<p>hello</p><p>world</p>'
	const expected = [
		'hello',
		'world',
	]

  expect(extractParagraphsFromHtmlString(htmlString)).toEqual(expected)
})