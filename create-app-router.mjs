import fs from 'fs';
import path from 'path';

const routes = [
  { path: 'page.tsx', compPath: '@/pages/Auth', compName: 'Auth' },
  { path: 'register/page.tsx', compPath: '@/pages/Register', compName: 'Register' },
  { path: 'privacy/page.tsx', compPath: '@/pages/Privacy', compName: 'Privacy' },
  { path: 'terms/page.tsx', compPath: '@/pages/Termandconditions', compName: 'Termandconditions' },
  { path: 'chat/page.tsx', compPath: '@/pages/Index', compName: 'Index' },
  { path: 'phone-verification/page.tsx', compPath: '@/pages/PhoneNumber', compName: 'PhoneNumber' },
  { path: 'otp-verification/page.tsx', compPath: '@/components/auth/OTPVerification', compName: 'OTPVerification' },
  { path: 'jobs/page.tsx', compPath: '@/pages/Jobs', compName: 'Jobs' },
  { path: 'job/[id]/page.tsx', compPath: '@/pages/JobDetail', compName: 'JobDetail' },
  { path: 'profile/page.tsx', compPath: '@/pages/ProfilePage', compName: 'ProfilePage' },
  { path: 'skill-score/[skillId]/page.tsx', compPath: '@/pages/SkillScore', compName: 'SkillScore' },
  { path: 'updates-faq/page.tsx', compPath: '@/pages/UpdatesFaq', compName: 'UpdatesFaq' },
  { path: 'notifications/page.tsx', compPath: '@/pages/Notification', compName: 'Notification' },
  { path: 'reviews/page.tsx', compPath: '@/pages/Reviews', compName: 'Reviews' },
  { path: 'api-docs/page.tsx', compPath: '@/pages/ApiDocs', compName: 'ApiDocs' },
  { path: 'not-found.tsx', compPath: '@/pages/NotFound', compName: 'NotFound' },
];

const protectedRoutes = [
  'chat/page.tsx',
  'otp-verification/page.tsx',
  'jobs/page.tsx',
  'job/[id]/page.tsx',
  'profile/page.tsx',
  'skill-score/[skillId]/page.tsx',
  'updates-faq/page.tsx',
  'notifications/page.tsx',
  'reviews/page.tsx',
  'api-docs/page.tsx'
];

routes.forEach(route => {
  const isProtected = protectedRoutes.includes(route.path);
  
  const fullPath = path.join('./src/app', route.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let content = `import ${route.compName} from "${route.compPath}";\n`;
  
  if (isProtected) {
    content += `import { ProtectedRoute } from "@/components/auth/ProtectedRoute";\n`;
    content += `export default function Page() {\n  return (\n    <ProtectedRoute>\n      <${route.compName} />\n    </ProtectedRoute>\n  );\n}\n`;
  } else if (route.path === 'not-found.tsx') {
    content += `export default function NotFoundPage() {\n  return <${route.compName} />;\n}\n`;
  } else {
    content += `export default function Page() {\n  return <${route.compName} />;\n}\n`;
  }

  fs.writeFileSync(fullPath, content);
});

console.log("App Router pages created successfully.");
