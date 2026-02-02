import MarkdownViewer from '@/components/MarkdownViewer'
import { readMarkdownFile } from '@/lib/content'

export default function AboutPage() {
  const content = readMarkdownFile('about.md', '# About\n\nWelcome to my blog!')

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <MarkdownViewer content={content} />
      </div>
    </div>
  )
}

