const fs = require('fs');
const path = require('path');

// Files that need quote fixes based on ESLint output
const filesToFix = [
  'src/app/docs/page.tsx',
  'src/app/features/page.tsx', 
  'src/app/pricing/page.tsx',
  'src/app/support/page.tsx',
  'src/app/terms/page.tsx',
  'src/components/auth/forgot-password-form.tsx',
  'src/components/dashboard/achievements-list.tsx',
  'src/components/dashboard/community-gamification.tsx',
  'src/components/dashboard/journey-history.tsx',
  'src/components/landing/testimonials-section.tsx',
  'src/components/team/team-dashboard.tsx'
];

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix common unescaped quotes in JSX
    content = content.replace(/([^\\])'([^s])/g, '$1&apos;$2');
    content = content.replace(/([^\\])"([^>])/g, '$1&quot;$2');
    content = content.replace(/^'([^s])/gm, '&apos;$1');
    content = content.replace(/^"([^>])/gm, '&quot;$1');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed quotes in ${filePath}`);
  }
});