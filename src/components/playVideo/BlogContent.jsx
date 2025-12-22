import React, { useEffect, useState } from "react";
import { getUersContent } from "../../utils/hiveUtils";
import "./BlogContent.scss";

// Lazy-loaded renderer to avoid Node.js polyfill issues at bundle time
let rendererPromise = null;
const getRenderer = async () => {
  if (!rendererPromise) {
    rendererPromise = import('@snapie/renderer').then(({ createHiveRenderer }) => {
      return createHiveRenderer({
        ipfsGateway: 'https://ipfs-3speak.b-cdn.net',
        ipfsFallbackGateways: [
          'https://ipfs.skatehive.app',
          'https://cloudflare-ipfs.com',
          'https://ipfs.io'
        ],
        convertHiveUrls: true,
        internalUrlPrefix: '',
        usertagUrlFn: (account) => `/p/${account}`,
        hashtagUrlFn: (tag) => `/t/${tag}`,
      });
    });
  }
  return rendererPromise;
};

const BlogContent = ({ author, permlink, description }) => {
  const [content, setContent] = useState("");
  const [renderedContent, setRenderedContent] = useState("");

  // Function to remove 3Speak video header from post body
  // Posts typically start with: <center>thumbnail + Watch on 3Speak link</center>---
  const cleanContent = (htmlString) => {
    let cleaned = htmlString;

    // Remove the 3Speak header block (multiple patterns to catch variations)
    // Pattern 1: The rendered video embed link with thumbnail
    cleaned = cleaned.replace(
      /<p[^>]*>[\s]*<a[^>]*class="[^"]*markdown-video-link[^"]*"[^>]*data-embed-src="https:\/\/3speak\.tv\/embed[^"]*"[^>]*>[\s\S]*?<\/a>[\s]*<\/p>/gi,
      ''
    );

    // Pattern 2: Center block with 3Speak thumbnail/link (markdown converted to HTML)
    cleaned = cleaned.replace(
      /<center>[\s\S]*?3speak\.tv[\s\S]*?<\/center>/gi,
      ''
    );

    // Pattern 3: "Watch on 3Speak" link with play emoji
    cleaned = cleaned.replace(
      /<p[^>]*>[\s]*[▶️]*[\s]*<a[^>]*href="https:\/\/3speak\.tv\/watch[^"]*"[^>]*>[\s]*Watch on 3Speak[\s]*<\/a>[\s]*<\/p>/gi,
      ''
    );

    // Pattern 4: Standalone "Watch on 3Speak" links
    cleaned = cleaned.replace(
      /▶️[\s]*<a[^>]*href="https:\/\/3speak\.tv\/watch[^"]*"[^>]*>[^<]*<\/a>/gi,
      ''
    );

    // Pattern 5: Remove leading <hr> (---) that separates header from content
    cleaned = cleaned.replace(/^[\s]*<hr[^>]*\/?>/i, '');
    
    // Also remove <hr> right after we stripped the header
    cleaned = cleaned.replace(/^[\s]*<hr[^>]*\/?>/i, '');

    // Remove "Uploaded using 3Speak Mobile App" footer
    cleaned = cleaned.replace(
      /<sub>[\s]*Uploaded using 3Speak[^<]*<\/sub>/gi,
      ''
    );

    // Remove any orphaned empty paragraphs
    cleaned = cleaned.replace(/<p[^>]*>[\s]*<\/p>/g, '');

    // Trim leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  };

  async function getPostDescription(author, permlink) {
    const data = await getUersContent(author, permlink);
    return data.body;
  }

  useEffect(() => {
    async function fetchContent() {
      if (description) {
        // Use provided description (upload preview)
        setContent(description);
      } else if (author && permlink) {
        // Fallback: fetch from Hive
        const postContent = await getPostDescription(author, permlink);
        setContent(postContent || "No content available");
      }
    }

    fetchContent();
  }, [author, permlink, description]);

  useEffect(() => {
    if (content) {
      const contentString =
        typeof content === "string"
          ? content
          : Array.isArray(content)
          ? content.join("\n")
          : "";

      // Use async renderer (createHiveRenderer returns a function directly)
      getRenderer().then(render => {
        try {
          let renderedHTML = render(contentString);
          // Clean the rendered HTML before setting it
          renderedHTML = cleanContent(renderedHTML);
          setRenderedContent(renderedHTML);
        } catch (error) {
          console.error("Error rendering post body:", error);
          setRenderedContent("Error processing content.");
        }
      }).catch(error => {
        console.error("Error loading renderer:", error);
        setRenderedContent("Error loading renderer.");
      });
    }
  }, [content]);

  return (
    <div
      className="markdown-view"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default BlogContent;