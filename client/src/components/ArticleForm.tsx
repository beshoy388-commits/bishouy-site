/*
 * BISHOUY.COM — Article Form Component
 * Form for creating and editing articles with rich text editor, image management, and live preview
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Upload,
  Eye,
  Edit2,
  ArrowLeft,
  Clock,
  Sparkles,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";
import ArticlePreview from "./ArticlePreview";
import ImageUploader from "./ImageUploader";

const CATEGORIES = [
  { name: "World", color: "#E8A020" },
  { name: "Politics", color: "#C0392B" },
  { name: "Economy", color: "#27AE60" },
  { name: "Technology", color: "#2980B9" },
  { name: "Culture", color: "#8E44AD" },
  { name: "Sports", color: "#E67E22" },
];

interface ArticleFormProps {
  articleId?: number;
  onSuccess?: () => void;
}

export default function ArticleForm({
  articleId,
  onSuccess,
}: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "World",
    categoryColor: "#3B82F6",
    author: "",
    authorRole: "Staff Writer",
    image: "",
    featured: false,
    breaking: false,
    readTime: 5,
    tags: [] as string[],
    slug: "",
    status: "published" as "draft" | "published",
    summary: "",
    factCheck: "",
    premiumOnly: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getArticleQuery = trpc.articles.getById.useQuery(
    { id: articleId! },
    { enabled: !!articleId }
  );

  const createMutation = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success("Article created successfully");
      onSuccess?.();
    },
    onError: error => {
      toast.error("Failed to create article", { description: error.message });
    },
  });

  const updateMutation = trpc.articles.update.useMutation({
    onSuccess: () => {
      toast.success("Article updated successfully");
      onSuccess?.();
    },
    onError: error => {
      toast.error("Failed to update article", { description: error.message });
    },
  });

  const generateMutation = trpc.articles.generate.useMutation({
    onSuccess: (generatedArticle) => {
      toast.success("AI Draft generated successfully!");
      setFormData({
        title: generatedArticle.title,
        excerpt: generatedArticle.excerpt,
        content: generatedArticle.content,
        category: generatedArticle.category,
        categoryColor: generatedArticle.categoryColor || "#3B82F6",
        author: generatedArticle.author || "Bishouy Editorial",
        authorRole: generatedArticle.authorRole || "Editorial Desk",
        image: generatedArticle.image || "",
        featured: generatedArticle.featured === 1,
        breaking: generatedArticle.breaking === 1,
        readTime: generatedArticle.readTime || 5,
        tags: (() => {
          try {
            return generatedArticle.tags ? JSON.parse(generatedArticle.tags) : [];
          } catch { return []; }
        })(),
        slug: generatedArticle.slug,
        status: "draft",
        summary: generatedArticle.summary || "",
        factCheck: generatedArticle.factCheck || "98% Neural Integrity",
        premiumOnly: false,
      });
      setAiTopic("");
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error("AI Generation failed", { description: error.message });
      setIsGenerating(false);
    },
  });

  const handleAiGenerate = () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic for the AI");
      return;
    }
    setIsGenerating(true);
    generateMutation.mutate({ topic: aiTopic });
  };

  // Load article data if editing
  useEffect(() => {
    if (getArticleQuery.data) {
      const article = getArticleQuery.data;
      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        categoryColor: article.categoryColor || "#3B82F6",
        author: article.author,
        authorRole: article.authorRole || "Staff Writer",
        image: article.image,
        featured: article.featured === 1,
        breaking: article.breaking === 1,
        readTime: article.readTime,
        tags: (() => {
          try {
            return article.tags ? JSON.parse(article.tags) : [];
          } catch { return []; }
        })(),
        slug: article.slug,
        status: article.status as "draft" | "published",
        summary: article.summary || "",
        factCheck: article.factCheck || "",
        premiumOnly: article.premiumOnly === 1,
      });
    }
  }, [getArticleQuery.data]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!articleId && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, articleId]);

  // Auto-calculate read time from content
  useEffect(() => {
    if (formData.content) {
      const cleanText = formData.content.replace(/<[^>]*>/g, " ").trim();
      const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      setFormData(prev => {
        if (prev.readTime === readTime) return prev;
        return { ...prev, readTime };
      });
    }
  }, [formData.content]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseInt(value)
            : value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    const selected = CATEGORIES.find(c => c.name === category);
    setFormData(prev => ({
      ...prev,
      category,
      categoryColor: selected?.color || "#3B82F6",
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (articleId) {
        updateMutation.mutate({
          id: articleId,
          ...formData,
        });
      } else {
        createMutation.mutate({
          ...formData,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (getArticleQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#E8A020]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Assistant Generator - Only for New Articles */}
      {!articleId && (
        <Card className="bg-[#1C1C1A] border-2 border-dashed border-[#E8A020]/30 p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-12 h-12 rounded-full bg-[#E8A020]/10 flex items-center justify-center text-[#E8A020] flex-shrink-0 animate-pulse">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl text-[#F2F0EB] mb-2">AI Article Generator</h3>
              <p className="font-ui text-sm text-[#8A8880] mb-4">
                Enter a topic, headline, or event, and our AI assistant will draft a complete article for you.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g., The future of quantum computing in 2026..."
                  className="flex-1 bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-ui text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <Button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiTopic.trim()}
                  className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Generating...
                    </>
                  ) : (
                    "Draft with AI"
                  )}
                </Button>
              </div>
              <p className="mt-3 text-[10px] text-[#555550] font-ui uppercase tracking-widest text-center md:text-left">
                Process takes 30-60 seconds to ensure Pulitzer-level quality.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div>
        {/* Tab Switcher: Editor / Full Preview */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm font-ui text-xs font-600 uppercase tracking-wider transition-colors ${activeTab === "editor"
              ? "bg-[#E8A020] text-[#0F0F0E]"
              : "bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB]"
              }`}
          >
            <Edit2 size={14} />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm font-ui text-xs font-600 uppercase tracking-wider transition-colors ${activeTab === "preview"
              ? "bg-[#E8A020] text-[#0F0F0E]"
              : "bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB]"
              }`}
          >
            <Eye size={14} />
            Full Preview
          </button>
        </div>

        {activeTab === "preview" ? (
          /* Full Article Preview */
          <ArticlePreview article={formData} />
        ) : (
          /* Editor Form */
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Title */}
              <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                <label className="block mb-2">
                  <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                    Title
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={255}
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-headline text-lg px-4 py-3 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  placeholder="Article title"
                />
              </Card>

              {/* Slug */}
              <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                <label className="block mb-2">
                  <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                    Slug (URL)
                  </span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  maxLength={255}
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-ui text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  placeholder="auto-generated-slug"
                />
                <p className="font-ui text-xs text-[#555550] mt-2">
                  Auto-generated from title. This will be the article URL.
                </p>
              </Card>

              {/* Excerpt */}
              <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                <label className="block mb-2">
                  <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                    Excerpt
                  </span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  maxLength={500}
                  rows={3}
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-ui text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  placeholder="Brief summary of the article (shown on cards and search results)"
                />
                <p className="font-ui text-xs text-[#555550] mt-2">
                  {formData.excerpt.length}/500
                </p>
              </Card>

              {/* Content — Rich Text Editor */}
              <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                <label className="block mb-2">
                  <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                    Content
                  </span>
                  <span className="font-ui text-xs text-[#555550] ml-2">
                    Supports Markdown formatting
                  </span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={content =>
                    setFormData(prev => ({ ...prev, content }))
                  }
                  placeholder="Write your article using Markdown...\n\n# Heading\n**Bold** *Italic*\n\nUse the toolbar to format text and insert images with custom positioning."
                  maxLength={50000}
                />
              </Card>

              {/* Hero Image */}
              <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                <label className="block mb-2">
                  <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                    Hero Image
                  </span>
                  <span className="font-ui text-xs text-[#555550] ml-2">
                    Main article cover image
                  </span>
                </label>
                <ImageUploader
                  onImageUpload={url =>
                    setFormData(prev => ({ ...prev, image: url }))
                  }
                  currentImage={formData.image}
                  label="Upload Hero Image"
                />
              </Card>

              {/* Category & Author Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="block mb-2">
                    <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                      Category
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs font-600 uppercase tracking-wider transition-colors ${formData.category === cat.name
                          ? "border-[#E8A020] bg-[#E8A020]/10 text-[#E8A020]"
                          : "border-[#222220] text-[#8A8880] hover:border-[#555550]"
                          }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Author Info */}
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2">
                        <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                          Author
                        </span>
                      </label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        required
                        maxLength={255}
                        className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-ui text-sm px-4 py-2.5 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">
                        <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                          Role
                        </span>
                      </label>
                      <input
                        type="text"
                        name="authorRole"
                        value={formData.authorRole}
                        onChange={handleInputChange}
                        maxLength={255}
                        className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-ui text-sm px-4 py-2.5 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                        placeholder="e.g., Senior Reporter"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tags */}
              <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                <label className="block mb-2">
                  <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                    Tags
                  </span>
                  <span className="font-ui text-xs text-[#555550] ml-2">
                    Up to 10 tags
                  </span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    maxLength={50}
                    className="flex-1 bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-ui text-sm px-4 py-2 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                    placeholder="Add a tag and press Enter..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-[#2A2A28] text-[#E8A020] font-ui text-xs px-3 py-1 rounded-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(i)}
                        className="hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </Card>

              {/* Intelligence Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="block mb-4">
                    <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                      AI Article Highlights (JSON)
                    </span>
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#D4D0C8] font-ui text-xs px-4 py-3 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                    placeholder='["Point 1", "Point 2", "Point 3"]'
                  />
                  <p className="font-ui text-[10px] text-[#555550] mt-2">
                    Enter as a JSON array of strings for the Highlights section.
                  </p>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="block mb-4">
                    <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                      Trust Score
                    </span>
                  </label>
                  <input
                    type="text"
                    name="factCheck"
                    value={formData.factCheck}
                    onChange={handleInputChange}
                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] font-ui text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                    placeholder="e.g., 98.4% Trust Score"
                  />
                  <p className="font-ui text-[10px] text-[#555550] mt-2">
                    Visible in the Article Metrics section.
                  </p>
                </Card>
              </div>

              {/* Flags & Read Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded accent-[#E8A020]"
                    />
                    <div>
                      <span className="font-ui text-sm text-[#F2F0EB] block">
                        Featured Article
                      </span>
                      <span className="font-ui text-xs text-[#555550]">
                        Shows in hero section
                      </span>
                    </div>
                  </label>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="breaking"
                      checked={formData.breaking}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded accent-[#E8A020]"
                    />
                    <div>
                      <span className="font-ui text-sm text-[#F2F0EB] block">
                        Breaking News
                      </span>
                      <span className="font-ui text-xs text-[#555550]">
                        Shows in ticker
                      </span>
                    </div>
                  </label>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="premiumOnly"
                      checked={formData.premiumOnly}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded accent-[#E8A020]"
                    />
                    <div>
                      <span className="font-ui text-sm text-[#F2F0EB] block">
                         Premium Content
                      </span>
                      <span className="font-ui text-xs text-[#555550]">
                         Locks reading for Free users
                      </span>
                    </div>
                  </label>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="block mb-2">
                    <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                      Read Time
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#8A8880]" />
                    <span className="text-[#F2F0EB] font-ui text-sm">
                      {formData.readTime} min
                    </span>
                    <span className="text-[#555550] font-ui text-xs">
                      (auto-calculated)
                    </span>
                  </div>
                </Card>

                {/* Status */}
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
                  <label className="block mb-2">
                    <span className="font-ui text-xs font-600 text-[#E8A020] uppercase tracking-widest">
                      Visibility Status
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({ ...prev, status: "published" }))
                      }
                      className={`flex-1 py-1.5 rounded-sm border text-[10px] font-600 uppercase tracking-widest transition-colors ${formData.status === "published"
                        ? "border-[#E8A020] bg-[#E8A020]/10 text-[#E8A020]"
                        : "border-[#222220] text-[#8A8880] hover:border-[#555550]"
                        }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({ ...prev, status: "draft" }))
                      }
                      className={`flex-1 py-1.5 rounded-sm border text-[10px] font-600 uppercase tracking-widest transition-colors ${formData.status === "draft"
                        ? "border-[#E8A020] bg-[#E8A020]/10 text-[#E8A020]"
                        : "border-[#222220] text-[#8A8880] hover:border-[#555550]"
                        }`}
                    >
                      Draft
                    </button>
                  </div>
                </Card>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="flex-1 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-sm font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ||
                    createMutation.isPending ||
                    updateMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : articleId ? (
                    "Update Article"
                  ) : (
                    "Publish Article"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
