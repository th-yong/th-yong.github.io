import fs from 'fs'
import path from 'path'

export function readMarkdownFile(filename: string, defaultContent: string = ''): string {
  const filePath = path.join(process.cwd(), `content/${filename}`)
  
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8')
  }
  
  return defaultContent
}

