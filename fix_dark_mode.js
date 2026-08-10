const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/Sidebar.tsx',
  'src/components/ChatArea.tsx',
  'src/components/ChatInput.tsx',
  'src/components/chat/MessageList.tsx',
  'src/app/layout.tsx'
];

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Refactor hardcoded colors to semantic theme variables
  content = content.replace(/bg-white(\/95|\/90|\/80)?/g, 'bg-background$1');
  content = content.replace(/bg-gray-50/g, 'bg-muted');
  content = content.replace(/text-gray-900/g, 'text-foreground');
  content = content.replace(/text-gray-800/g, 'text-foreground');
  content = content.replace(/text-gray-700/g, 'text-foreground');
  content = content.replace(/border-gray-100/g, 'border-border');
  content = content.replace(/border-gray-200/g, 'border-border');
  content = content.replace(/border-gray-300/g, 'border-border');
  content = content.replace(/bg-[#F8F9FA]/g, 'bg-background');
  content = content.replace(/text-[#202124]/g, 'text-foreground');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed', file);
});
