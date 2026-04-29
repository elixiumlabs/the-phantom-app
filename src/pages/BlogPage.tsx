import { useState, memo } from 'react'
import { ArrowUpRight, Clock, User } from 'lucide-react'
import { motion } from 'framer-motion'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

type Tag = { name: string; href: string }

type Article = {
  id: string
  title: string
  summary: string
  href: string
  category: string
  thumbnailUrl: string
  publishedAt: string
  readingTime: string
  author: { name: string; avatarUrl: string }
  tags: Tag[]
  featured?: boolean
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Why Most Brands Fail Before They Launch',
    summary: 'The biggest mistake founders make is going public too early. Here\'s how to build invisible and launch with proof instead of potential.',
    href: '#',
    category: 'Strategy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?w=800&q=80',
    publishedAt: 'Apr 20, 2025',
    readingTime: '6 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Strategy', href: '#' }, { name: 'Validation', href: '#' }],
    featured: true,
  },
  {
    id: '2',
    title: 'The Phantom Phase: A Step-by-Step Breakdown',
    summary: 'Four phases, zero public footprint. We break down exactly what happens inside a phantom-phase brand build from ghost identity to lock-in.',
    href: '#',
    category: 'Process',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    publishedAt: 'Apr 15, 2025',
    readingTime: '8 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Process', href: '#' }, { name: 'Framework', href: '#' }],
  },
  {
    id: '3',
    title: 'Signal vs. Noise: What Counts as Real Validation',
    summary: 'Likes, follows, and compliments are not signal. Here\'s how to track the only three metrics that tell you if your offer actually works.',
    href: '#',
    category: 'Validation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    publishedAt: 'Apr 10, 2025',
    readingTime: '5 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Validation', href: '#' }, { name: 'Metrics', href: '#' }],
  },
  {
    id: '4',
    title: 'How to Steelman Your Own Idea Before the Market Does',
    summary: 'Stress-testing your idea before you build is the hardest thing to do alone. We designed a framework that forces the reckoning you\'ve been avoiding.',
    href: '#',
    category: 'Strategy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80',
    publishedAt: 'Apr 5, 2025',
    readingTime: '7 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Strategy', href: '#' }, { name: 'Ideation', href: '#' }],
  },
  {
    id: '5',
    title: 'Cold Outreach That Doesn\'t Feel Promotional',
    summary: 'Most cold outreach fails because it leads with the offer, not the problem. Here\'s how to write messages that surface real buyers without a pitch.',
    href: '#',
    category: 'Outreach',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80',
    publishedAt: 'Mar 30, 2025',
    readingTime: '6 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Outreach', href: '#' }, { name: 'Copywriting', href: '#' }],
  },
  {
    id: '6',
    title: 'The Lock-In Checklist: What Has to Be True Before You Go Public',
    summary: 'Going live too soon is how you burn your window. The lock-in checklist is the hard gate between the phantom phase and public visibility.',
    href: '#',
    category: 'Process',
    thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    publishedAt: 'Mar 25, 2025',
    readingTime: '5 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Process', href: '#' }, { name: 'Launch', href: '#' }],
  },
  {
    id: '7',
    title: 'Building a Proof Vault: How to Collect Evidence Before You Have an Audience',
    summary: 'Testimonials, results, and case studies don\'t require a public profile. Here\'s how to build a proof package in the dark.',
    href: '#',
    category: 'Proof',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    publishedAt: 'Mar 20, 2025',
    readingTime: '7 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Proof', href: '#' }, { name: 'Credibility', href: '#' }],
  },
  {
    id: '8',
    title: 'Iteration Without Chaos: One Variable at a Time',
    summary: 'Most founders change everything when something doesn\'t convert. That\'s not iteration — that\'s guessing. Here\'s the right way to run a validation loop.',
    href: '#',
    category: 'Validation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    publishedAt: 'Mar 15, 2025',
    readingTime: '6 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Validation', href: '#' }, { name: 'Process', href: '#' }],
  },
]

const CATEGORIES = ['All', 'Strategy', 'Process', 'Validation', 'Outreach', 'Proof']

const ITEMS_PER_PAGE = 6

function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={article.href}
      className="group flex flex-col bg-phantom-surface border border-phantom-border-subtle rounded-2xl overflow-hidden hover:border-[#333] transition-all duration-200 no-underline"
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="badge badge-active text-[10px] px-2 py-0.5">{article.category}</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-body text-[12px] text-phantom-text-muted">{article.publishedAt}</span>
          <span className="w-1 h-1 rounded-full bg-phantom-border" />
          <span className="font-body text-[12px] text-phantom-text-muted flex items-center gap-1">
            <Clock size={11} />
            {article.readingTime}
          </span>
        </div>
        <h3 className="font-display font-bold text-[16px] text-phantom-text-primary leading-snug mb-2 group-hover:text-phantom-lime transition-colors duration-150">
          {article.title}
        </h3>
        <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed flex-1 mb-4">
          {article.summary}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-phantom-lime/20 border border-phantom-lime/30 flex items-center justify-center">
              <User size={11} className="text-phantom-lime" />
            </div>
            <span className="font-ui text-[12px] text-phantom-text-muted">{article.author.name}</span>
          </div>
          <ArrowUpRight size={16} className="text-phantom-text-muted group-hover:text-phantom-lime transition-colors duration-150" />
        </div>
      </div>
    </a>
  )
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <a
      href={article.href}
      className="group relative flex overflow-hidden rounded-2xl no-underline"
      style={{ minHeight: '420px', border: '1px solid #1a1a1a' }}
    >
      <img
        src={article.thumbnailUrl}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
      <div className="relative flex flex-col justify-end p-8 w-full">
        <span className="badge badge-active text-[10px] px-2 py-0.5 self-start mb-4">{article.category}</span>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-display font-bold text-[28px] md:text-[36px] text-white leading-tight mb-2 group-hover:text-phantom-lime transition-colors duration-150">
              {article.title}
            </h2>
            <p className="font-body text-[14px] text-white/70 leading-relaxed max-w-2xl mb-4 hidden md:block">
              {article.summary}
            </p>
            <div className="flex items-center gap-4">
              <span className="font-body text-[13px] text-white/60">{article.publishedAt}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="font-body text-[13px] text-white/60 flex items-center gap-1">
                <Clock size={12} />
                {article.readingTime}
              </span>
            </div>
          </div>
          <ArrowUpRight size={24} className="text-white/60 group-hover:text-phantom-lime transition-colors duration-150 shrink-0 mt-1" />
        </div>
      </div>
    </a>
  )
}

const BlogPage = memo(() => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)

  const featured = ARTICLES.find(a => a.featured)!
  const rest = ARTICLES.filter(a => !a.featured)

  const filtered = activeCategory === 'All'
    ? rest
    : rest.filter(a => a.category === activeCategory)

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  function handleCategory(cat: string) {
    setActiveCategory(cat)
    setPage(1)
  }

  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">From the phantom lab</p>
            <h1 className="font-display font-bold text-[40px] md:text-[56px] text-phantom-text-primary leading-tight mb-4">
              Resources &amp; insights.
            </h1>
            <p className="font-body text-[16px] text-phantom-text-secondary max-w-xl">
              Strategy, frameworks, and field notes from inside the phantom phase.
            </p>
          </motion.div>

          {/* Featured */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
          >
            <FeaturedArticle article={featured} />
          </motion.div>

          {/* Filters */}
          <motion.div
            className="flex items-center gap-2 flex-wrap mb-10"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.12 }}
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`font-ui text-[13px] font-medium px-4 py-1.5 rounded-full border transition-all duration-150 ${
                  activeCategory === cat
                    ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10'
                    : 'border-phantom-border text-phantom-text-secondary hover:border-[#333] hover:text-phantom-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          <motion.ul
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 list-none p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.16 }}
          >
            {paginated.map((article, i) => (
              <motion.li
                key={article.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: i * 0.05 }}
              >
                <ArticleCard article={article} />
              </motion.li>
            ))}
          </motion.ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-[13px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full font-ui text-[13px] font-medium border transition-all duration-150 ${
                    page === p
                      ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10'
                      : 'border-phantom-border text-phantom-text-secondary hover:border-[#333]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary px-4 py-2 text-[13px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </main>

      <FooterSection />
    </div>
  )
})

BlogPage.displayName = 'BlogPage'
export default BlogPage
