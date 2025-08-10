// Simple React-like template rendering as a string builder to avoid SSR in the browser

export type TemplateRenderInput = {
  twitter: string[];
  instagram: string[];
  youtube: string[];
  images: Array<{ url: string; postText?: string }>;
};

export type ReactTemplate = {
  id: string;
  name: string;
  render: (input: TemplateRenderInput) => string;
};

const baseStyle = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; color: #111827; background: #ffffff; }
  .container { max-width: 720px; margin: 0 auto; padding: 24px; }
  h2 { margin: 0 0 12px; font-size: 20px; }
  h3 { margin: 16px 0 8px; font-size: 16px; }
  p { margin: 6px 0; line-height: 1.5; }
  .section { margin-bottom: 20px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  img { width: 100%; height: auto; display: block; border-radius: 6px; }
`;

export const ReactTemplates: ReactTemplate[] = [
  {
    id: 'react_simple',
    name: 'Simple React Template',
    render: ({ twitter, instagram, youtube, images }) => {
      const section = (title: string, items: string[]) => `
        <div class="section">
          <h3>${title}</h3>
          ${items.length ? items.map(t => `<p>• ${t}</p>`).join('') : '<p>No content available.</p>'}
        </div>`;
      const gallery = images.length
        ? `<div class="section"><h3>Gallery</h3><div class="grid">${images
            .slice(0, 9)
            .map(img => `<img src="${img.url}" alt="" loading="lazy"/>`)
            .join('')}</div></div>`
        : '';
      return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${baseStyle}</style></head><body><div class="container"><h2>Your Weekly Update</h2>${section('Twitter Highlights', twitter)}${section('Instagram Highlights', instagram)}${section('YouTube Highlights', youtube)}${gallery}</div></body></html>`;
    },
  },
];

export function getReactTemplateById(id: string): ReactTemplate | undefined {
  return ReactTemplates.find(t => t.id === id);
}


