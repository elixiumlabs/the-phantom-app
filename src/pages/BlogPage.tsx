import { useState, useEffect, useRef, memo, useId } from 'react'
import { ArrowUpRight, Clock, User, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

type Tag = { name: string; href: string }

type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'quote'; text: string }

type Article = {
  id: string
  title: string
  summary: string
  category: string
  thumbnailUrl: string
  publishedAt: string
  readingTime: string
  author: { name: string; avatarUrl: string }
  tags: Tag[]
  featured?: boolean
  content: ContentBlock[]
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Why Most Brands Fail Before They Launch',
    summary: 'The biggest mistake founders make is going public too early. Here\'s how to build invisible and launch with proof instead of potential.',
    category: 'Strategy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?w=1200&q=80',
    publishedAt: 'Apr 20, 2025',
    readingTime: '6 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Strategy', href: '#' }, { name: 'Validation', href: '#' }],
    featured: true,
    content: [
      { type: 'p', text: 'The most common failure mode in early-stage brand building is not bad product or bad marketing — it is premature exposure. Founders treat the launch like a finish line, when it is actually the most expensive event in the brand\'s lifetime. You only get one first impression with the algorithm, with the press, with the early audience, and with yourself.' },
      { type: 'h', text: 'The Visibility Tax' },
      { type: 'p', text: 'When you launch publicly, you pay a tax in three currencies: attention, time, and conviction. Attention because the loudest part of any brand is its earliest weeks. Time because every public mistake costs three to five times more to fix than a private one. Conviction because once strangers form an opinion, you start optimizing for them instead of the customer.' },
      { type: 'h', text: 'Build Invisible First' },
      { type: 'p', text: 'The phantom phase is the answer. You build the product, the offer, the proof, and the positioning entirely in the dark — no public profiles, no announcement posts, no "building in public" thread. The only people who know the brand exists are the ones paying for it.' },
      { type: 'ul', items: [
        'No public social presence until the proof vault is full',
        'No domain announcement until the offer has converted at least 10 strangers',
        'No press, no podcasts, no founder content until version 1.0 of the offer is locked',
        'Every test runs through cold outreach, paid ads, or referral — never through audience',
      ]},
      { type: 'quote', text: 'Your launch is not the start of the story. It is the receipt for the work no one saw you do.' },
      { type: 'h', text: 'Launch With Proof, Not Potential' },
      { type: 'p', text: 'A public launch backed by 30 paying customers, three case studies, and a converting funnel is a different category of event than a launch backed by hope. The first one compounds. The second one decays the moment the announcement post stops trending. Build invisible. Launch loud. Never the other way around.' },
    ],
  },
  {
    id: '2',
    title: 'The Phantom Phase: A Step-by-Step Breakdown',
    summary: 'Four phases, zero public footprint. We break down exactly what happens inside a phantom-phase brand build from ghost identity to lock-in.',
    category: 'Process',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    publishedAt: 'Apr 15, 2025',
    readingTime: '8 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Process', href: '#' }, { name: 'Framework', href: '#' }],
    content: [
      { type: 'p', text: 'The phantom phase is a four-stage protocol for building a brand from zero to first revenue without ever going public. Each phase has a single deliverable, a clear gate, and a hard rule about what cannot happen until the gate is cleared.' },
      { type: 'h', text: 'Phase 1 — Ghost Identity' },
      { type: 'p', text: 'You define who the brand serves, what it refuses to do, and what its single sharpest promise is. No logo, no color palette, no website. The deliverable is a one-page positioning doc that a stranger can read in 90 seconds and immediately know if they are the customer.' },
      { type: 'h', text: 'Phase 2 — Silent Offer' },
      { type: 'p', text: 'You build the smallest version of the offer that can be paid for. Not an MVP — an MSP, the minimum sellable promise. The deliverable is a sales page, a price, and a payment link. The gate: it has to convert at least one cold stranger before you move on.' },
      { type: 'h', text: 'Phase 3 — Proof Vault' },
      { type: 'ul', items: [
        'Run the offer 10 to 30 times against cold traffic',
        'Capture every artifact: testimonials, screenshots, before/after, raw quotes',
        'Iterate one variable at a time — never the whole offer at once',
        'Stop when three pieces of proof can stand on their own without context',
      ]},
      { type: 'h', text: 'Phase 4 — Lock-In' },
      { type: 'p', text: 'You freeze the offer, the price, and the positioning. You build the public-facing assets — site, brand, content engine — against locked inputs, not moving ones. Only then does the brand go public, with proof in hand and a story that already happened.' },
      { type: 'quote', text: 'A phantom-phase brand launches the way a magician finishes a trick — the work was already done.' },
    ],
  },
  {
    id: '3',
    title: 'Signal vs. Noise: What Counts as Real Validation',
    summary: 'Likes, follows, and compliments are not signal. Here\'s how to track the only three metrics that tell you if your offer actually works.',
    category: 'Validation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    publishedAt: 'Apr 10, 2025',
    readingTime: '5 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Validation', href: '#' }, { name: 'Metrics', href: '#' }],
    content: [
      { type: 'p', text: 'Most early-stage founders are drowning in noise that looks like signal. A friend says "I love this." An audience hits 1,000 followers. A post goes viral. None of these tell you whether the offer works. The only validation that counts is the kind that ends in a transaction.' },
      { type: 'h', text: 'The Three Metrics That Matter' },
      { type: 'ul', items: [
        'Cold conversion rate — strangers who pay, divided by strangers who saw the offer',
        'Repeat or referral rate — buyers who come back or send someone else',
        'Unprompted testimonial rate — buyers who praise without being asked',
      ]},
      { type: 'h', text: 'Why Everything Else Is Noise' },
      { type: 'p', text: 'Likes are cheap because they cost the giver nothing. Compliments from your network are biased because they want you to succeed. Email signups are ambiguous because intent does not equal action. A paid stranger is the only person whose behavior is unambiguous — they had a real choice and they chose you.' },
      { type: 'quote', text: 'Validation is what someone does after they could have done nothing.' },
      { type: 'h', text: 'The 30-Stranger Rule' },
      { type: 'p', text: 'Run the offer in front of at least 30 cold strangers before you trust any data point. Below 30, the noise floor is too loud. Above 30, the pattern starts to stabilize and you can read it. Anything earlier is a guess wearing a number.' },
    ],
  },
  {
    id: '4',
    title: 'How to Steelman Your Own Idea Before the Market Does',
    summary: 'Stress-testing your idea before you build is the hardest thing to do alone. We designed a framework that forces the reckoning you\'ve been avoiding.',
    category: 'Strategy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&q=80',
    publishedAt: 'Apr 5, 2025',
    readingTime: '7 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Strategy', href: '#' }, { name: 'Ideation', href: '#' }],
    content: [
      { type: 'p', text: 'Steelmanning is the discipline of arguing the strongest case against your own idea — before the market does it for you with money and silence. Most founders skip this step because it is uncomfortable and lonely, and the brain is wired to defend its own outputs. The market is not.' },
      { type: 'h', text: 'The Three Questions' },
      { type: 'ul', items: [
        'Who would actively choose not to buy this, even at half price, and why?',
        'What is the single sentence a competitor could say that would make my offer feel obsolete?',
        'If this fails in 12 months, what is the most likely reason — written before launch, not after?',
      ]},
      { type: 'h', text: 'Write the Pre-Mortem First' },
      { type: 'p', text: 'A pre-mortem is a written document, dated, that lays out the most likely failure mode of the brand before it ships. The act of writing it forces specificity. Vague fears become concrete risks, and concrete risks can be designed around. Vague fears just sit in your chest.' },
      { type: 'quote', text: 'You cannot defend an idea you have never attacked.' },
      { type: 'h', text: 'Find Your Sharpest Critic' },
      { type: 'p', text: 'One person whose taste you trust, who is not financially or emotionally invested in your success, who will tell you the unflattering version. Pay them if you have to. Their feedback in week one is worth more than the market\'s feedback in month six — because it costs less to act on.' },
    ],
  },
  {
    id: '5',
    title: 'Cold Outreach That Doesn\'t Feel Promotional',
    summary: 'Most cold outreach fails because it leads with the offer, not the problem. Here\'s how to write messages that surface real buyers without a pitch.',
    category: 'Outreach',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&q=80',
    publishedAt: 'Mar 30, 2025',
    readingTime: '6 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Outreach', href: '#' }, { name: 'Copywriting', href: '#' }],
    content: [
      { type: 'p', text: 'Cold outreach has a reputation problem because most of it is bad. The default template — introduce yourself, describe your offer, ask for a call — fails because it asks the recipient to do all the work of figuring out if they care. The version that works flips it: you do the work first.' },
      { type: 'h', text: 'The Problem-First Frame' },
      { type: 'p', text: 'Open with a single sentence that names the specific problem you suspect they have, in their language, with enough specificity that they know you actually looked. Skip the introduction entirely. Save it for after they reply.' },
      { type: 'h', text: 'The Anatomy of a Reply-Worthy Message' },
      { type: 'ul', items: [
        'Line 1: the problem, named specifically — no fluff, no flattery',
        'Line 2: a one-sentence observation about why most attempts to solve it fail',
        'Line 3: a single, concrete question they can answer with one sentence',
        'No link, no calendar, no pitch — the goal is a reply, not a sale',
      ]},
      { type: 'quote', text: 'A cold message should feel like a sharp question from a stranger who already understands you.' },
      { type: 'h', text: 'Volume Is Not the Lever' },
      { type: 'p', text: 'Sending 500 of the wrong message is not a strategy — it is noise generation. Send 30 of the right message, refined three times, before you scale anything. Reply rate is the only number that matters in the first round.' },
    ],
  },
  {
    id: '6',
    title: 'The Lock-In Checklist: What Has to Be True Before You Go Public',
    summary: 'Going live too soon is how you burn your window. The lock-in checklist is the hard gate between the phantom phase and public visibility.',
    category: 'Process',
    thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80',
    publishedAt: 'Mar 25, 2025',
    readingTime: '5 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Process', href: '#' }, { name: 'Launch', href: '#' }],
    content: [
      { type: 'p', text: 'Lock-in is the moment a phantom-phase brand earns the right to be public. It is not a date on a calendar — it is a checklist of conditions that have to be true before exposure becomes an asset instead of a liability.' },
      { type: 'h', text: 'The Checklist' },
      { type: 'ul', items: [
        'The offer has converted at least 10 cold strangers without discounting',
        'Three pieces of proof exist that work without a story attached',
        'The price has held steady for the last 5 transactions',
        'You can describe the customer in one sentence without using the word "anyone"',
        'The fulfillment process runs without your hands on it for at least one cycle',
        'You have a written reason you would say no to a customer — and have actually said it',
      ]},
      { type: 'h', text: 'Why Each One Is Non-Negotiable' },
      { type: 'p', text: 'Each item closes a specific failure mode. Cold conversion proves the offer is not riding goodwill. Standalone proof proves the result is repeatable. Stable price proves you know what it is worth. A specific customer means messaging can land. Hands-off fulfillment means you can survive growth. A written no means you have positioning, not just a product.' },
      { type: 'quote', text: 'If you cannot check every box, the brand is not ready to be seen — it is ready to be tested again.' },
    ],
  },
  {
    id: '7',
    title: 'Building a Proof Vault: How to Collect Evidence Before You Have an Audience',
    summary: 'Testimonials, results, and case studies don\'t require a public profile. Here\'s how to build a proof package in the dark.',
    category: 'Proof',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    publishedAt: 'Mar 20, 2025',
    readingTime: '7 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Proof', href: '#' }, { name: 'Credibility', href: '#' }],
    content: [
      { type: 'p', text: 'A proof vault is the private library of evidence that turns a phantom-phase brand from a claim into a fact. It is built customer by customer, in the dark, before any of it is ever shown publicly. By the time the brand launches, the vault does the heavy lifting that an audience would otherwise have to do.' },
      { type: 'h', text: 'What Belongs in the Vault' },
      { type: 'ul', items: [
        'Raw, unedited testimonials with the customer\'s real name and context',
        'Before/after artifacts — screenshots, numbers, exports, anything visual',
        'A short written case study for every customer, even the small ones',
        'Recorded calls or voice notes where the customer describes the change in their words',
        'Receipts, invoices, and payment confirmations that prove money changed hands',
      ]},
      { type: 'h', text: 'How to Capture It Without Being Awkward' },
      { type: 'p', text: 'Ask within 48 hours of the customer experiencing the result, while the feeling is still sharp. Send a one-question prompt — "what changed for you?" — and let them write or record at length. The best testimonials are the ones the customer wanted to give but did not know how to start.' },
      { type: 'quote', text: 'A vault of 10 specific stories beats an audience of 10,000 anonymous followers.' },
      { type: 'h', text: 'Why Private Proof Beats Public Hype' },
      { type: 'p', text: 'Public hype is forgettable. A private case study, surfaced at the exact moment a prospect is hesitating, is the closest thing to a guaranteed conversion. The vault is not for the launch — it is for every sales conversation for the next two years.' },
    ],
  },
  {
    id: '8',
    title: 'Iteration Without Chaos: One Variable at a Time',
    summary: 'Most founders change everything when something doesn\'t convert. That\'s not iteration — that\'s guessing. Here\'s the right way to run a validation loop.',
    category: 'Validation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    publishedAt: 'Mar 15, 2025',
    readingTime: '6 min read',
    author: { name: 'Phantom Team', avatarUrl: '' },
    tags: [{ name: 'Validation', href: '#' }, { name: 'Process', href: '#' }],
    content: [
      { type: 'p', text: 'When an offer does not convert, the instinct is to change everything — the headline, the price, the audience, the promise — all at once. The result is a new offer with no idea what fixed it or what made it worse. Real iteration moves one variable at a time, on purpose, with a written hypothesis.' },
      { type: 'h', text: 'The Single-Variable Loop' },
      { type: 'ul', items: [
        'Pick the variable most likely to be the bottleneck — usually headline, audience, or price',
        'Write the hypothesis in one sentence: "if I change X, then Y will move because Z"',
        'Run the change against at least 30 new cold viewers',
        'Compare against the previous version on a single, pre-chosen metric',
        'Keep, revert, or refine — then move to the next variable',
      ]},
      { type: 'h', text: 'The Order of Operations' },
      { type: 'p', text: 'Audience first, because the wrong audience will never convert no matter how good the offer. Then headline, because the wrong message will never land even with the right audience. Then price, because price is meaningless until both above are correct. Then proof, because proof only matters once the prospect is leaning in.' },
      { type: 'quote', text: 'If you change four things and conversion goes up, you learned nothing. You just got lucky.' },
      { type: 'h', text: 'When to Stop Iterating' },
      { type: 'p', text: 'Stop when the offer has held its conversion rate across two consecutive cohorts of 30. That is not a final answer — it is a stable enough floor to lock in, go public, and let scale reveal the next bottleneck.' },
    ],
  },
]

const CATEGORIES = ['All', 'Strategy', 'Process', 'Validation', 'Outreach', 'Proof']

const ITEMS_PER_PAGE = 6

function ContentBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return (
            <p key={i} className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
              {block.text}
            </p>
          )
        }
        if (block.type === 'h') {
          return (
            <h3 key={i} className="font-display font-bold text-[20px] text-phantom-text-primary leading-snug pt-2">
              {block.text}
            </h3>
          )
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="space-y-2 list-none p-0">
              {block.items.map((item, j) => (
                <li key={j} className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  {item}
                </li>
              ))}
            </ul>
          )
        }
        return (
          <blockquote
            key={i}
            className="font-display text-[18px] italic text-phantom-text-primary leading-relaxed border-l-2 border-phantom-lime pl-5 py-1 my-2"
          >
            {block.text}
          </blockquote>
        )
      })}
    </div>
  )
}

function ArticleCard({ article, layoutId, onOpen }: { article: Article; layoutId: string; onOpen: () => void }) {
  return (
    <motion.div
      layoutId={`card-${layoutId}`}
      onClick={onOpen}
      className="group flex flex-col bg-phantom-surface border border-phantom-border-subtle rounded-2xl overflow-hidden hover:border-[#333] transition-colors duration-200 cursor-pointer h-full"
    >
      <motion.div layoutId={`image-${layoutId}`} className="relative overflow-hidden aspect-[16/9]">
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="badge badge-active text-[10px] px-2 py-0.5">{article.category}</span>
        </div>
      </motion.div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-body text-[12px] text-phantom-text-muted">{article.publishedAt}</span>
          <span className="w-1 h-1 rounded-full bg-phantom-border" />
          <span className="font-body text-[12px] text-phantom-text-muted flex items-center gap-1">
            <Clock size={11} />
            {article.readingTime}
          </span>
        </div>
        <motion.h3
          layoutId={`title-${layoutId}`}
          className="font-display font-bold text-[16px] text-phantom-text-primary leading-snug mb-2 group-hover:text-phantom-lime transition-colors duration-150"
        >
          {article.title}
        </motion.h3>
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
    </motion.div>
  )
}

function FeaturedArticle({ article, layoutId, onOpen }: { article: Article; layoutId: string; onOpen: () => void }) {
  return (
    <motion.div
      layoutId={`card-${layoutId}`}
      onClick={onOpen}
      className="group relative flex overflow-hidden rounded-2xl cursor-pointer"
      style={{ minHeight: '420px', border: '1px solid #1a1a1a' }}
    >
      <motion.img
        layoutId={`image-${layoutId}`}
        src={article.thumbnailUrl}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
      <div className="relative flex flex-col justify-end p-8 w-full">
        <span className="badge badge-active text-[10px] px-2 py-0.5 self-start mb-4">{article.category}</span>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <motion.h2
              layoutId={`title-${layoutId}`}
              className="font-display font-bold text-[28px] md:text-[36px] text-white leading-tight mb-2 group-hover:text-phantom-lime transition-colors duration-150"
            >
              {article.title}
            </motion.h2>
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
    </motion.div>
  )
}

function ExpandedArticle({ article, layoutId, onClose }: { article: Article; layoutId: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        ref={ref}
        layoutId={`card-${layoutId}`}
        className="relative bg-phantom-surface border border-phantom-border-subtle rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.2, duration: 0.15 }}
          onClick={onClose}
          aria-label="Close article"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white transition-colors"
        >
          <X size={16} />
        </motion.button>

        <div className="overflow-y-auto">
          <motion.div layoutId={`image-${layoutId}`} className="relative aspect-[16/9] overflow-hidden">
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-phantom-surface via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="badge badge-active text-[10px] px-2 py-0.5">{article.category}</span>
            </div>
          </motion.div>

          <div className="p-6 md:p-10">
            <motion.h2
              layoutId={`title-${layoutId}`}
              className="font-display font-bold text-[24px] md:text-[34px] text-phantom-text-primary leading-tight mb-4"
            >
              {article.title}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-phantom-border-subtle">
                <div className="w-7 h-7 rounded-full bg-phantom-lime/20 border border-phantom-lime/30 flex items-center justify-center">
                  <User size={12} className="text-phantom-lime" />
                </div>
                <span className="font-ui text-[13px] text-phantom-text-primary">{article.author.name}</span>
                <span className="w-1 h-1 rounded-full bg-phantom-border" />
                <span className="font-body text-[13px] text-phantom-text-muted">{article.publishedAt}</span>
                <span className="w-1 h-1 rounded-full bg-phantom-border" />
                <span className="font-body text-[13px] text-phantom-text-muted flex items-center gap-1">
                  <Clock size={12} />
                  {article.readingTime}
                </span>
              </div>

              <ContentBody blocks={article.content} />

              <div className="flex items-center gap-2 flex-wrap mt-10 pt-6 border-t border-phantom-border-subtle">
                {article.tags.map(tag => (
                  <span
                    key={tag.name}
                    className="font-ui text-[12px] text-phantom-text-secondary px-3 py-1 rounded-full border border-phantom-border-subtle"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const BlogPage = memo(() => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [activeId, setActiveId] = useState<string | null>(null)
  const idPrefix = useId()

  const featured = ARTICLES.find(a => a.featured)!
  const rest = ARTICLES.filter(a => !a.featured)

  const filtered = activeCategory === 'All'
    ? rest
    : rest.filter(a => a.category === activeCategory)

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const activeArticle = activeId ? ARTICLES.find(a => a.id === activeId) ?? null : null

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
            <FeaturedArticle
              article={featured}
              layoutId={`${idPrefix}-${featured.id}`}
              onOpen={() => setActiveId(featured.id)}
            />
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
                <ArticleCard
                  article={article}
                  layoutId={`${idPrefix}-${article.id}`}
                  onOpen={() => setActiveId(article.id)}
                />
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

      <AnimatePresence>
        {activeArticle && (
          <ExpandedArticle
            key={activeArticle.id}
            article={activeArticle}
            layoutId={`${idPrefix}-${activeArticle.id}`}
            onClose={() => setActiveId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
})

BlogPage.displayName = 'BlogPage'
export default BlogPage
