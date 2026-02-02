import MarkdownViewer from '@/components/MarkdownViewer'
import { readMarkdownFile } from '@/lib/content'

export default function ProjectsPage() {
  const content = readMarkdownFile('projects.md', '# Projects\n\nMy projects will be listed here.')

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <MarkdownViewer content={content} />
      </div>
    </div>
  )
}

