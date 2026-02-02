import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { HiDocumentText } from 'react-icons/hi'

export default function SocialLinks() {
  return (
    <div className="flex justify-center space-x-6 mt-8">
      <a
        href="https://linkedin.com/in/taehoon-yong"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="LinkedIn"
      >
        <FaLinkedin size={28} />
      </a>
      <a
        href="https://github.com/th-yong"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        aria-label="GitHub"
      >
        <FaGithub size={28} />
      </a>
      <a
        href="/thyong_cv.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        aria-label="CV"
      >
        <HiDocumentText size={28} />
      </a>
    </div>
  )
}

