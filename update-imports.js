const fs = require('fs');
const path = require('path');

// Mapeamento de imports antigos para novos
const importMappings = {
  "import { Card } from '@/components/ui/Card';": "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';",
  "import { Button } from '@/components/ui/Button';": "import { Button } from '@/components/ui/button';",
  "import Button from '@/components/ui/Button';": "import { Button } from '@/components/ui/button';",
  "import Input from '@/components/ui/Input';": "import { Input } from '@/components/ui/input';",
  "import { Textarea } from '@/components/ui/Textarea';": "import { Textarea } from '@/components/ui/textarea';",
  "import Modal from '@/components/ui/Modal';": "import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';",
  "import { Modal } from '@/components/ui/Modal';": "import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';",
  "import AnimatedContainer from '@/components/ui/AnimatedContainer';": "import { AnimatedContainer } from '@/components/ui/AnimatedContainer';",
  "import { AnimatedContainer } from '@/components/ui/AnimatedContainer';": "import { AnimatedContainer } from '@/components/ui/AnimatedContainer';"
};

// Função para atualizar um arquivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Aplicar todas as substituições
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
        updated = true;
      }
    }
    
    // Substituições adicionais com regex
    const regexMappings = [
      {
        pattern: /import \{ Card, CardContent, CardHeader, CardTitle \} from '@\/components\/ui\/Card';/g,
        replacement: "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';"
      },
      {
        pattern: /from '@\/components\/ui\/Card';/g,
        replacement: "from '@/components/ui/card';"
      },
      {
        pattern: /from '@\/components\/ui\/Button';/g,
        replacement: "from '@/components/ui/button';"
      },
      {
        pattern: /from '@\/components\/ui\/Input';/g,
        replacement: "from '@/components/ui/input';"
      },
      {
        pattern: /from '@\/components\/ui\/Textarea';/g,
        replacement: "from '@/components/ui/textarea';"
      },
      {
        pattern: /from '@\/components\/ui\/Table';/g,
        replacement: "from '@/components/ui/table';"
      }
    ];
    
    regexMappings.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Atualizado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para percorrer diretórios recursivamente
function walkDirectory(dir, fileExtensions = ['.tsx', '.ts']) {
  const files = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pular node_modules e outras pastas desnecessárias
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (fileExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

// Executar o script
function main() {
  const srcDir = path.join(__dirname, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Diretório src não encontrado!');
    return;
  }
  
  console.log('🔄 Iniciando atualização de imports...');
  
  const files = walkDirectory(srcDir);
  let updatedCount = 0;
  
  for (const file of files) {
    if (updateFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✨ Concluído! ${updatedCount} arquivos atualizados de ${files.length} processados.`);
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, walkDirectory };