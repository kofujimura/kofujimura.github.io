import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { label: 'About', href: '/description', external: false },
  { label: 'Otsuma University', href: 'https://www.otsuma.ac.jp/', external: true },
  { label: 'Social Information Studies', href: 'https://www.sis.otsuma.ac.jp/', external: true },
  { label: 'Information Design', href: 'http://www.sis.otsuma.ac.jp/i-design/', external: true },
];

export default function Navigation() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/images/fujimulab-logo.png"
              alt="Fujimura Seminar"
              width={942}
              height={240}
              className="h-8 w-auto md:h-10"
              priority
            />
          </Link>

          {/* PC: inline links */}
          <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {i > 0 && <span className="text-gray-400 mx-1">•</span>}
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  >
                    {link.label}
                  </Link>
                )}
              </span>
            ))}
          </div>

          {/* Mobile: <details>/<summary> hamburger — JavaScript不要 */}
          <details className="md:hidden">
            <summary className="p-2 list-none cursor-pointer text-gray-600 hover:text-blue-600 transition-colors select-none">
              {/* 閉じているとき: ≡ */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 [details[open]_&]:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* 開いているとき: ✕ */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 hidden [details[open]_&]:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </summary>

            {/* ドロップダウン: fixed でビューポート基準に配置 */}
            <div className="fixed top-12 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50">
              <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col text-sm text-gray-600">
                {navLinks.map(link =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="py-2 px-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
