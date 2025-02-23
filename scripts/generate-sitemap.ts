// scripts/generate-sitemap.ts
import { readdirSync, readFileSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import prettier from "prettier";
import matter from "gray-matter";

const domain = "https://keepsharp.dev";

async function generateSitemap() {
  try {
    // Dynamic import for globby
    const { globby } = await import("globby");

    // Get all static pages
    const pages = await globby([
      "app/**/*.tsx",
      "!app/**/_*.tsx",
      "!app/**/layout.tsx",
      "!app/**/loading.tsx",
      "!app/**/error.tsx",
      "!app/**/[slug]/page.tsx",
      "!app/**/[id]/page.tsx",
      "!app/editor/page.tsx",
      "!app/**/post/route.ts",
    ]);

    const POSTS_PATH = path.join(process.cwd(), "content/posts");

    const getPostFilePaths = (): string[] => {
      try {
        return readdirSync(POSTS_PATH).filter((path) => /\.mdx?$/.test(path));
      } catch (error) {
        console.error("Error reading posts directory:", error);
        return [];
      }
    };

    const postFiles = getPostFilePaths();
    const currentDate = new Date();
    const posts = postFiles
      .map((fileName) => {
        const filePath = path.join(POSTS_PATH, fileName);
        const fileContents = readFileSync(filePath, "utf8");
        const { data } = matter(fileContents);
        return {
          slug: fileName.replace(/\.mdx?$/, ""),
          publishedAt:
            data.publishedAt.length === 10
              ? data.publishedAt + "T07:00:00+07:00"
              : data.publishedAt,
          draft: data.draft || false,
        };
      })
      .filter((post) => !post.draft)
      .filter((post) => new Date(post.publishedAt) <= currentDate);

    // Authors
    const AUTHORS_PATH = path.join(process.cwd(), "content/authors");

    const getAuthorFilePaths = (): string[] => {
      try {
        return readdirSync(AUTHORS_PATH).filter((path) => /\.mdx?$/.test(path));
      } catch (error) {
        console.error("Error reading authors directory:", error);
        return [];
      }
    };

    const authorFiles = getAuthorFilePaths();
    const authors = authorFiles.map((fileName) => {
      const filePath = path.join(AUTHORS_PATH, fileName);
      const fileContents = readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);
      return {
        slug: fileName.replace(/\.mdx?$/, ""),
        name: data.name,
      };
    });
    const sitemap = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <!-- Static Pages -->
        ${pages
          .map((page) => {
            const pagePath = page
              .replace("app", "")
              .replace(/\.tsx?$/, "")
              .replace(/\/page$/, "")
              .replace(/\/index$/, "");

            const route = pagePath.replace(/$.*$/, "");

            return `
              <url>
                <loc>${domain}${route}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>daily</changefreq>
                <priority>${route === "" ? "1.0" : "0.7"}</priority>
              </url>
            `;
          })
          .join("")}

              <!-- Author Pages -->
            ${authors
              .map(
                (author) => `
        <url>
          <loc>${domain}/authors/${author.slug}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `
              )
              .join("")}

        <!-- Blog Posts -->
        ${posts
          .map(
            (post) => `
            <url>
              <loc>${domain}/blog/${post.slug}</loc>
              <lastmod>${post.publishedAt}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.6</priority>
            </url>
          `
          )
          .join("")}
      </urlset>
    `;

    const formatted = await prettier.format(sitemap, {
      parser: "html",
    });

    // Write the sitemap
    await writeFile(
      path.join(process.cwd(), "public", "sitemap.xml"),
      formatted
    );

    console.log("✅ Sitemap generated successfully!");
    console.log(
      `✅ Generated sitemap for ${pages.length + authors.length} pages and ${posts.length} blog posts`
    );
  } catch (error) {
    console.error("Error generating sitemap:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  }
}

generateSitemap();
