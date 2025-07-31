import Link from 'next/link';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, idx) => (
          <li key={item.href} className="flex items-center">
            {idx > 0 && <span className="mx-2">/</span>}
            {item.href ? (
              <Link href={item.href} className="text-primary-600 hover:underline">{item.label}</Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}