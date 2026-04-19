import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('react-router-dom')) {
    changed = true;
    
    // Check if it uses Navigate
    if (content.includes('Navigate')) {
      // Ensure Navigate is removed from react-router-dom imports
      // and imported from our new polyfill
      content = content.replace(/import\s+{([^}]*)}\s+from\s+["']react-router-dom["'];?/, (match, p1) => {
        let imports = p1.split(',').map(s => s.trim());
        let newImports = imports.filter(i => i !== 'Navigate' && i !== 'Link');
        let addition = '';
        if (imports.includes('Navigate')) {
          addition += `\nimport { Navigate } from "@/components/Navigate";`;
        }
        if (imports.includes('Link')) {
          addition += `\nimport Link from "next/link";`;
        }
        
        if (newImports.length > 0) {
          return `import { ${newImports.join(', ')} } from "react-router-dom";${addition}`;
        } else {
          return addition.trim();
        }
      });
    }

    // Now replace react-router-dom with next/navigation for remaining
    content = content.replace(/import\s+{([^}]*)}\s+from\s+["']react-router-dom["'];?/, (match, p1) => {
        let imports = p1.split(',').map(s => s.trim());
        let nextNavImports = [];
        let nextLink = false;
        
        imports.forEach(i => {
           if (i === 'useNavigate') nextNavImports.push('useRouter');
           else if (i === 'useLocation') nextNavImports.push('usePathname');
           else if (i === 'useParams') nextNavImports.push('useParams');
           else if (i === 'Link') nextLink = true;
        });
        
        let repl = '';
        if (nextNavImports.length > 0) {
            repl += `import { ${nextNavImports.join(', ')} } from "next/navigation";\n`;
        }
        if (nextLink) {
            repl += `import Link from "next/link";\n`;
        }
        return repl.trim();
    });

    // Replace usage
    content = content.replace(/useNavigate/g, 'useRouter');
    content = content.replace(/useLocation/g, 'usePathname');
    content = content.replace(/location\.pathname/g, 'pathname');
    // For location.state.from we might have issues but let's see. Need to adjust those manually.
  }

  // Add "use client" if it has Next hooks
  if ((content.includes('next/navigation') || content.includes('next/link') || content.includes('"@/contexts/') || content.includes('@/components/ui/')) && !content.startsWith('"use client"')) {
    content = `"use client";\n\n` + content;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
});

console.log("Migration script complete.");
