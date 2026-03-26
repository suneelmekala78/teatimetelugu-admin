"use client";

import { useRef, useCallback } from "react";
import { Node } from "@tiptap/core";
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImageIcon,
  Upload,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Video,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadApi } from "@/lib/api";

/* ── SVG Icons for social platforms ──────────────────────────────── */

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  );
}

/* ── Custom Tiptap Nodes ─────────────────────────────────────────── */

/* --- Iframe with React NodeView for labeled preview --- */

function IframeNodeView({ node }: { node: { attrs: { src: string } } }) {
  const src = node.attrs.src || "";
  let label = "Embed";
  let labelColor = "bg-gray-500";
  let icon: React.ReactNode = null;

  if (src.includes("youtube.com/embed")) {
    label = "YouTube Video";
    labelColor = "bg-red-600";
    icon = <YouTubeIcon className="h-3.5 w-3.5" />;
  } else if (src.includes("twitter.com") || src.includes("x.com")) {
    label = "X / Twitter Post";
    labelColor = "bg-black dark:bg-white dark:text-black";
    icon = <XTwitterIcon className="h-3.5 w-3.5" />;
  } else if (src.includes("instagram.com")) {
    label = "Instagram Post";
    labelColor = "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500";
    icon = <InstagramIcon className="h-3.5 w-3.5" />;
  }

  return (
    <NodeViewWrapper className="my-4">
      <div className="relative rounded-lg overflow-hidden border border-border/50 shadow-sm">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white ${labelColor}`}>
          {icon}
          {label}
        </div>
        <iframe
          src={src}
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-full border-0"
          style={{ height: src.includes("instagram.com") ? "500px" : "400px" }}
        />
      </div>
    </NodeViewWrapper>
  );
}

const IframeNode = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      frameborder: { default: "0" },
      allowfullscreen: { default: "true" },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      },
    };
  },
  parseHTML() {
    return [{ tag: "iframe" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      {
        ...HTMLAttributes,
        style:
          "width: 100%; height: 400px; border: none; border-radius: 8px;",
      },
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(IframeNodeView);
  },
});

/* --- Video with React NodeView for labeled preview --- */

function VideoNodeView({ node }: { node: { attrs: { src: string } } }) {
  return (
    <NodeViewWrapper className="my-4">
      <div className="relative rounded-lg overflow-hidden border border-border/50 shadow-sm">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600">
          <Video className="h-3.5 w-3.5" />
          Video
        </div>
        <video
          src={node.attrs.src}
          controls
          className="w-full"
        />
      </div>
    </NodeViewWrapper>
  );
}

const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: "true" },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      {
        ...HTMLAttributes,
        controls: "",
        style: "width: 100%; border-radius: 8px;",
      },
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

/* ── URL Parsers ─────────────────────────────────────────────────── */

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

function parseInstagramCode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/* ── Component ───────────────────────────────────────────────────── */

interface RichEditorProps {
  content: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border/50 shadow-sm my-4 max-w-full",
        },
      }),
      IframeNode,
      VideoNode,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
  });

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setIsUploading(true);
      try {
        const { data } = await uploadApi.single(file, "news");
        editor.chain().focus().setImage({ src: data.file.url }).run();
        toast.success("Image uploaded");
      } catch {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
        // Reset file input
        if (imageInputRef.current) imageInputRef.current.value = "";
      }
    },
    [editor],
  );

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", active && "bg-muted")}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  const LabeledToolbarButton = ({
    onClick,
    icon,
    label,
    title,
    className: btnClassName,
  }: {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    title?: string;
    className?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("h-8 gap-1.5 px-2.5 text-xs font-medium", btnClassName)}
      onClick={onClick}
      title={title}
    >
      {icon}
      {label}
    </Button>
  );

  const isValidUrl = (input: string): boolean => {
    try {
      const parsed = new URL(input);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL (https://...)");
    if (url) {
      if (!isValidUrl(url)) {
        alert("Please enter a valid http or https URL.");
        return;
      }
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImageByUrl = () => {
    const url = window.prompt("Enter image URL (https://...)");
    if (url) {
      if (!isValidUrl(url)) {
        alert("Please enter a valid http or https URL.");
        return;
      }
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYouTube = () => {
    const url = window.prompt("Enter YouTube video URL");
    if (!url) return;
    const videoId = parseYouTubeId(url);
    if (!videoId) {
      alert(
        "Invalid YouTube URL. Please paste a valid YouTube video link.\nExample: https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "iframe",
        attrs: { src: `https://www.youtube.com/embed/${videoId}` },
      })
      .run();
  };

  const addVideo = () => {
    const url = window.prompt("Enter video URL (https://...)");
    if (!url) return;
    if (!isValidUrl(url)) {
      alert("Please enter a valid http or https URL.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({ type: "video", attrs: { src: url } })
      .run();
  };

  const addTweet = () => {
    const url = window.prompt("Enter Twitter/X post URL");
    if (!url) return;
    const tweetId = parseTweetId(url);
    if (!tweetId) {
      alert(
        "Invalid Twitter/X URL. Please paste a valid tweet link.\nExample: https://x.com/username/status/123456789",
      );
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "iframe",
        attrs: {
          src: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
        },
      })
      .run();
  };

  const addInstagram = () => {
    const url = window.prompt("Enter Instagram post or reel URL");
    if (!url) return;
    const code = parseInstagramCode(url);
    if (!code) {
      alert(
        "Invalid Instagram URL. Please paste a valid post or reel link.\nExample: https://www.instagram.com/p/ABC123/",
      );
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "iframe",
        attrs: { src: `https://www.instagram.com/p/${code}/embed/` },
      })
      .run();
  };

  return (
    <div className={cn("rounded-md border", className)}>
      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageUpload}
        disabled={isUploading}
      />

      <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5">
        {/* Text formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists & blockquote */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Add Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-full h-px bg-border my-0.5" />

        {/* Media & embeds row with clear labels */}
        <LabeledToolbarButton
          onClick={() => imageInputRef.current?.click()}
          icon={isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          label="Upload Image"
          title="Upload an image from your computer"
        />
        <LabeledToolbarButton
          onClick={addImageByUrl}
          icon={<ImageIcon className="h-3.5 w-3.5" />}
          label="Image URL"
          title="Add image by URL"
        />
        <LabeledToolbarButton
          onClick={addVideo}
          icon={<Video className="h-3.5 w-3.5" />}
          label="Video URL"
          title="Embed video by URL"
        />

        <div className="w-px h-6 bg-border mx-1" />

        <LabeledToolbarButton
          onClick={addYouTube}
          icon={<YouTubeIcon className="h-3.5 w-3.5" />}
          label="YouTube"
          title="Embed YouTube video"
          className="text-red-600 hover:text-red-700"
        />
        <LabeledToolbarButton
          onClick={addTweet}
          icon={<XTwitterIcon className="h-3.5 w-3.5" />}
          label="X / Twitter"
          title="Embed X/Twitter post"
        />
        <LabeledToolbarButton
          onClick={addInstagram}
          icon={<InstagramIcon className="h-3.5 w-3.5" />}
          label="Instagram"
          title="Embed Instagram post"
          className="text-pink-600 hover:text-pink-700"
        />
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap_img]:rounded-lg [&_.tiptap_img]:border [&_.tiptap_img]:border-border/50 [&_.tiptap_img]:shadow-sm [&_.tiptap_img]:my-4"
      />
    </div>
  );
}
