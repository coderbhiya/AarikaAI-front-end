import fs from 'fs';
import path from 'path';

const file = 'src/components/common/Markdown.tsx';
const fullPath = path.join(process.cwd(), file);
if (fs.existsSync(fullPath)) {
  let content = fs.readFileSync(fullPath, 'utf8');
  
  content = content.replace(/text-\[#0f0f0f\]/g, 'text-foreground');
  content = content.replace(/text-\[#1A1A1A\]/g, 'text-foreground/90');
  content = content.replace(/text-gray-500/g, 'text-muted-foreground');
  content = content.replace(/bg-gray-100\/80/g, 'bg-muted/80');
  content = content.replace(/border-gray-200\/50/g, 'border-border/50');
  content = content.replace(/border-gray-300/g, 'border-border');
  content = content.replace(/bg-slate-50\/50/g, 'bg-muted/50');
  content = content.replace(/bg-slate-50/g, 'bg-muted');
  content = content.replace(/bg-white/g, 'bg-background');
  content = content.replace(/text-slate-900/g, 'text-foreground');
  content = content.replace(/text-slate-500/g, 'text-muted-foreground');
  content = content.replace(/border-slate-200/g, 'border-border');
  content = content.replace(/border-slate-100/g, 'border-border');
  content = content.replace(/divide-slate-200/g, 'divide-border');
  content = content.replace(/divide-slate-100/g, 'divide-border');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed Markdown.tsx');
}
