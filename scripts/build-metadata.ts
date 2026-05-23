import fs from "node:fs";
import path from "node:path";
import { getAllArticleMetas } from "@/lib/articles";

const publicDirectory = path.join(process.cwd(), "public");

function ensurePublicDirectory() {
  if (!fs.existsSync(publicDirectory)) {
    fs.mkdirSync(publicDirectory, { recursive: true });
  }
}

function buildMetadata() {
  console.log("Building article metadata...");
  
  const allMetas = getAllArticleMetas();
  
  const simplifiedMetas = allMetas.map((meta) => ({
    title: meta.title,
    slug: meta.slug,
    category: meta.category,
    source: meta.source,
    difficulty: meta.difficulty,
    summary: meta.summary,
    readingTime: meta.readingTime,
    date: meta.date,
  }));

  ensurePublicDirectory();
  
  const outputPath = path.join(publicDirectory, "metadata.json");
  fs.writeFileSync(outputPath, JSON.stringify(simplifiedMetas, null, 2));
  
  console.log(`Metadata written to ${outputPath}`);
  console.log(`Total articles: ${simplifiedMetas.length}`);
}

buildMetadata();