const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const docsDir = path.join(__dirname, 'Docs');

// Function to convert HTML to basic Markdown
function htmlToMarkdown(html) {
  let md = html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')
    // Bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Line breaks and paragraphs
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
  
  return md;
}

// Get all .docx files
fs.readdir(docsDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const docxFiles = files.filter(f => f.endsWith('.docx'));
  let converted = 0;
  let failed = 0;

  docxFiles.forEach(file => {
    const docxPath = path.join(docsDir, file);
    const mdFileName = file.replace(/\.docx$/i, '.md');
    const mdPath = path.join(docsDir, mdFileName);

    mammoth.convertToHtml({ path: docxPath })
      .then(result => {
        const markdown = htmlToMarkdown(result.value);
        fs.writeFileSync(mdPath, markdown, 'utf8');
        console.log(`✓ Converted: ${file} → ${mdFileName}`);
        converted++;
        if (converted + failed === docxFiles.length) {
          console.log(`\nConversion complete: ${converted} files converted, ${failed} failed.`);
        }
      })
      .catch(err => {
        console.error(`✗ Failed to convert ${file}:`, err.message);
        failed++;
        if (converted + failed === docxFiles.length) {
          console.log(`\nConversion complete: ${converted} files converted, ${failed} failed.`);
        }
      });
  });
});
