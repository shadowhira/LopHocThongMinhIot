const fs = require('fs');
const path = require('path');

// Đường dẫn tới thư mục src
const srcDir = path.join(__dirname, '..', 'src');

// Hàm đọc tất cả các file trong thư mục và các thư mục con
function readFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      readFilesRecursively(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Hàm sửa đường dẫn import trong file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Sửa đường dẫn import từ @/ thành đường dẫn tương đối
  const importRegex = /import\s+(?:(?:{[^}]*})|(?:[^{}\s]+))\s+from\s+['"]@\/([^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    modified = true;
    
    // Tính toán đường dẫn tương đối
    const fileDir = path.dirname(filePath);
    const relativeDir = path.relative(fileDir, srcDir);
    const relativePath = relativeDir ? `${relativeDir}/${importPath}` : importPath;
    
    return match.replace(`@/${importPath}`, relativePath);
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in ${filePath}`);
  }
}

// Đọc tất cả các file và sửa đường dẫn import
const files = readFilesRecursively(srcDir);
files.forEach(fixImportsInFile);

console.log(`Fixed imports in ${files.length} files`);
