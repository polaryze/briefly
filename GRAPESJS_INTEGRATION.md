# GrapesJS Integration

This project now includes GrapesJS, a powerful visual web builder, integrated into the existing Vite + React application.

## 🚀 Quick Start

### Installation
The required packages have been installed:
```bash
npm install grapesjs grapesjs-react
```

### Available Routes
- `/grapes-editor` - Basic GrapesJS editor demo
- `/grapes-editor-advanced` - Advanced GrapesJS editor with full features

## 📁 Components

### 1. Basic GrapesEditor (`src/components/GrapesEditor.tsx`)
A simple GrapesJS editor component with basic functionality.

**Props:**
- `initialHtml?: string` - Initial HTML content
- `onUpdate?: (data: { html: string; css: string }) => void` - Callback when content changes

**Usage:**
```tsx
import GrapesEditor from '@/components/GrapesEditor';

<GrapesEditor 
  initialHtml="<div>Hello World</div>"
  onUpdate={(data) => console.log(data.html, data.css)}
/>
```

### 2. Advanced GrapesEditor (`src/components/GrapesEditorAdvanced.tsx`)
A fully-featured GrapesJS editor with customizable panels and advanced features.

**Props:**
- `initialHtml?: string` - Initial HTML content
- `initialCss?: string` - Initial CSS content
- `onUpdate?: (data: { html: string; css: string }) => void` - Callback when content changes
- `height?: string` - Editor height (default: '100vh')
- `width?: string` - Editor width (default: 'auto')
- `showToolbar?: boolean` - Show toolbar (default: true)
- `showPanels?: boolean` - Show panels (default: true)
- `showLayers?: boolean` - Show layer manager (default: true)
- `showStyles?: boolean` - Show style manager (default: true)
- `showBlocks?: boolean` - Show block manager (default: true)

**Usage:**
```tsx
import GrapesEditorAdvanced from '@/components/GrapesEditorAdvanced';

<GrapesEditorAdvanced 
  initialHtml="<div>Hello World</div>"
  initialCss="body { margin: 0; }"
  onUpdate={(data) => console.log(data.html, data.css)}
  showPanels={true}
  showToolbar={true}
  height="80vh"
/>
```

## 🎨 Features

### Basic Editor Features
- ✅ Visual HTML/CSS editor
- ✅ Drag & drop components
- ✅ Real-time preview
- ✅ Content update callbacks

### Advanced Editor Features
- ✅ **Device Manager** - Preview on different screen sizes
- ✅ **Layer Manager** - Organize and manage components
- ✅ **Style Manager** - Visual CSS editing with property controls
- ✅ **Block Manager** - Pre-built components library
- ✅ **Panel Controls** - Show/hide different panels
- ✅ **Bootstrap Integration** - Built-in Bootstrap support
- ✅ **Custom Blocks** - Pre-defined component blocks

## 🔧 Configuration

### GrapesJS Configuration Options
The advanced editor includes comprehensive configuration:

```javascript
const editor = grapesjs.init({
  container: editorRef.current,
  fromElement: false,
  height: '100vh',
  width: 'auto',
  storageManager: false,
  components: initialHtml,
  style: initialCss,
  
  // Device manager for responsive design
  deviceManager: {
    devices: [
      { name: 'Desktop', width: '' },
      { name: 'Tablet', width: '768px' },
      { name: 'Mobile', width: '320px' },
    ],
  },
  
  // Style manager with custom properties
  styleManager: {
    sectors: [
      {
        name: 'Typography',
        properties: ['font-family', 'font-size', 'color'],
      },
    ],
  },
  
  // Block manager with custom blocks
  blockManager: {
    blocks: [
      {
        id: 'section',
        label: 'Section',
        content: '<section><h2>Section</h2></section>',
      },
    ],
  },
});
```

## 📱 Demo Pages

### Basic Demo (`/grapes-editor`)
- Simple editor interface
- Basic HTML editing
- Real-time content updates
- Console logging of changes

### Advanced Demo (`/grapes-editor-advanced`)
- Full-featured editor
- Interactive controls for showing/hiding panels
- Real-time HTML/CSS output preview
- Comprehensive block library
- Device preview modes

## 🛠️ Customization

### Adding Custom Blocks
```javascript
// In GrapesEditorAdvanced.tsx
blockManager: {
  blocks: [
    {
      id: 'custom-block',
      label: 'Custom Block',
      content: '<div class="custom-block">Your content</div>',
      attributes: { class: 'custom-block' },
    },
  ],
},
```

### Adding Custom Style Properties
```javascript
// In GrapesEditorAdvanced.tsx
styleManager: {
  sectors: [
    {
      name: 'Custom',
      properties: [
        {
          id: 'custom-property',
          type: 'integer',
          units: ['px', '%'],
          defaults: '0',
        },
      ],
    },
  ],
},
```

## 🔄 Integration with Newsletter Builder

The GrapesJS editor can be integrated with the existing newsletter builder:

1. **Replace AINewsletterRenderer** - Use GrapesJS for visual editing
2. **Export HTML/CSS** - Get generated content for newsletters
3. **Template System** - Create newsletter templates with GrapesJS
4. **Real-time Preview** - See changes as you edit

## 🚀 Next Steps

1. **Integrate with Newsletter Builder** - Replace the current preview system
2. **Add Newsletter Templates** - Create pre-built newsletter blocks
3. **Export Functionality** - Add export to PDF/email formats
4. **Save/Load System** - Implement content persistence
5. **Collaboration Features** - Add real-time collaboration

## 📚 Resources

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [GrapesJS React Integration](https://github.com/artf/grapesjs-react)
- [GrapesJS Plugins](https://grapesjs.com/plugins/)

## 🐛 Troubleshooting

### Common Issues
1. **TypeScript Errors** - Use `as any` for GrapesJS events
2. **CSS Conflicts** - Ensure GrapesJS CSS is loaded
3. **Panel Positioning** - Check container positioning
4. **Memory Leaks** - Always call `editor.destroy()` in cleanup

### Build Issues
- Ensure all dependencies are installed
- Check for CSS import conflicts
- Verify TypeScript configurations 