import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const markdown = `
Here is a footnote reference[^1].

[^1]: This is the footnote.
`;

const result = await processor.process(markdown);
console.log(result.toString());
