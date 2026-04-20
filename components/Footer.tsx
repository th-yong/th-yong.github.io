export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-6 px-4 sm:px-6 lg:px-8 text-xs text-gray-500 dark:text-gray-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <p>© {year} Tae-Hoon Yong. All rights reserved.</p>
        <p>
          3D model{' '}
          <a
            href="https://sketchfab.com/3d-models/robot-playground-59fc99d8dcb146f3a6c16dbbcc4680da"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            &quot;Robot Playground&quot;
          </a>{' '}
          by Hadrien59 ·{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            CC BY 4.0
          </a>
        </p>
      </div>
    </footer>
  )
}
