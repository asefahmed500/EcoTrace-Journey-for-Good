const fs = require('fs');

// Fix specific quote issues found by ESLint
const fixes = [
  {
    file: 'src/app/cookies/page.tsx',
    line: 29,
    find: "you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms. For example, we use a cookie to maintain your session when you're logged in.",
    replace: "you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms. For example, we use a cookie to maintain your session when you&apos;re logged in."
  },
  {
    file: 'src/app/pricing/page.tsx',
    line: 67,
    find: "Let's discuss your specific needs",
    replace: "Let&apos;s discuss your specific needs"
  },
  {
    file: 'src/app/support/page.tsx',
    line: 42,
    find: "We're here to help you make the most of EcoTrace",
    replace: "We&apos;re here to help you make the most of EcoTrace"
  },
  {
    file: 'src/app/support/page.tsx',
    line: 78,
    find: "Can't find what you're looking for?",
    replace: "Can&apos;t find what you&apos;re looking for?"
  },
  {
    file: 'src/components/auth/forgot-password-form.tsx',
    line: 34,
    find: "We'll send you a password reset link if an account exists",
    replace: "We&apos;ll send you a password reset link if an account exists"
  },
  {
    file: 'src/components/dashboard/achievements-list.tsx',
    line: 17,
    find: "You haven't earned any achievements yet",
    replace: "You haven&apos;t earned any achievements yet"
  },
  {
    file: 'src/components/dashboard/journey-history.tsx',
    line: 145,
    find: "You haven't logged any journeys yet",
    replace: "You haven&apos;t logged any journeys yet"
  }
];

fixes.forEach(fix => {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    if (content.includes(fix.find)) {
      content = content.replace(fix.find, fix.replace);
      fs.writeFileSync(fix.file, content);
      console.log(`Fixed ${fix.file}`);
    } else {
      console.log(`Pattern not found in ${fix.file}: ${fix.find}`);
    }
  }
});