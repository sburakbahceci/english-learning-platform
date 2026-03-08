import DOMPurify from 'dompurify';

interface HTMLContentProps {
  content: string;
  className?: string;
}

export default function HTMLContent({
  content,
  className = '',
}: HTMLContentProps) {
  // XSS koruması için DOMPurify kullan
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['span', 'strong', 'em', 'u', 'br', 'p', 'ul', 'li', 'ol'],
    ALLOWED_ATTR: ['class'],
  });

  return (
    <div
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
