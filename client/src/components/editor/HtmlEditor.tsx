import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HtmlEditorProps {
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  onHtmlChange: (html: string) => void;
  onCssChange: (css: string) => void;
  onJsChange: (js: string) => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ 
  htmlContent = '', 
  cssContent = '', 
  jsContent = '',
  onHtmlChange,
  onCssChange,
  onJsChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>('html');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const updatePreview = () => {
    try {
      // Create a complete HTML document combining all parts
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Base styles to ensure preview looks good */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.5;
              color: #333;
              margin: 0;
              padding: 1rem;
              box-sizing: border-box;
            }
            
            /* User styles */
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              try {
                ${jsContent}
              } catch (e) {
                console.error('Script error:', e);
              }
            });
          </script>
        </body>
        </html>
      `;
      
      setPreviewHtml(fullHtml);
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  };
  
  // Common HTML snippets that can be inserted
  const htmlSnippets = [
    {
      name: 'Div Container',
      code: '<div class="container">\n  <!-- Content here -->\n</div>',
    },
    {
      name: 'Heading Group',
      code: '<h1>Main Heading</h1>\n<h2>Subheading</h2>\n<p>Paragraph text goes here...</p>',
    },
    {
      name: 'Image',
      code: '<img src="https://example.com/image.jpg" alt="Description" class="responsive-image">',
    },
    {
      name: 'Button',
      code: '<button class="btn">Click Me</button>',
    },
    {
      name: 'Link',
      code: '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Visit Website</a>',
    },
    {
      name: 'Unordered List',
      code: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>',
    },
    {
      name: 'Ordered List',
      code: '<ol>\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ol>',
    },
    {
      name: 'Table',
      code: '<table>\n  <thead>\n    <tr>\n      <th>Header 1</th>\n      <th>Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Data 1</td>\n      <td>Data 2</td>\n    </tr>\n  </tbody>\n</table>',
    },
    {
      name: 'Form',
      code: '<form>\n  <div>\n    <label for="name">Name:</label>\n    <input type="text" id="name" name="name" required>\n  </div>\n  <div>\n    <label for="email">Email:</label>\n    <input type="email" id="email" name="email" required>\n  </div>\n  <button type="submit">Submit</button>\n</form>',
    },
    {
      name: 'Flexbox Container',
      code: '<div class="flex-container">\n  <div class="flex-item">Item 1</div>\n  <div class="flex-item">Item 2</div>\n  <div class="flex-item">Item 3</div>\n</div>',
    },
    {
      name: 'Grid Container',
      code: '<div class="grid-container">\n  <div class="grid-item">Item 1</div>\n  <div class="grid-item">Item 2</div>\n  <div class="grid-item">Item 3</div>\n  <div class="grid-item">Item 4</div>\n</div>',
    },
    {
      name: 'Card',
      code: '<div class="card">\n  <img src="https://example.com/image.jpg" alt="Card image" class="card-img">\n  <div class="card-content">\n    <h3>Card Title</h3>\n    <p>Some description text for the card.</p>\n    <button class="card-btn">Learn More</button>\n  </div>\n</div>',
    },
  ];
  
  // Common CSS snippets that can be inserted
  const cssSnippets = [
    {
      name: 'Reset CSS',
      code: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: Arial, sans-serif;\n  line-height: 1.6;\n}',
    },
    {
      name: 'Flexbox Container',
      code: '.flex-container {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n\n.flex-item {\n  flex: 1 1 300px;\n  padding: 1rem;\n}',
    },
    {
      name: 'Grid Container',
      code: '.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}\n\n.grid-item {\n  padding: 1rem;\n  background-color: #f5f5f5;\n  border-radius: 5px;\n}',
    },
    {
      name: 'Button Styles',
      code: '.btn {\n  display: inline-block;\n  padding: 10px 20px;\n  background-color: #4CAF50;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background-color 0.3s;\n}\n\n.btn:hover {\n  background-color: #45a049;\n}',
    },
    {
      name: 'Card Styles',
      code: '.card {\n  width: 300px;\n  border-radius: 8px;\n  overflow: hidden;\n  box-shadow: 0 4px 8px rgba(0,0,0,0.1);\n}\n\n.card-img {\n  width: 100%;\n  height: 200px;\n  object-fit: cover;\n}\n\n.card-content {\n  padding: 1rem;\n}\n\n.card-btn {\n  padding: 8px 16px;\n  background-color: #4CAF50;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  margin-top: 10px;\n}',
    },
    {
      name: 'Responsive Image',
      code: '.responsive-image {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}',
    },
    {
      name: 'Form Styles',
      code: 'form {\n  max-width: 500px;\n  margin: 0 auto;\n}\n\nform div {\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  width: 100%;\n  padding: 8px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n}\n\nbutton[type="submit"] {\n  padding: 10px 20px;\n  background-color: #4CAF50;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}',
    },
    {
      name: 'Media Query',
      code: '@media (max-width: 768px) {\n  /* Styles for screens smaller than 768px */\n  .container {\n    padding: 0 1rem;\n  }\n}\n\n@media (max-width: 480px) {\n  /* Styles for screens smaller than 480px */\n  .container {\n    padding: 0 0.5rem;\n  }\n}',
    },
    {
      name: 'Animations',
      code: '@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n.fade-in {\n  animation: fadeIn 1s ease-in-out;\n}\n\n@keyframes slideIn {\n  from { transform: translateY(20px); opacity: 0; }\n  to { transform: translateY(0); opacity: 1; }\n}\n\n.slide-in {\n  animation: slideIn 0.5s ease-out;\n}',
    },
  ];
  
  // Common JavaScript snippets that can be inserted
  const jsSnippets = [
    {
      name: 'Event Listener',
      code: 'document.addEventListener(\'DOMContentLoaded\', function() {\n  console.log(\'Document is ready!\');\n  // Your initialization code here\n});',
    },
    {
      name: 'Click Handler',
      code: 'const button = document.querySelector(\'.btn\');\nif (button) {\n  button.addEventListener(\'click\', function() {\n    console.log(\'Button clicked!\');\n    // Handle click event here\n  });\n}',
    },
    {
      name: 'Toggle Class',
      code: 'function toggleClass(element, className) {\n  if (element.classList.contains(className)) {\n    element.classList.remove(className);\n  } else {\n    element.classList.add(className);\n  }\n}\n\n// Usage\nconst element = document.querySelector(\'.some-element\');\nif (element) {\n  toggleClass(element, \'active\');\n}',
    },
    {
      name: 'Fetch API',
      code: 'fetch(\'https://api.example.com/data\')\n  .then(response => {\n    if (!response.ok) {\n      throw new Error(\'Network response was not ok\');\n    }\n    return response.json();\n  })\n  .then(data => {\n    console.log(\'Data received:\', data);\n    // Process your data here\n  })\n  .catch(error => {\n    console.error(\'Fetch error:\', error);\n  });',
    },
    {
      name: 'Create Element',
      code: 'function createNewElement(tagName, text, attributes = {}) {\n  const element = document.createElement(tagName);\n  if (text) {\n    element.textContent = text;\n  }\n  \n  Object.entries(attributes).forEach(([key, value]) => {\n    element.setAttribute(key, value);\n  });\n  \n  return element;\n}\n\n// Usage\nconst newParagraph = createNewElement(\'p\', \'This is a new paragraph\', { \'class\': \'text-content\', \'id\': \'new-para\' });\ndocument.body.appendChild(newParagraph);',
    },
    {
      name: 'Form Validation',
      code: 'const form = document.querySelector(\'form\');\nif (form) {\n  form.addEventListener(\'submit\', function(event) {\n    event.preventDefault();\n    \n    const nameInput = document.getElementById(\'name\');\n    const emailInput = document.getElementById(\'email\');\n    let isValid = true;\n    \n    if (!nameInput.value.trim()) {\n      console.error(\'Name is required\');\n      isValid = false;\n    }\n    \n    if (!emailInput.value.trim() || !emailInput.value.includes(\'@\')) {\n      console.error(\'Valid email is required\');\n      isValid = false;\n    }\n    \n    if (isValid) {\n      console.log(\'Form is valid, submitting...\');\n      // form.submit();\n    }\n  });\n}',
    },
    {
      name: 'Scroll Animation',
      code: 'window.addEventListener(\'scroll\', function() {\n  const scrollElements = document.querySelectorAll(\'.scroll-animate\');\n  \n  scrollElements.forEach(element => {\n    const elementPosition = element.getBoundingClientRect().top;\n    const windowHeight = window.innerHeight;\n    \n    if (elementPosition < windowHeight * 0.8) {\n      element.classList.add(\'visible\');\n    }\n  });\n});',
    },
    {
      name: 'LocalStorage Functions',
      code: 'function saveToLocalStorage(key, value) {\n  try {\n    localStorage.setItem(key, JSON.stringify(value));\n    return true;\n  } catch (error) {\n    console.error(\'Error saving to LocalStorage:\', error);\n    return false;\n  }\n}\n\nfunction getFromLocalStorage(key) {\n  try {\n    const item = localStorage.getItem(key);\n    return item ? JSON.parse(item) : null;\n  } catch (error) {\n    console.error(\'Error getting from LocalStorage:\', error);\n    return null;\n  }\n}',
    },
  ];
  
  const insertSnippet = (snippet: string, editor: 'html' | 'css' | 'js') => {
    switch (editor) {
      case 'html':
        onHtmlChange(htmlContent + (htmlContent ? '\n' : '') + snippet);
        break;
      case 'css':
        onCssChange(cssContent + (cssContent ? '\n' : '') + snippet);
        break;
      case 'js':
        onJsChange(jsContent + (jsContent ? '\n' : '') + snippet);
        break;
    }
  };
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updatePreview();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [htmlContent, cssContent, jsContent]);
  
  const renderHtmlTab = () => (
    <div className="space-y-4 p-3">
      <Textarea
        value={htmlContent}
        onChange={(e) => onHtmlChange(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
        placeholder="Enter HTML here..."
      />
      
      <div>
        <Label className="text-sm font-medium">Common HTML Snippets</Label>
        <ScrollArea className="h-[200px] border rounded-md mt-2">
          <div className="p-2 space-y-2">
            {htmlSnippets.map((snippet, index) => (
              <div key={index} className="bg-muted/50 rounded-md p-2 cursor-pointer hover:bg-muted" onClick={() => insertSnippet(snippet.code, 'html')}>
                <div className="font-medium text-xs">{snippet.name}</div>
                <div className="text-xs text-muted-foreground mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {snippet.code.split('\n')[0]}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
  
  const renderCssTab = () => (
    <div className="space-y-4 p-3">
      <Textarea
        value={cssContent}
        onChange={(e) => onCssChange(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
        placeholder="Enter CSS here..."
      />
      
      <div>
        <Label className="text-sm font-medium">Common CSS Snippets</Label>
        <ScrollArea className="h-[200px] border rounded-md mt-2">
          <div className="p-2 space-y-2">
            {cssSnippets.map((snippet, index) => (
              <div key={index} className="bg-muted/50 rounded-md p-2 cursor-pointer hover:bg-muted" onClick={() => insertSnippet(snippet.code, 'css')}>
                <div className="font-medium text-xs">{snippet.name}</div>
                <div className="text-xs text-muted-foreground mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {snippet.code.split('\n')[0]}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
  
  const renderJsTab = () => (
    <div className="space-y-4 p-3">
      <Textarea
        value={jsContent}
        onChange={(e) => onJsChange(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
        placeholder="Enter JavaScript here..."
      />
      
      <div>
        <Label className="text-sm font-medium">Common JavaScript Snippets</Label>
        <ScrollArea className="h-[200px] border rounded-md mt-2">
          <div className="p-2 space-y-2">
            {jsSnippets.map((snippet, index) => (
              <div key={index} className="bg-muted/50 rounded-md p-2 cursor-pointer hover:bg-muted" onClick={() => insertSnippet(snippet.code, 'js')}>
                <div className="font-medium text-xs">{snippet.name}</div>
                <div className="text-xs text-muted-foreground mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {snippet.code.split('\n')[0]}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
  
  const renderPreviewTab = () => (
    <div className="p-3 space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="border rounded-md overflow-hidden">
        <iframe
          srcDoc={previewHtml}
          title="HTML Preview"
          className="w-full h-[500px] bg-white"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="html" className="m-0 p-0 h-full">
            {renderHtmlTab()}
          </TabsContent>
          
          <TabsContent value="css" className="m-0 p-0 h-full">
            {renderCssTab()}
          </TabsContent>
          
          <TabsContent value="js" className="m-0 p-0 h-full">
            {renderJsTab()}
          </TabsContent>
          
          <TabsContent value="preview" className="m-0 p-0 h-full">
            {renderPreviewTab()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default HtmlEditor;