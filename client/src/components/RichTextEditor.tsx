import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image,
  Eye,
  Edit2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Code2,
  Layout,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

interface ImageDialogState {
  open: boolean;
  url: string;
  alt: string;
  position: "left" | "center" | "right" | "full";
  width: string;
  caption: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength = 50000,
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState<"visual" | "raw">("visual");
  const [imageDialog, setImageDialog] = useState<ImageDialogState>({
    open: false,
    url: "",
    alt: "",
    position: "center",
    width: "100",
    caption: "",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback(
    (before: string, after: string = "", placeholder: string = "") => {
      if (editMode === "visual") return; // Markdown tools only for raw mode

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const textToInsert = selectedText || placeholder;
      const newText =
        value.substring(0, start) +
        before +
        textToInsert +
        after +
        value.substring(end);

      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.setSelectionRange(
          selectedText ? newCursorPos + after.length : start + before.length,
          selectedText
            ? newCursorPos + after.length
            : start + before.length + placeholder.length
        );
      }, 0);
    },
    [value, onChange, editMode]
  );

  const toolbarActions =
    editMode === "raw"
      ? [
          {
            icon: Bold,
            label: "Bold",
            action: () => insertAtCursor("**", "**", "bold text"),
          },
          {
            icon: Italic,
            label: "Italic",
            action: () => insertAtCursor("*", "*", "italic text"),
          },
          {
            icon: Heading1,
            label: "H1",
            action: () => insertAtCursor("\n# ", "\n", "Heading 1"),
          },
          {
            icon: Heading2,
            label: "H2",
            action: () => insertAtCursor("\n## ", "\n", "Heading 2"),
          },
          {
            icon: Heading3,
            label: "H3",
            action: () => insertAtCursor("\n### ", "\n", "Heading 3"),
          },
          { divider: true },
          {
            icon: List,
            label: "Bullet List",
            action: () => insertAtCursor("\n- ", "\n", "List item"),
          },
          {
            icon: ListOrdered,
            label: "Numbered List",
            action: () => insertAtCursor("\n1. ", "\n", "List item"),
          },
          {
            icon: Quote,
            label: "Quote",
            action: () => insertAtCursor("\n> ", "\n", "Quote text"),
          },
          {
            icon: Code,
            label: "Code",
            action: () => insertAtCursor("`", "`", "code"),
          },
          {
            icon: Minus,
            label: "Divider",
            action: () => insertAtCursor("\n\n---\n\n", "", ""),
          },
          { divider: true },
          {
            icon: LinkIcon,
            label: "Link",
            action: () => insertAtCursor("[", "](https://)", "link text"),
          },
          {
            icon: Image,
            label: "Image",
            action: () => setImageDialog({ ...imageDialog, open: true }),
          },
        ]
      : [];

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const handleInsertImage = () => {
    if (!imageDialog.url) return;

    let imageMarkdown = "";
    const posClass = imageDialog.position;
    const width = imageDialog.width;
    const caption = imageDialog.caption;
    const alt = imageDialog.alt || "image";

    // Custom image syntax: <!-- img:position:width -->
    imageMarkdown = `\n\n<!-- img:${posClass}:${width}% -->\n![${alt}](${imageDialog.url})`;
    if (caption) {
      imageMarkdown += `\n*${caption}*`;
    }
    imageMarkdown += "\n\n";

    if (editMode === "raw") {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          value.substring(0, start) + imageMarkdown + value.substring(start);
        onChange(newText);
      }
    } else {
      // In visual mode, just append the HTML equivalent
      const imgHtml = `<figure style="width: ${width}%" class="img-${posClass}"><img src="${imageDialog.url}" alt="${alt}" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
      onChange(value + imgHtml);
    }

    setImageDialog({
      open: false,
      url: "",
      alt: "",
      position: "center",
      width: "100",
      caption: "",
    });
  };

  // Custom renderer for images with position/size
  const renderContent = (content: string) => {
    // Parse custom image directives
    const parts = content.split(/(<!-- img:[a-z]+:\d+% -->)/g);
    let currentImageStyle: { position: string; width: string } | null = null;

    return parts.map((part, index) => {
      const directiveMatch = part.match(/<!-- img:([a-z]+):(\d+)% -->/);
      if (directiveMatch) {
        currentImageStyle = {
          position: directiveMatch[1],
          width: directiveMatch[2],
        };
        return null;
      }

      const style = currentImageStyle;
      currentImageStyle = null;

      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt }) => {
              const imgStyle = style || { position: "center", width: "100" };
              const alignClass =
                imgStyle.position === "left"
                  ? "mr-auto"
                  : imgStyle.position === "right"
                    ? "ml-auto"
                    : imgStyle.position === "full"
                      ? "w-full"
                      : "mx-auto";

              return (
                <figure
                  className={`my-6 ${
                    imgStyle.position === "left"
                      ? "float-left mr-6 mb-4"
                      : imgStyle.position === "right"
                        ? "float-right ml-6 mb-4"
                        : "clear-both"
                  }`}
                  style={{
                    width:
                      imgStyle.position === "full"
                        ? "100%"
                        : `${imgStyle.width}%`,
                  }}
                >
                  <img
                    src={src}
                    alt={alt || ""}
                    className={`rounded-sm ${alignClass}`}
                    style={{ width: "100%", height: "auto" }}
                  />
                </figure>
              );
            },
            em: ({ children }) => {
              // Check if this is a caption (right after an image)
              const text = String(children);
              if (style) {
                return (
                  <figcaption className="text-center text-[#8A8880] text-sm mt-2 italic">
                    {text}
                  </figcaption>
                );
              }
              return <em>{children}</em>;
            },
            h1: ({ children }) => (
              <h1 className="font-display text-3xl text-[#F2F0EB] mt-8 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-display text-2xl text-[#F2F0EB] mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-xl text-[#F2F0EB] mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-[#D4D0C8] leading-relaxed mb-4">{children}</p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#E8A020] pl-4 my-4 italic text-[#8A8880]">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[#E8A020] hover:text-[#D4911C] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-4 text-[#D4D0C8]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-4 text-[#D4D0C8]">
                {children}
              </ol>
            ),
            code: ({ children, className }) => {
              if (className) {
                return (
                  <code className="block bg-[#0F0F0E] p-4 rounded-sm text-[#E8A020] text-sm overflow-x-auto mb-4">
                    {children}
                  </code>
                );
              }
              return (
                <code className="bg-[#0F0F0E] px-1.5 py-0.5 rounded text-[#E8A020] text-sm">
                  {children}
                </code>
              );
            },
            hr: () => <hr className="border-[#222220] my-8" />,
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div className="space-y-0">
      {/* Dark Theme Overrides for Quill */}
      <style>{`
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #2A2A28 !important; background: #1C1C1A; }
        .ql-editor { 
          background: #0F0F0E; 
          color: #F2F0EB; 
          font-family: 'DM Sans', sans-serif; 
          font-size: 15px;
          min-height: 400px;
        }
        .ql-editor.ql-blank::before { color: #555550; font-style: italic; }
        .ql-snow .ql-stroke { stroke: #8A8880 !important; }
        .ql-snow .ql-fill { fill: #8A8880 !important; }
        .ql-snow .ql-picker { color: #8A8880 !important; }
        .ql-snow.ql-toolbar button:hover .ql-stroke { stroke: #E8A020 !important; }
        .ql-snow.ql-toolbar button:hover .ql-fill { fill: #E8A020 !important; }
        .ql-snow.ql-toolbar .ql-active .ql-stroke { stroke: #E8A020 !important; }
      `}</style>

      {/* Toolbar */}
      <div className="bg-[#1C1C1A] border border-[#2A2A28] rounded-t-sm p-2 flex flex-wrap items-center gap-1">
        <div className="flex bg-[#0F0F0E] p-0.5 rounded-sm mr-2 border border-[#2A2A28]">
          <button
            type="button"
            onClick={() => {
              setEditMode("visual");
              setShowPreview(false);
            }}
            className={`px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${editMode === "visual" ? "bg-[#E8A020] text-[#0F0F0E]" : "text-[#8A8880] hover:text-[#F2F0EB]"}`}
          >
            <Layout size={12} /> Visual
          </button>
          <button
            type="button"
            onClick={() => {
              setEditMode("raw");
              setShowPreview(false);
            }}
            className={`px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${editMode === "raw" ? "bg-[#E8A020] text-[#0F0F0E]" : "text-[#8A8880] hover:text-[#F2F0EB]"}`}
          >
            <Code2 size={12} /> Raw HTML
          </button>
        </div>

        {toolbarActions.map((action, i) => {
          if ("divider" in action) {
            return <div key={i} className="w-px h-6 bg-[#2A2A28] mx-1" />;
          }
          const Icon = action.icon!;
          return (
            <button
              key={i}
              type="button"
              onClick={action.action}
              title={action.label}
              className="p-2 rounded-sm hover:bg-[#2A2A28] text-[#8A8880] hover:text-[#E8A020] transition-colors"
            >
              <Icon size={16} />
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Toggle Preview */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-600 uppercase tracking-wider transition-colors ${
            showPreview
              ? "bg-[#E8A020] text-[#0F0F0E]"
              : "bg-[#2A2A28] text-[#8A8880] hover:text-[#E8A020]"
          }`}
        >
          {showPreview ? <Edit2 size={14} /> : <Eye size={14} />}
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="bg-[#0F0F0E] border border-t-0 border-[#2A2A28] rounded-b-sm p-6 min-h-[400px] overflow-auto">
          <div className="max-w-3xl mx-auto font-serif">
            {value ? (
              renderContent(value)
            ) : (
              <p className="text-[#555550] italic">Nothing to preview yet...</p>
            )}
          </div>
        </div>
      ) : editMode === "visual" ? (
        <div className="visual-editor-container border border-t-0 border-[#2A2A28] rounded-b-sm">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={quillModules}
            placeholder={placeholder || "Start writing your article..."}
            className="quill-dark-wrapper min-h-[400px]"
          />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={maxLength}
          rows={20}
          placeholder={
            placeholder || "Write your article using Markdown or HTML..."
          }
          className="w-full bg-[#0F0F0E] border border-t-0 border-[#2A2A28] text-[#F2F0EB] font-mono text-xs px-4 py-3 rounded-b-sm focus:outline-none focus:border-[#E8A020] transition-colors min-h-[400px] resize-y"
        />
      )}

      {/* Character Count */}
      <div className="text-right">
        <span className="font-ui text-xs text-[#555550]">
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Image Insert Dialog */}
      {imageDialog.open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setImageDialog({ ...imageDialog, open: false })}
        >
          <div
            className="bg-[#1C1C1A] border border-[#2A2A28] rounded-sm p-6 w-full max-w-lg mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-xl text-[#F2F0EB] mb-6">
              Insert Image
            </h3>

            <div className="space-y-4">
              {/* Image URL */}
              <div>
                <label className="block text-[#8A8880] text-sm mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageDialog.url}
                  onChange={e =>
                    setImageDialog({ ...imageDialog, url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-3 py-2 text-[#F2F0EB] text-sm focus:outline-none focus:border-[#E8A020]"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-[#8A8880] text-sm mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={imageDialog.alt}
                  onChange={e =>
                    setImageDialog({ ...imageDialog, alt: e.target.value })
                  }
                  placeholder="Description of the image"
                  className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-3 py-2 text-[#F2F0EB] text-sm focus:outline-none focus:border-[#E8A020]"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-[#8A8880] text-sm mb-1">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={imageDialog.caption}
                  onChange={e =>
                    setImageDialog({ ...imageDialog, caption: e.target.value })
                  }
                  placeholder="Photo credit or description"
                  className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-3 py-2 text-[#F2F0EB] text-sm focus:outline-none focus:border-[#E8A020]"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-[#8A8880] text-sm mb-2">
                  Position
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "left", icon: AlignLeft, label: "Left" },
                    { value: "center", icon: AlignCenter, label: "Center" },
                    { value: "right", icon: AlignRight, label: "Right" },
                    { value: "full", icon: Maximize2, label: "Full Width" },
                  ].map(pos => {
                    const Icon = pos.icon;
                    return (
                      <button
                        key={pos.value}
                        type="button"
                        onClick={() =>
                          setImageDialog({
                            ...imageDialog,
                            position: pos.value as any,
                          })
                        }
                        className={`flex flex-col items-center gap-1 p-3 rounded-sm border transition-colors ${
                          imageDialog.position === pos.value
                            ? "border-[#E8A020] bg-[#E8A020]/10 text-[#E8A020]"
                            : "border-[#222220] text-[#8A8880] hover:border-[#555550]"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs">{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Width */}
              <div>
                <label className="block text-[#8A8880] text-sm mb-1">
                  Width: {imageDialog.width}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={imageDialog.width}
                  onChange={e =>
                    setImageDialog({ ...imageDialog, width: e.target.value })
                  }
                  className="w-full accent-[#E8A020]"
                />
                <div className="flex justify-between text-[#555550] text-xs mt-1">
                  <span>20%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Preview */}
              {imageDialog.url && (
                <div className="border border-[#222220] rounded-sm p-3">
                  <p className="text-[#8A8880] text-xs mb-2">Preview:</p>
                  <div
                    className={`${
                      imageDialog.position === "left"
                        ? "text-left"
                        : imageDialog.position === "right"
                          ? "text-right"
                          : "text-center"
                    }`}
                  >
                    <img
                      src={imageDialog.url}
                      alt={imageDialog.alt}
                      style={{
                        width: `${imageDialog.width}%`,
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                      className={`rounded-sm inline-block`}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {imageDialog.caption && (
                      <p className="text-[#8A8880] text-xs mt-1 italic">
                        {imageDialog.caption}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imageDialog.url}
                className="flex-1 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors disabled:opacity-50"
              >
                Insert Image
              </button>
              <button
                type="button"
                onClick={() => setImageDialog({ ...imageDialog, open: false })}
                className="bg-[#2A2A28] hover:bg-[#333330] text-[#8A8880] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
