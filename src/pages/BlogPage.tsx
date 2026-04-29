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
      { type: 'p', text: 'Every year, thousands of founders announce their new venture on social media, launch a website, start posting content, and wait for the market to respond. What they get instead is silence, or worse — polite encouragement from friends who will never buy. The brand burns its moment of maximum attention on a product that has not been tested, an offer that has not converted, and a message that has not been refined against real buyer behavior.' },
      { type: 'p', text: 'This is not a failure of effort. It is a failure of sequencing. The work was real, but it was done in the wrong order, in front of the wrong audience, at the wrong time. And once that launch moment passes, it is nearly impossible to get it back. The algorithm moves on. The press moves on. Your network moves on. And you are left trying to rebuild momentum with a fraction of the attention you had on day one.' },
      { type: 'h', text: 'The Visibility Tax' },
      { type: 'p', text: 'When you launch publicly, you pay a tax in three currencies: attention, time, and conviction. Attention because the loudest part of any brand is its earliest weeks. Time because every public mistake costs three to five times more to fix than a private one. Conviction because once strangers form an opinion, you start optimizing for them instead of the customer.' },
      { type: 'p', text: 'The attention tax is the most obvious. When you announce a brand, you get a spike — friends share it, early followers engage, maybe you get a few upvotes or retweets. That spike is your entire attention budget for the next six months. If the offer is not ready to convert, if the messaging is not sharp, if the proof is not there, you just spent your most valuable asset on a version of the brand that does not work yet. And when you come back three months later with the better version, no one is listening anymore.' },
      { type: 'p', text: 'The time tax is more insidious. Every public iteration requires explanation. You have to tell people why you changed the price, why you pivoted the positioning, why the offer is different now. Private iteration is silent — you just change it and test again. Public iteration is a narrative event. It costs time, energy, and credibility every single time you move.' },
      { type: 'p', text: 'The conviction tax is the one that kills brands slowly. Once you have an audience, even a small one, you start optimizing for their reactions instead of the market\'s behavior. You soften the edges of your message because someone might be offended. You lower the price because someone said it was too high. You add features because someone asked for them. The customer — the person who would actually pay — gets drowned out by the crowd of people who never would.' },
      { type: 'h', text: 'Build Invisible First' },
      { type: 'p', text: 'The phantom phase is the answer. You build the product, the offer, the proof, and the positioning entirely in the dark — no public profiles, no announcement posts, no "building in public" thread. The only people who know the brand exists are the ones paying for it.' },
      { type: 'p', text: 'This is not about secrecy for its own sake. It is about creating the conditions for honest feedback. When you build in public, you get social feedback — likes, comments, encouragement, criticism. When you build invisible, you get market feedback — conversions, objections, silence, or sales. The second type is the only one that matters.' },
      { type: 'ul', items: [
        'No public social presence until the proof vault is full',
        'No domain announcement until the offer has converted at least 10 strangers',
        'No press, no podcasts, no founder content until version 1.0 of the offer is locked',
        'Every test runs through cold outreach, paid ads, or referral — never through audience',
      ]},
      { type: 'p', text: 'The invisible build forces discipline. You cannot rely on goodwill, so the offer has to work on its own. You cannot rely on your network, so the messaging has to land with strangers. You cannot rely on hype, so the proof has to be real. Every weakness in the brand gets exposed immediately, in private, where it costs nothing to fix.' },
      { type: 'p', text: 'Most founders resist this because it feels slow. It feels like you are wasting time while competitors are out there building in public, growing audiences, getting attention. But attention without conversion is not progress — it is noise. And noise does not pay the bills.' },
      { type: 'quote', text: 'Your launch is not the start of the story. It is the receipt for the work no one saw you do.' },
      { type: 'h', text: 'Launch With Proof, Not Potential' },
      { type: 'p', text: 'A public launch backed by 30 paying customers, three case studies, and a converting funnel is a different category of event than a launch backed by hope. The first one compounds. The second one decays the moment the announcement post stops trending. Build invisible. Launch loud. Never the other way around.' },
      { type: 'p', text: 'When you launch with proof, every piece of content you create is backed by evidence. Every claim you make has a receipt. Every promise you offer has already been delivered to someone else. The brand does not need to convince people it might work — it just has to show them that it already did.' },
      { type: 'p', text: 'This changes the entire dynamic of the launch. Instead of asking people to take a chance on you, you are inviting them to join something that is already working. Instead of defending your idea, you are sharing results. Instead of hoping the market responds, you already know it will — because it already has.' },
      { type: 'p', text: 'The brands that win are not the ones that launch first. They are the ones that launch ready. And ready does not mean perfect — it means tested, proven, and repeatable. Everything else is just a guess with a logo.' },
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
      { type: 'p', text: 'Most brand-building frameworks are either too vague to execute or too rigid to adapt. The phantom phase is different. It is not a methodology — it is a sequence. Each phase builds on the previous one, and skipping steps does not save time, it just creates expensive problems later. The goal is not to move fast. The goal is to move in the right order, so that when you do go public, the brand is already working.' },
      { type: 'h', text: 'Phase 1 — Ghost Identity' },
      { type: 'p', text: 'You define who the brand serves, what it refuses to do, and what its single sharpest promise is. No logo, no color palette, no website. The deliverable is a one-page positioning doc that a stranger can read in 90 seconds and immediately know if they are the customer.' },
      { type: 'p', text: 'This is the hardest phase because it requires saying no before you have said yes to anything. Most founders want to keep their options open — serve multiple audiences, offer multiple solutions, avoid being too specific. But specificity is the only thing that cuts through noise. A brand that is for everyone is for no one.' },
      { type: 'p', text: 'The positioning doc has three sections: who this is for, what it does, and what it does not do. The third section is the most important. If you cannot name three things the brand will never offer, three types of customers it will never serve, and three promises it will never make, the positioning is not sharp enough yet.' },
      { type: 'p', text: 'The gate for this phase is simple: show the doc to five strangers who fit the target profile. If three of them immediately understand what you are offering and whether it is for them, you pass. If they ask clarifying questions, if they seem confused, if they say "interesting" without any follow-up, you rewrite and test again.' },
      { type: 'h', text: 'Phase 2 — Silent Offer' },
      { type: 'p', text: 'You build the smallest version of the offer that can be paid for. Not an MVP — an MSP, the minimum sellable promise. The deliverable is a sales page, a price, and a payment link. The gate: it has to convert at least one cold stranger before you move on.' },
      { type: 'p', text: 'The silent offer is not about building the full product. It is about building the smallest thing someone would pay for right now, today, with no relationship and no trust. This is where most founders get stuck, because they want to build the complete vision before they ask for money. But the complete vision is expensive, time-consuming, and often wrong.' },
      { type: 'p', text: 'The MSP is the core promise, stripped of everything else. If you are building a course, the MSP is not the full curriculum — it is a single workshop that delivers one specific outcome. If you are building a tool, the MSP is not the full feature set — it is the one workflow that saves the most time. If you are building a service, the MSP is not the full engagement — it is the first deliverable that proves you can do the work.' },
      { type: 'p', text: 'The sales page is one page, no navigation, no distractions. Headline, problem, promise, proof (even if it is just your own story), price, and a button. That is it. If you cannot sell the offer on one page, adding more pages will not help.' },
      { type: 'p', text: 'The gate is one paying stranger. Not a friend, not a referral, not someone who already knows you. A stranger who found the page, read it, and decided to pay. Until that happens, the offer is not real — it is just an idea with a price tag.' },
      { type: 'h', text: 'Phase 3 — Proof Vault' },
      { type: 'ul', items: [
        'Run the offer 10 to 30 times against cold traffic',
        'Capture every artifact: testimonials, screenshots, before/after, raw quotes',
        'Iterate one variable at a time — never the whole offer at once',
        'Stop when three pieces of proof can stand on their own without context',
      ]},
      { type: 'p', text: 'The proof vault is where the brand earns its credibility. This is not about scaling — it is about repetition. You run the offer over and over, with different people, in different contexts, until the results become predictable. Every transaction generates an artifact: a testimonial, a result, a screenshot, a story. You collect all of it.' },
      { type: 'p', text: 'Most founders skip this phase because they think one or two customers is enough to prove the concept. It is not. One customer is an anecdote. Two customers is a coincidence. Ten customers is a pattern. Thirty customers is proof.' },
      { type: 'p', text: 'During this phase, you are also iterating — but carefully. You change one variable at a time: the headline, the price, the audience, the delivery format. You never change everything at once, because then you have no idea what worked and what did not. Each iteration runs against at least 10 new people before you evaluate it.' },
      { type: 'p', text: 'The gate for this phase is three pieces of standalone proof. Standalone means the proof works without you explaining it. A testimonial that is so specific and detailed that a stranger reading it can picture the result. A before/after that is so clear the transformation is obvious. A case study that is so complete it answers every objection before it is asked.' },
      { type: 'h', text: 'Phase 4 — Lock-In' },
      { type: 'p', text: 'You freeze the offer, the price, and the positioning. You build the public-facing assets — site, brand, content engine — against locked inputs, not moving ones. Only then does the brand go public, with proof in hand and a story that already happened.' },
      { type: 'p', text: 'Lock-in is the moment you stop iterating and start scaling. This does not mean the brand will never change again — it means the core offer is stable enough to build a public presence around. You know who it is for, you know what it costs, you know how to deliver it, and you know it works.' },
      { type: 'p', text: 'This is when you build the website, the brand identity, the content strategy, the social profiles. Not before. Building these assets before lock-in is a waste, because you will just have to rebuild them when the offer changes. Building them after lock-in is efficient, because you are building against a stable foundation.' },
      { type: 'p', text: 'The public launch is not the start of the brand — it is the announcement of a brand that already exists. You are not asking people to take a chance on you. You are inviting them to join something that is already working. The proof is already there. The customers are already there. The offer is already there. You are just turning on the lights.' },
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
      { type: 'p', text: 'The problem is not that founders are ignoring data — it is that they are tracking the wrong data. Social metrics are designed to feel like progress. Every like, every follow, every comment triggers a small dopamine hit that says "this is working." But working toward what? Attention is not the same as demand. Engagement is not the same as intent. And intent is not the same as action.' },
      { type: 'p', text: 'The market does not care how many people liked your post. It cares how many people opened their wallet. Everything else is just noise wearing a number.' },
      { type: 'h', text: 'The Three Metrics That Matter' },
      { type: 'ul', items: [
        'Cold conversion rate — strangers who pay, divided by strangers who saw the offer',
        'Repeat or referral rate — buyers who come back or send someone else',
        'Unprompted testimonial rate — buyers who praise without being asked',
      ]},
      { type: 'p', text: 'These three metrics tell you everything you need to know about whether the offer works. Cold conversion rate tells you if the offer is clear, compelling, and priced correctly. Repeat or referral rate tells you if the offer actually delivered on its promise. Unprompted testimonial rate tells you if the result was strong enough that the customer felt compelled to share it.' },
      { type: 'p', text: 'Everything else — page views, email opens, social follows, comments, shares — is a leading indicator at best and a distraction at worst. Leading indicators are useful only if they correlate with the metrics that matter. If your email open rate is 40% but your conversion rate is 0%, the open rate is not helping you. It is just making you feel productive.' },
      { type: 'h', text: 'Why Everything Else Is Noise' },
      { type: 'p', text: 'Likes are cheap because they cost the giver nothing. Compliments from your network are biased because they want you to succeed. Email signups are ambiguous because intent does not equal action. A paid stranger is the only person whose behavior is unambiguous — they had a real choice and they chose you.' },
      { type: 'p', text: 'Consider the difference between these two scenarios. In the first, you post about your new offer on social media. You get 200 likes, 30 comments, and 15 people say "this looks great, I\'ll check it out." Zero sales. In the second, you send the offer to 50 cold strangers via email. You get 3 replies, 1 sale, and 1 referral. Which scenario tells you more about whether the offer works?' },
      { type: 'p', text: 'The first scenario feels better. It feels like momentum. But it is not signal — it is social proof of interest, not demand. The second scenario feels worse. It feels like rejection. But it is signal — it tells you that 1 in 50 cold strangers will pay, and 1 in 3 buyers will refer. That is data you can build on.' },
      { type: 'p', text: 'The trap is that noise is abundant and signal is scarce. It is easier to get 1,000 followers than 10 customers. It is easier to get 100 likes than 1 testimonial. It is easier to get 50 email signups than 5 sales. So founders optimize for the easier thing, and then wonder why the brand is not growing.' },
      { type: 'quote', text: 'Validation is what someone does after they could have done nothing.' },
      { type: 'h', text: 'The 30-Stranger Rule' },
      { type: 'p', text: 'Run the offer in front of at least 30 cold strangers before you trust any data point. Below 30, the noise floor is too loud. Above 30, the pattern starts to stabilize and you can read it. Anything earlier is a guess wearing a number.' },
      { type: 'p', text: 'Why 30? Because human behavior is noisy at small sample sizes. One person might buy because they were having a good day. Two people might pass because they were distracted. Three people might convert because your timing was lucky. But by the time you hit 30, the randomness starts to average out and the real signal emerges.' },
      { type: 'p', text: 'This does not mean you need 30 sales to validate the offer — it means you need 30 exposures. If 30 people see the offer and 3 buy, that is a 10% conversion rate. If 30 people see it and 0 buy, that is a 0% conversion rate. Both are signal. The first tells you the offer works and you should scale it. The second tells you the offer does not work and you should fix it.' },
      { type: 'p', text: 'The mistake is stopping at 5 or 10 exposures and making a decision. At that sample size, you are not reading the market — you are reading noise. You might kill an offer that would have worked, or scale an offer that was just lucky. The 30-stranger rule protects you from both mistakes.' },
      { type: 'p', text: 'Once you hit 30, you can start to trust the pattern. If the conversion rate holds across the next 30, you have a stable baseline. If it drops, you know something changed. If it rises, you know you are improving. But until you hit that first 30, you are flying blind.' },
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
      { type: 'p', text: 'The natural state of an early-stage founder is optimism. You have to be optimistic to start something from nothing. But optimism is a terrible tool for stress-testing an idea. Optimism looks for reasons the idea will work. Steelmanning looks for reasons it will not — and then designs around them before they become expensive problems.' },
      { type: 'p', text: 'The difference between steelmanning and regular criticism is intent. Regular criticism is about poking holes. Steelmanning is about building the strongest possible argument against your idea, as if you were a competitor trying to destroy it, and then using that argument to make the idea stronger. It is not about being negative — it is about being rigorous.' },
      { type: 'h', text: 'The Three Questions' },
      { type: 'ul', items: [
        'Who would actively choose not to buy this, even at half price, and why?',
        'What is the single sentence a competitor could say that would make my offer feel obsolete?',
        'If this fails in 12 months, what is the most likely reason — written before launch, not after?',
      ]},
      { type: 'p', text: 'These three questions force specificity. The first question makes you name the people who are not your customer, which is the only way to figure out who is. The second question makes you confront your weakest point, which is where competitors will attack. The third question makes you write the failure story before it happens, which is the only way to prevent it.' },
      { type: 'p', text: 'Most founders answer the first question with vague generalities: "people who do not value quality" or "people who are not serious." That is not steelmanning — that is deflecting. A real answer names a specific type of person and a specific reason they would not buy. For example: "Solo freelancers who are not yet billing $5K/month would not buy this, because they do not have the budget and the ROI timeline is too long for their current cash flow."' },
      { type: 'p', text: 'The second question is even harder, because it requires you to imagine a competitor who understands your market better than you do. What would they say to make your offer irrelevant? Maybe: "Why pay for a course when you can just hire someone to do it for you?" or "Why use a tool when a spreadsheet works fine?" If you cannot answer that objection before launch, the market will ask it for you — and you will not have a good answer ready.' },
      { type: 'h', text: 'Write the Pre-Mortem First' },
      { type: 'p', text: 'A pre-mortem is a written document, dated, that lays out the most likely failure mode of the brand before it ships. The act of writing it forces specificity. Vague fears become concrete risks, and concrete risks can be designed around. Vague fears just sit in your chest.' },
      { type: 'p', text: 'The format is simple: "It is 12 months from now. The brand failed. Here is why." Then you write the story. Not a list of risks — a narrative. What happened first? What did you miss? What did the market do that you did not expect? What decision, made today, led to the failure?' },
      { type: 'p', text: 'The pre-mortem is uncomfortable because it requires you to vividly imagine your own failure. But that discomfort is the point. If you cannot stomach the idea of failure in a document, you will not be able to handle it in reality. And if you can write it down, you can design around it.' },
      { type: 'p', text: 'Here is an example: "The brand failed because we launched with a product that was too complex for the target customer to adopt without hand-holding, and we did not have the capacity to onboard everyone who signed up. Churn was 60% in the first 90 days. We spent all our time on support instead of marketing, and we ran out of runway before we could simplify the product."' },
      { type: 'p', text: 'That is a specific failure mode. And once it is written, you can ask: how do we prevent this? Maybe you simplify the product before launch. Maybe you build onboarding into the product itself. Maybe you cap the number of customers you take on until the process is smooth. The pre-mortem does not guarantee success — but it dramatically reduces the chance of a preventable failure.' },
      { type: 'quote', text: 'You cannot defend an idea you have never attacked.' },
      { type: 'h', text: 'Find Your Sharpest Critic' },
      { type: 'p', text: 'One person whose taste you trust, who is not financially or emotionally invested in your success, who will tell you the unflattering version. Pay them if you have to. Their feedback in week one is worth more than the market\'s feedback in month six — because it costs less to act on.' },
      { type: 'p', text: 'This person is not a cheerleader. They are not there to make you feel good about the idea. They are there to tell you what is wrong with it, in the most direct way possible, before you spend time and money building it. The best critics are the ones who have built something similar, failed at it, and learned the expensive lessons you are about to learn.' },
      { type: 'p', text: 'The mistake is asking friends or family for feedback. They love you, so they will soften the criticism. They want you to succeed, so they will focus on the positives. They do not want to hurt your feelings, so they will avoid the hard truths. That is not their fault — it is just human nature. But it is useless for steelmanning.' },
      { type: 'p', text: 'The right critic is someone who has no reason to lie to you. Ideally, someone you are paying for their time, so the relationship is transactional and the feedback is honest. Show them the positioning doc, the offer, the pricing, the target customer. Ask them: "What is wrong with this? What am I missing? What will the market punish me for?" Then listen without defending. If you find yourself arguing, you are not ready for the feedback.' },
      { type: 'p', text: 'The goal is not to take every piece of criticism and change the idea. The goal is to hear the strongest case against the idea, understand it, and then decide whether to adapt or double down. But you cannot make that decision if you never hear the case in the first place.' },
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
      { type: 'p', text: 'The reason most cold outreach fails is not that people hate being contacted by strangers. It is that most cold outreach is lazy. It is generic, self-centered, and asks for something before offering anything. The recipient reads it and thinks: "Why should I care?" And because the message does not answer that question, they delete it.' },
      { type: 'p', text: 'Good cold outreach does not feel like outreach. It feels like a sharp observation from someone who actually looked. It does not ask for a call — it starts a conversation. It does not pitch — it provokes. And it does not waste time with pleasantries, because the recipient\'s time is the most valuable thing in the exchange.' },
      { type: 'h', text: 'The Problem-First Frame' },
      { type: 'p', text: 'Open with a single sentence that names the specific problem you suspect they have, in their language, with enough specificity that they know you actually looked. Skip the introduction entirely. Save it for after they reply.' },
      { type: 'p', text: 'The problem-first frame works because it immediately answers the recipient\'s first question: "Why should I keep reading?" If the first sentence names a problem they actually have, in words they would use to describe it, they keep reading. If it does not, they stop. There is no middle ground.' },
      { type: 'p', text: 'Here is a bad example: "Hi [Name], I noticed your company is growing fast and I thought you might be interested in our solution for scaling teams." This is generic. It could be sent to anyone. It does not name a specific problem. It does not demonstrate any research. It is noise.' },
      { type: 'p', text: 'Here is a better example: "You\'re hiring 3 engineers a month but your onboarding docs are scattered across Notion, Google Drive, and Slack. New hires are asking the same questions in their first week that the last 10 hires asked." This is specific. It names a problem that is real, observable, and painful. If the recipient has this problem, they will keep reading. If they do not, they will ignore it — which is fine, because they were never a fit anyway.' },
      { type: 'h', text: 'The Anatomy of a Reply-Worthy Message' },
      { type: 'ul', items: [
        'Line 1: the problem, named specifically — no fluff, no flattery',
        'Line 2: a one-sentence observation about why most attempts to solve it fail',
        'Line 3: a single, concrete question they can answer with one sentence',
        'No link, no calendar, no pitch — the goal is a reply, not a sale',
      ]},
      { type: 'p', text: 'The structure is deliberate. Line 1 gets their attention by naming the problem. Line 2 builds credibility by showing you understand why the problem is hard. Line 3 invites a reply by asking a question that is easy to answer and relevant to them. The entire message is three sentences. If you cannot make the case in three sentences, adding more will not help.' },
      { type: 'p', text: 'Here is a full example: "You\'re running paid ads to a landing page with a 2% conversion rate, which means you\'re spending $50 to acquire a $30 customer. Most founders try to fix this by tweaking the ad copy, but the real problem is the landing page does not match the ad promise. What\'s the biggest gap between what your ad says and what your landing page delivers?"' },
      { type: 'p', text: 'Notice what is missing: no introduction, no credentials, no pitch, no link, no call to action. The message is entirely focused on the recipient\'s problem. The question at the end is not a trick — it is a genuine question that, if answered, will tell you whether this person is a fit for your offer. If they reply, you have a conversation. If they do not, you move on.' },
      { type: 'quote', text: 'A cold message should feel like a sharp question from a stranger who already understands you.' },
      { type: 'h', text: 'Volume Is Not the Lever' },
      { type: 'p', text: 'Sending 500 of the wrong message is not a strategy — it is noise generation. Send 30 of the right message, refined three times, before you scale anything. Reply rate is the only number that matters in the first round.' },
      { type: 'p', text: 'The temptation with cold outreach is to scale before you have signal. You write a message, send it to 500 people, get 5 replies, and think: "If I send it to 5,000 people, I\'ll get 50 replies." But that is not how it works. If your reply rate is 1%, scaling does not fix it — it just generates more noise.' },
      { type: 'p', text: 'The right approach is to send the message to 30 people, track the reply rate, and refine. If 30 people ignore it, the message is wrong. Change one variable — the opening line, the question, the audience — and send it to another 30. Repeat until the reply rate is at least 10%. Then, and only then, do you scale.' },
      { type: 'p', text: 'A 10% reply rate means 1 in 10 people found the message relevant enough to respond. That is signal. Anything below 5% is noise. And noise does not get better with volume — it just gets louder.' },
      { type: 'p', text: 'The other mistake is optimizing for opens instead of replies. Open rate tells you the subject line worked. Reply rate tells you the message worked. A 50% open rate with a 0% reply rate means you have a good subject line and a bad message. Fix the message first.' },
      { type: 'p', text: 'Cold outreach is not a numbers game. It is a relevance game. The goal is not to reach as many people as possible — it is to reach the right people with a message so specific that they cannot ignore it. Do that 30 times, and you will learn more than you would from 500 generic sends.' },
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
      { type: 'p', text: 'Most founders treat the launch as a deadline. They pick a date, work backward, and ship whatever is ready by that date. This is how you end up launching with an offer that has not been tested, proof that does not exist, and positioning that is still moving. The launch gets attention, but the attention does not convert, because the brand is not ready to handle it.' },
      { type: 'p', text: 'Lock-in flips this. The launch date is not fixed — it is earned. You do not go public until the checklist is complete. And the checklist is not arbitrary — every item closes a specific failure mode that would otherwise kill the brand in public.' },
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
      { type: 'p', text: 'Let\'s break down each one. The first item — 10 cold conversions without discounting — proves the offer works on its own. If you have only sold to friends, or only sold with a discount, you do not know if the offer is good or if people are just being nice. Cold strangers do not care about being nice. They care about whether the offer solves their problem at the price you are asking. Ten conversions is enough to prove the pattern is real.' },
      { type: 'p', text: 'The second item — three pieces of standalone proof — proves the result is repeatable. Standalone means the proof works without you explaining it. A testimonial so specific that a stranger reading it can picture the result. A before/after so clear the transformation is obvious. A case study so complete it answers objections before they are asked. If you cannot produce three of these, the result is not consistent enough to scale.' },
      { type: 'p', text: 'The third item — stable price for 5 transactions — proves you know what the offer is worth. If you are still experimenting with pricing, you do not have positioning yet. You have a guess. The price should hold steady across at least 5 transactions before you go public, because changing the price after launch is expensive and confusing.' },
      { type: 'p', text: 'The fourth item — one-sentence customer description — proves your positioning is sharp. If you cannot describe the customer in one sentence without using the word "anyone," your positioning is too broad. Broad positioning does not convert, because it does not speak to anyone specifically. The tighter the description, the sharper the messaging, the higher the conversion rate.' },
      { type: 'p', text: 'The fifth item — hands-off fulfillment — proves you can survive growth. If every transaction requires your direct involvement, you do not have a business — you have a job. Before you go public, the fulfillment process needs to run at least once without you touching it. This does not mean it is fully automated — it means someone else can do it, or a system can do it, without you being the bottleneck.' },
      { type: 'p', text: 'The sixth item — a written no — proves you have positioning, not just a product. If you have never said no to a customer, you do not know what the brand stands for. You are just taking anyone who will pay. The written no is a document that says: "We do not serve X type of customer, because Y." And you have to have actually said it to someone, not just written it down. This is the hardest item on the checklist, because it requires turning down money. But it is the only way to prove the brand has a point of view.' },
      { type: 'quote', text: 'If you cannot check every box, the brand is not ready to be seen — it is ready to be tested again.' },
      { type: 'p', text: 'The lock-in checklist is not a suggestion. It is a gate. If you skip an item, you are not saving time — you are borrowing risk. And that risk will come due in public, where it costs 10 times more to fix. The checklist exists to protect you from yourself, from the temptation to launch before you are ready, from the pressure to go public because everyone else is.' },
      { type: 'p', text: 'When every item is checked, the launch is not a gamble — it is a formality. You are not asking the market to validate the offer. You are announcing an offer that has already been validated. The proof is there. The customers are there. The positioning is there. You are just turning on the lights.' },
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
      { type: 'p', text: 'Most founders think proof is something you collect after you have an audience. They launch, get customers, and then ask for testimonials. But this is backward. Proof is not a post-launch activity — it is a pre-launch requirement. The vault is built during the phantom phase, when every transaction is a chance to capture evidence that the offer works.' },
      { type: 'p', text: 'The difference between a brand with a proof vault and a brand without one is the difference between "trust me" and "look at this." The first requires the prospect to take a leap of faith. The second removes the need for faith entirely. The proof does the convincing, so you do not have to.' },
      { type: 'h', text: 'What Belongs in the Vault' },
      { type: 'ul', items: [
        'Raw, unedited testimonials with the customer\'s real name and context',
        'Before/after artifacts — screenshots, numbers, exports, anything visual',
        'A short written case study for every customer, even the small ones',
        'Recorded calls or voice notes where the customer describes the change in their words',
        'Receipts, invoices, and payment confirmations that prove money changed hands',
      ]},
      { type: 'p', text: 'The vault is not a marketing asset — it is a sales asset. Every piece of proof is designed to answer a specific objection or hesitation that a prospect might have. The testimonial answers: "Does this actually work?" The before/after answers: "What will the result look like?" The case study answers: "How does this apply to someone like me?" The recorded call answers: "Is this real or staged?" The receipt answers: "Did someone actually pay for this?"' },
      { type: 'p', text: 'The key is specificity. A generic testimonial like "This was great, highly recommend!" is useless. It could be about anything. A specific testimonial like "I was spending 8 hours a week on invoicing. After using this, it takes me 20 minutes. I got 7 hours of my life back every week." is powerful, because it names the problem, the solution, and the result in concrete terms.' },
      { type: 'p', text: 'The same goes for before/after artifacts. A vague claim like "increased revenue by 30%" is forgettable. A screenshot showing revenue at $12K in January and $15.6K in March, with the dates visible, is proof. The more specific and visual the artifact, the harder it is to dismiss.' },
      { type: 'h', text: 'How to Capture It Without Being Awkward' },
      { type: 'p', text: 'Ask within 48 hours of the customer experiencing the result, while the feeling is still sharp. Send a one-question prompt — "what changed for you?" — and let them write or record at length. The best testimonials are the ones the customer wanted to give but did not know how to start.' },
      { type: 'p', text: 'The timing matters. If you wait a week, the result is no longer fresh in their mind. If you wait a month, they have moved on and the emotional impact is gone. But if you ask within 48 hours, the result is still vivid. They remember the before state, they are experiencing the after state, and the contrast is sharp.' },
      { type: 'p', text: 'The prompt matters too. Do not ask: "Can you write a testimonial?" That is a request for work, and most people will ignore it. Instead, ask: "What changed for you after using this?" That is an invitation to reflect, and most people will respond. The difference is subtle, but the response rate is 10x higher.' },
      { type: 'p', text: 'When they reply, do not edit it. Use their exact words, even if the grammar is imperfect, even if the structure is messy. Raw testimonials are more believable than polished ones, because they sound like a real person, not a marketing team. The only exception is if they share something confidential or sensitive — then you ask permission to redact or anonymize.' },
      { type: 'p', text: 'For before/after artifacts, ask for permission to screenshot or export the data. Most customers will say yes, especially if you explain that it helps other people understand what is possible. If they say no, respect it and move on. But most people are happy to share, as long as you are not asking them to do extra work.' },
      { type: 'quote', text: 'A vault of 10 specific stories beats an audience of 10,000 anonymous followers.' },
      { type: 'h', text: 'Why Private Proof Beats Public Hype' },
      { type: 'p', text: 'Public hype is forgettable. A private case study, surfaced at the exact moment a prospect is hesitating, is the closest thing to a guaranteed conversion. The vault is not for the launch — it is for every sales conversation for the next two years.' },
      { type: 'p', text: 'Here is how it works in practice. A prospect is on your sales page, reading the offer, and they are 80% convinced. But they have one lingering doubt: "Will this work for someone like me?" If you have a case study in the vault of someone in their exact situation, with their exact problem, who got the exact result they want, you send it to them. That case study closes the sale.' },
      { type: 'p', text: 'This is why the vault is built in private, during the phantom phase. By the time you launch, you have 10, 20, 30 case studies covering every type of customer, every objection, every hesitation. You do not need to convince anyone — you just need to find the right piece of proof and show it to them.' },
      { type: 'p', text: 'Public hype, on the other hand, is a one-time event. You launch, you get attention, and then it fades. The hype does not compound — it decays. But proof compounds. Every new customer adds to the vault. Every new case study makes the next sale easier. Every new testimonial strengthens the brand. Two years from now, the launch will be forgotten, but the vault will still be closing sales.' },
      { type: 'p', text: 'The vault is also portable. If you pivot the offer, the proof comes with you. If you change the messaging, the proof adapts. If you target a new audience, you just filter the vault for the most relevant case studies. The vault is not tied to a specific version of the brand — it is tied to the results you deliver, which are the only thing that matters.' },
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
      { type: 'p', text: 'This is the most common mistake in early-stage validation. Something is not working, so the founder panics and changes everything. New headline, new price, new target audience, new positioning. They run the new version, and maybe it works better, maybe it works worse. But they have no idea why, because they changed too many things at once.' },
      { type: 'p', text: 'The problem is not the instinct to iterate — iteration is necessary. The problem is chaotic iteration. When you change multiple variables at once, you lose the ability to learn. You do not know which change caused the improvement, which change caused the decline, and which changes did nothing. You are just guessing, and guessing does not compound.' },
      { type: 'h', text: 'The Single-Variable Loop' },
      { type: 'ul', items: [
        'Pick the variable most likely to be the bottleneck — usually headline, audience, or price',
        'Write the hypothesis in one sentence: "if I change X, then Y will move because Z"',
        'Run the change against at least 30 new cold viewers',
        'Compare against the previous version on a single, pre-chosen metric',
        'Keep, revert, or refine — then move to the next variable',
      ]},
      { type: 'p', text: 'The single-variable loop is a discipline. It forces you to isolate one thing, test it properly, and learn from the result before moving on. It is slower than changing everything at once, but it is the only way to build real knowledge about what works and what does not.' },
      { type: 'p', text: 'The first step is picking the variable. This is not random — you pick the variable most likely to be the bottleneck. If no one is clicking the headline, the bottleneck is the headline. If people are clicking but not buying, the bottleneck is the offer or the price. If people are buying but not coming back, the bottleneck is the delivery. You do not test everything — you test the weakest link.' },
      { type: 'p', text: 'The second step is writing the hypothesis. This is critical, because it forces you to articulate what you think will happen and why. A good hypothesis is specific: "If I change the headline from \'Build your brand in 30 days\' to \'Build your brand before you launch,\' then the click-through rate will increase because the second headline speaks to the phantom-phase mindset." A bad hypothesis is vague: "If I change the headline, it will work better."' },
      { type: 'p', text: 'The third step is running the test. You need at least 30 new cold viewers to get a clean read. Below 30, the noise is too loud. Above 30, the pattern starts to stabilize. And it has to be new viewers — you cannot retest the same people, because they already saw the first version and their behavior is contaminated.' },
      { type: 'p', text: 'The fourth step is comparing the result. You pick one metric — click-through rate, conversion rate, reply rate, whatever is most relevant to the variable you changed — and you compare the new version to the old version. If the metric improved, you keep the change. If it declined, you revert. If it stayed the same, you refine and test again.' },
      { type: 'h', text: 'The Order of Operations' },
      { type: 'p', text: 'Audience first, because the wrong audience will never convert no matter how good the offer. Then headline, because the wrong message will never land even with the right audience. Then price, because price is meaningless until both above are correct. Then proof, because proof only matters once the prospect is leaning in.' },
      { type: 'p', text: 'The order matters because each variable depends on the one before it. If you are targeting the wrong audience, it does not matter how good your headline is — they will not care. If you are targeting the right audience but the headline is wrong, they will not click. If the headline is right but the price is wrong, they will not buy. If the price is right but the proof is missing, they will hesitate.' },
      { type: 'p', text: 'Most founders skip the audience step and go straight to the headline or the price. This is a mistake. The audience is the foundation. If you are trying to sell a $5K offer to people who have a $500 budget, no amount of headline optimization will fix it. You have to start with the right audience, or everything else is wasted effort.' },
      { type: 'p', text: 'Once the audience is right, you move to the headline. The headline is the first filter — it determines whether the prospect keeps reading or moves on. A good headline names the problem or the promise in a way that is immediately relevant to the audience. A bad headline is generic, vague, or focused on the product instead of the customer.' },
      { type: 'p', text: 'Once the headline is right, you move to the price. Price is not just a number — it is a signal. A low price signals low value. A high price signals high value. The right price is the one that matches the perceived value of the offer in the mind of the customer. If the price is too low, they will not take it seriously. If the price is too high, they will not believe it is worth it. The only way to find the right price is to test it.' },
      { type: 'p', text: 'Once the price is right, you move to the proof. Proof is the final push — it removes the last bit of hesitation. But proof only works if the audience, headline, and price are already correct. If the prospect is not interested, proof will not change their mind. If the prospect is interested but the price is wrong, proof will not fix it. Proof is the closer, not the opener.' },
      { type: 'quote', text: 'If you change four things and conversion goes up, you learned nothing. You just got lucky.' },
      { type: 'h', text: 'When to Stop Iterating' },
      { type: 'p', text: 'Stop when the offer has held its conversion rate across two consecutive cohorts of 30. That is not a final answer — it is a stable enough floor to lock in, go public, and let scale reveal the next bottleneck.' },
      { type: 'p', text: 'The temptation is to keep iterating forever, chasing a perfect conversion rate. But perfect does not exist. The goal is not perfection — it is stability. Once the offer converts at a consistent rate across two cohorts, you have enough signal to move forward. You lock in the offer, go public, and start scaling.' },
      { type: 'p', text: 'Scaling will reveal new bottlenecks. Maybe the onboarding process breaks at 50 customers. Maybe the messaging does not work in a different channel. Maybe the price needs to change for a different segment. But you cannot discover these bottlenecks until you scale. And you cannot scale until you have a stable baseline.' },
      { type: 'p', text: 'The single-variable loop is not a one-time process — it is a permanent discipline. Even after launch, even after scale, you are always iterating. But you are iterating with discipline, one variable at a time, with a hypothesis and a metric. That is how you build a brand that gets better over time, instead of one that just gets louder.' },
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
