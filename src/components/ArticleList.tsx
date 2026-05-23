"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArticleMeta } from "@/lib/articles";

type ArticleListProps = {
  articles: ArticleMeta[];
};

export default function ArticleList({ articles }: ArticleListProps) {
  // 提取所有主分类
  const mainCategories = useMemo(() => {
    // 从文章中提取主分类
    const articleCategories = articles.map(article => {
      const parts = article.category.split('/');
      return parts[0];
    });
    // 合并所有可能的分类，确保完整覆盖
    const allCategories = [
      ...articleCategories,
      '科技类',
      '教育类', 
      '环境类',
      '社会类',
      '文化类',
      '健康类'
    ];
    return Array.from(new Set(allCategories));
  }, [articles]);

  const [selectedCategory, setSelectedCategory] = useState("全部");
  const filteredArticles = useMemo(
    () =>
      selectedCategory === "全部"
        ? articles
        : articles.filter((article) => article.category.includes(selectedCategory)),
    [articles, selectedCategory],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {["全部", ...mainCategories].map((category) => {
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={[
                "rounded-md border px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "border-teal-800 bg-teal-800 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-teal-700 hover:text-teal-800",
              ].join(" ")}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-teal-700 hover:shadow-md"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
              <span className="rounded-md bg-teal-50 px-2.5 py-1 text-teal-800">
                {article.category.split('/')[0]}
              </span>
              <span className="rounded-md bg-neutral-100 px-2.5 py-1">
                {article.difficulty}
              </span>
              <span>{article.date}</span>
              <span>{article.readingTime}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              {article.title}
            </h2>
            <p className="mt-3 leading-7 text-neutral-600">{article.summary}</p>
          </Link>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600">
          当前分类暂无文章。
        </div>
      )}
    </div>
  );
}
