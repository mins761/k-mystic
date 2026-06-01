'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import StarryBackground from '@/components/StarryBackground'
import RandomTarotReading from '@/components/RandomTarotReading'
import { dictionary } from '@/lib/i18n'
import type { LanguageCode } from '@/types'

type HomePageProps = {
  params: { lang: LanguageCode }
}

const zodiacMap = [
  { name: 'Rat', ko: '쥐띠', sign: 'aries', icon: '🐀' },
  { name: 'Ox', ko: '소띠', sign: 'taurus', icon: '🐂' },
  { name: 'Tiger', ko: '호랑이띠', sign: 'gemini', icon: '🐅' },
  { name: 'Rabbit', ko: '토끼띠', sign: 'cancer', icon: '🐇' },
  { name: 'Dragon', ko: '용띠', sign: 'leo', icon: '🐉' },
  { name: 'Snake', ko: '뱀띠', sign: 'virgo', icon: '🐍' },
  { name: 'Horse', ko: '말띠', sign: 'libra', icon: '🐎' },
  { name: 'Sheep', ko: '양띠', sign: 'scorpio', icon: '🐑' },
  { name: 'Monkey', ko: '원숭이띠', sign: 'sagittarius', icon: '🐒' },
  { name: 'Rooster', ko: '닭띠', sign: 'capricorn', icon: '🐓' },
  { name: 'Dog', ko: '개띠', sign: 'aquarius', icon: '🐕' },
  { name: 'Pig', ko: '돼지띠', sign: 'pisces', icon: '🐖' },
]

const sacredCards = [
  { number: 0, name: 'The Fool' },
  { number: 1, name: 'The Magician' },
  { number: 2, name: 'The High Priestess' },
  { number: 3, name: 'The Empress' },
  { number: 4, name: 'The Emperor' },
  { number: 5, name: 'The Hierophant' },
  { number: 6, name: 'The Lovers' },
  { number: 7, name: 'The Chariot' },
  { number: 8, name: 'Strength' },
  { number: 9, name: 'The Hermit' },
]

export default function HomePage({ params }: HomePageProps) {
  const lang = params.lang
  const t = dictionary[lang]
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <main className="bg-[#0A0A1A] text-slate-100 overflow-hidden font-body selection:bg-amber-500/30">
      
      {/* 1. HERO SECTION (Royal Korean Tarot Intro) */}
      <section className="relative min-h-[calc(100svh-84px)] overflow-hidden px-6 py-16 md:py-28 flex items-center border-b border-[#C89D3C]/15">
        {/* Subtle Palace & Starry Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(107,33,168,0.22),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(245,158,11,0.14),transparent_50%)]" />
        <StarryBackground />
        
        {/* Decorative Hanok Palace Silhouettes & Cherry Blossoms */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A1A] to-transparent pointer-events-none z-1" />
        
        <div className="relative z-10 mx-auto w-full max-w-7xl grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          
          {/* Left Text Block */}
          <div className="flex flex-col justify-center text-left">
            <span className="text-[0.8rem] font-bold uppercase tracking-[0.45em] text-[#e2c974] drop-shadow-sm">
              Royal Korean Tarot
            </span>
            
            <h1 className="mt-4 font-display text-5xl sm:text-6xl md:text-[5.5rem] font-extrabold leading-none text-white tracking-wide">
              <span className="block text-slate-100/90 text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.2em] mb-2 uppercase">Royal Korean</span>
              <span className="text-gold-gradient tracking-[0.08em] uppercase drop-shadow-[0_4px_18px_rgba(200,157,60,0.3)]">Tarot</span>
            </h1>
            
            <p className="mt-6 text-sm md:text-base font-semibold tracking-[0.3em] text-[#ffd670]/90 uppercase">
              Ancient Wisdom, Future Guidance
            </p>
            
            <h2 className="mt-4 font-display text-lg md:text-xl font-medium tracking-[0.18em] text-slate-200">
              천년의 지혜가 오늘의 운명을 비추다
            </h2>
            
            <p className="mt-5 max-w-xl text-sm md:text-base leading-relaxed text-slate-400 font-light tracking-wide">
              Where the wisdom of Joseon Dynasty meets the mystic power of tarot. 
              Your destiny awaits under the guidance of the stars.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={`/${lang}/tarot`}
                className="bg-red-varnish px-8 py-3.5 rounded-sm font-display text-xs font-bold tracking-[0.25em] text-white transition-all duration-300 flex items-center gap-2"
              >
                <span>START READING</span>
                <span className="text-[0.65rem] text-[#ffd670]">✦</span>
              </Link>
              <Link
                href={`/${lang}/tarot`}
                className="border border-[#C89D3C]/50 hover:border-[#e2c974] bg-[#C89D3C]/5 hover:bg-[#C89D3C]/12 text-[#e2c974] px-8 py-3.5 rounded-sm font-display text-xs font-bold tracking-[0.25em] transition-all duration-300"
              >
                {"DRAW TODAY'S CARD"}
              </Link>
            </div>
          </div>

          {/* Right Visual block: 3 overlapping traditional cards floating dynamically */}
          <div className="relative flex justify-center lg:justify-end h-[420px] md:h-[480px]">
            {/* Soft background aura glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-radial bg-gradient-to-r from-[#C89D3C]/15 to-transparent blur-3xl rounded-full pointer-events-none" />
            
            {/* Card 1: Left Card (3. The Empress) */}
            <div className="absolute left-[5%] bottom-[12%] z-10 w-[140px] md:w-[170px] aspect-[1000/1745] overflow-hidden rounded-xl border border-[#C89D3C]/40 shadow-2xl rotate-[-8deg] hover:rotate-[-4deg] transition-all duration-500 hover:scale-105 hover:z-30 group animate-float">
              <div className="absolute inset-0 bg-mystic-dark">
                <Image
                  src="/images/tarot/deck0/cards/03-the-empress.png"
                  alt="3. The Empress"
                  fill
                  sizes="170px"
                  className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="absolute inset-1.5 border border-[#C89D3C]/20 pointer-events-none" />
              <div className="absolute bottom-2 inset-x-0 text-center z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-mystic-dark/80 text-[0.55rem] font-bold tracking-widest text-[#ffd670] border border-[#C89D3C]/30">3 • THE EMPRESS</span>
              </div>
            </div>

            {/* Card 2: Center Card (6. The Lovers) */}
            <div className="absolute left-[30%] top-[4%] z-20 w-[150px] md:w-[185px] aspect-[1000/1745] overflow-hidden rounded-xl border-2 border-[#C89D3C]/70 shadow-[0_10px_35px_rgba(200,157,60,0.3)] hover:scale-105 hover:z-30 group animate-[float_6.5s_ease-in-out_infinite_1.5s]">
              <div className="absolute inset-0 bg-mystic-dark">
                <Image
                  src="/images/tarot/deck0/cards/06-the-lovers.png"
                  alt="6. The Lovers"
                  fill
                  sizes="185px"
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="absolute inset-2 border border-[#C89D3C]/35 pointer-events-none" />
              <div className="absolute bottom-2.5 inset-x-0 text-center z-10">
                <span className="px-3 py-0.5 rounded-full bg-mystic-dark/95 text-[0.58rem] font-bold tracking-widest text-[#ffd670] border border-[#C89D3C]/50">6 • THE LOVERS</span>
              </div>
            </div>

            {/* Card 3: Right Card (9. The Hermit) */}
            <div className="absolute right-[5%] bottom-[8%] z-10 w-[140px] md:w-[170px] aspect-[1000/1745] overflow-hidden rounded-xl border border-[#C89D3C]/40 shadow-2xl rotate-[10deg] hover:rotate-[6deg] transition-all duration-500 hover:scale-105 hover:z-30 group animate-[float_7.5s_ease-in-out_infinite_0.8s]">
              <div className="absolute inset-0 bg-mystic-dark">
                <Image
                  src="/images/tarot/deck0/cards/09-the-hermit.png"
                  alt="9. The Hermit"
                  fill
                  sizes="170px"
                  className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="absolute inset-1.5 border border-[#C89D3C]/20 pointer-events-none" />
              <div className="absolute bottom-2 inset-x-0 text-center z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-mystic-dark/80 text-[0.55rem] font-bold tracking-widest text-[#ffd670] border border-[#C89D3C]/30">9 • THE HERMIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHOOSE YOUR READING (4 Columns menu cards with gold accents) */}
      <section className="relative px-6 py-20 bg-[#070716] border-b border-[#C89D3C]/15">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h3 className="font-display text-sm font-bold tracking-[0.4em] text-[#e2c974] uppercase">
              Choose Your Reading
            </h3>
            <p className="mt-2 text-xs font-semibold tracking-[0.25em] text-[#C89D3C]/70">
              당신의 운명을 선택하세요
            </p>
            <div className="mt-4 mx-auto h-[1px] w-12 bg-gradient-to-r from-transparent via-[#C89D3C] to-transparent" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: TAROT */}
            <Link
              href={`/${lang}/tarot`}
              className="border-gold-filigree bg-[#0A0A1C]/80 hover:bg-[#0E0E25]/90 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 group rounded-sm"
            >
              {/* Corner filigrees */}
              <div className="filigree-corner top-1.5 left-1.5" />
              <div className="filigree-corner top-1.5 right-1.5" />
              <div className="filigree-corner bottom-1.5 left-1.5" />
              <div className="filigree-corner bottom-1.5 right-1.5" />
              
              {/* Icon */}
              <div className="w-16 h-16 flex items-center justify-center text-[#C89D3C] group-hover:text-[#ffd670] transition-colors mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="font-display text-base font-bold tracking-[0.25em] text-[#e2c974] uppercase">Tarot</h4>
              <p className="mt-2 text-xs font-bold text-slate-300">타로카드</p>
              <p className="mt-1 text-[0.68rem] text-[#C89D3C]/70 font-light">오늘의 메시지</p>
            </Link>

            {/* Card 2: SAJU */}
            <Link
              href={`/${lang}/saju`}
              className="border-gold-filigree bg-[#0A0A1C]/80 hover:bg-[#0E0E25]/90 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 group rounded-sm"
            >
              <div className="filigree-corner top-1.5 left-1.5" />
              <div className="filigree-corner top-1.5 right-1.5" />
              <div className="filigree-corner bottom-1.5 left-1.5" />
              <div className="filigree-corner bottom-1.5 right-1.5" />
              
              <div className="w-16 h-16 flex items-center justify-center text-[#C89D3C] group-hover:text-[#ffd670] transition-colors mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" strokeWidth="1" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v3m0 12v3m-9-9h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
                </svg>
              </div>
              <h4 className="font-display text-base font-bold tracking-[0.25em] text-[#e2c974] uppercase">Saju</h4>
              <p className="mt-2 text-xs font-bold text-slate-300">사주팔자</p>
              <p className="mt-1 text-[0.68rem] text-[#C89D3C]/70 font-light">생년월일 문제 분석</p>
            </Link>

            {/* Card 3: COMPATIBILITY */}
            <Link
              href={`/${lang}/love`}
              className="border-gold-filigree bg-[#0A0A1C]/80 hover:bg-[#0E0E25]/90 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 group rounded-sm"
            >
              <div className="filigree-corner top-1.5 left-1.5" />
              <div className="filigree-corner top-1.5 right-1.5" />
              <div className="filigree-corner bottom-1.5 left-1.5" />
              <div className="filigree-corner bottom-1.5 right-1.5" />
              
              <div className="w-16 h-16 flex items-center justify-center text-[#C89D3C] group-hover:text-[#ffd670] transition-colors mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-display text-base font-bold tracking-[0.25em] text-[#e2c974] uppercase">Compatibility</h4>
              <p className="mt-2 text-xs font-bold text-slate-300">궁합</p>
              <p className="mt-1 text-[0.68rem] text-[#C89D3C]/70 font-light">연인 • 가족 • 친구</p>
            </Link>

            {/* Card 4: DAILY FORTUNE */}
            <Link
              href={`/${lang}/horoscope`}
              className="border-gold-filigree bg-[#0A0A1C]/80 hover:bg-[#0E0E25]/90 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 group rounded-sm"
            >
              <div className="filigree-corner top-1.5 left-1.5" />
              <div className="filigree-corner top-1.5 right-1.5" />
              <div className="filigree-corner bottom-1.5 left-1.5" />
              <div className="filigree-corner bottom-1.5 right-1.5" />
              
              <div className="w-16 h-16 flex items-center justify-center text-[#C89D3C] group-hover:text-[#ffd670] transition-colors mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h4 className="font-display text-base font-bold tracking-[0.25em] text-[#e2c974] uppercase">Daily Fortune</h4>
              <p className="mt-2 text-xs font-bold text-slate-300">오늘의 운세</p>
              <p className="mt-1 text-[0.68rem] text-[#C89D3C]/70 font-light">매일 업데이트</p>
            </Link>

          </div>
        </div>
      </section>

      {/* 3. TODAY'S DESTINY & KOREAN ZODIAC */}
      <section className="relative px-6 py-20 bg-[#0A0A1A] border-b border-[#C89D3C]/15">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          
          {/* Left Block: TODAY'S DESTINY */}
          <div className="border-gold-filigree bg-[#070716]/90 p-8 rounded-sm">
            <div className="filigree-corner top-1.5 left-1.5" />
            <div className="filigree-corner top-1.5 right-1.5" />
            <div className="filigree-corner bottom-1.5 left-1.5" />
            <div className="filigree-corner bottom-1.5 right-1.5" />

            <h3 className="font-display text-sm font-bold tracking-[0.3em] text-[#e2c974] uppercase mb-1">
              {"Today's Destiny"}
            </h3>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[#C89D3C]/80 mb-6">
              오늘의 운세
            </p>

            <div className="grid gap-6 sm:grid-cols-[1fr_1.1fr] items-center">
              
              {/* Card visual */}
              <div className="relative w-full aspect-[1000/1745] max-w-[170px] mx-auto rounded-lg overflow-hidden border border-[#C89D3C]/50 shadow-md">
                <Image
                  src="/images/tarot/deck0/cards/03-the-empress.png"
                  alt="Today's Card"
                  fill
                  sizes="170px"
                  className="object-cover"
                />
                <div className="absolute inset-1 border border-[#C89D3C]/20 pointer-events-none" />
                <div className="absolute bottom-1.5 inset-x-0 text-center z-10">
                  <span className="px-2 py-0.5 rounded bg-mystic-dark/90 text-[0.5rem] font-bold text-[#ffd670] border border-[#C89D3C]/30">3 • THE EMPRESS</span>
                </div>
              </div>

              {/* Status information */}
              <div className="text-left space-y-4">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#C89D3C]/80 flex items-center gap-1.5">
                    <span className="text-red-400">❤</span> Love
                  </span>
                  <span className="text-xs text-[#ffd670] mt-1 font-semibold">⭐⭐⭐⭐⭐</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#C89D3C]/80 flex items-center gap-1.5">
                    <span className="text-blue-400">💼</span> Career
                  </span>
                  <span className="text-xs text-[#ffd670] mt-1 font-semibold">⭐⭐⭐<span className="text-[#C89D3C]/20">⭐⭐</span></span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#C89D3C]/80 flex items-center gap-1.5">
                    <span className="text-yellow-500">🪙</span> Money
                  </span>
                  <span className="text-xs text-[#ffd670] mt-1 font-semibold">⭐⭐⭐<span className="text-[#C89D3C]/20">⭐⭐</span></span>
                </div>

                <div className="flex flex-col pt-1">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#C89D3C]/80">
                    Lucky Number
                  </span>
                  <span className="text-2xl font-display font-extrabold text-gold-gradient mt-0.5">7</span>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/${lang}/tarot`}
                    className="inline-block border border-[#C89D3C]/50 hover:border-[#e2c974] text-[#e2c974] text-[0.62rem] font-bold tracking-[0.25em] px-4 py-2 rounded-sm uppercase transition-all duration-300 hover:bg-[#C89D3C]/5"
                  >
                    View Full Reading
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Right Block: KOREAN ZODIAC (12지신 운세) */}
          <div className="flex flex-col justify-center">
            <h3 className="font-display text-sm font-bold tracking-[0.3em] text-[#e2c974] uppercase mb-1">
              Korean Zodiac
            </h3>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[#C89D3C]/80 mb-8">
              12지신 운세
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 justify-center">
              {zodiacMap.map((zodiac) => (
                <Link
                  key={zodiac.name}
                  href={`/${lang}/horoscope/${zodiac.sign}`}
                  className="flex flex-col items-center group"
                >
                  <div className="w-14 h-14 rounded-full border border-[#C89D3C]/30 group-hover:border-[#e2c974] bg-[#070716]/90 group-hover:bg-[#C89D3C]/10 flex items-center justify-center text-xl transition-all duration-300 group-hover:shadow-[0_0_18px_rgba(200,157,60,0.3)] group-hover:scale-105">
                    <span className="filter grayscale group-hover:grayscale-0 transition-all">{zodiac.icon}</span>
                  </div>
                  <span className="mt-2.5 text-[0.68rem] font-bold tracking-wider text-slate-300 group-hover:text-[#ffd670] transition-colors">{zodiac.ko}</span>
                  <span className="text-[0.55rem] tracking-widest text-[#C89D3C]/60 uppercase font-light mt-0.5">{zodiac.name}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4. SACRED CARDS (Carousel horizontal slider) */}
      <section className="relative px-6 py-20 bg-[#070716] border-b border-[#C89D3C]/15">
        <div className="mx-auto max-w-7xl">
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="font-display text-sm font-bold tracking-[0.3em] text-[#e2c974] uppercase mb-1">
                Sacred Cards
              </h3>
              <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[#C89D3C]/80">
                신성한 타로 카드
              </p>
            </div>
            
            {/* Arrows */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="w-9 h-9 rounded-sm border border-[#C89D3C]/40 hover:border-[#e2c974] text-[#e2c974] flex items-center justify-center transition-all bg-[#0A0A1A]/40 hover:bg-[#C89D3C]/10"
                aria-label="Scroll left"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="w-9 h-9 rounded-sm border border-[#C89D3C]/40 hover:border-[#e2c974] text-[#e2c974] flex items-center justify-center transition-all bg-[#0A0A1A]/40 hover:bg-[#C89D3C]/10"
                aria-label="Scroll right"
              >
                &gt;
              </button>
            </div>
          </div>

          {/* Carousel body */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-2"
          >
            {sacredCards.map((card) => (
              <div
                key={card.number}
                className="relative w-[130px] sm:w-[150px] aspect-[1000/1745] flex-shrink-0 rounded-lg overflow-hidden border border-[#C89D3C]/35 hover:border-[#e2c974] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-[#0A0A1C] group"
              >
                <Image
                  src={`/images/tarot/deck0/cards/${String(card.number).padStart(2, '0')}-${card.name.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-')}.png`}
                  alt={card.name}
                  fill
                  sizes="150px"
                  className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-1.5 border border-[#C89D3C]/15 pointer-events-none" />
                <div className="absolute bottom-1.5 inset-x-0 text-center z-10">
                  <span className="px-2 py-0.5 rounded bg-mystic-dark/95 text-[0.48rem] font-bold text-[#ffd670] border border-[#C89D3C]/20 tracking-wider">
                    {card.number}. {card.name.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Daily Tarot Interactive Draw Section */}
      <RandomTarotReading
        lang={lang}
        todayTarot={t.todayTarot}
        readFull={t.readFull}
        lucky={t.lucky}
        newsletter={t.newsletter}
        subscribe={t.subscribe}
      />

      {/* 5. THE FUTURE AWAITS */}
      <section className="relative px-6 py-28 text-center bg-gradient-to-b from-[#0A0A1A] to-[#070714]">
        {/* Subtle Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(107,33,168,0.18),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center">
          <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-gold-gradient tracking-[0.1em] uppercase drop-shadow-[0_2px_10px_rgba(200,157,60,0.2)]">
            The Future Awaits
          </h3>
          <p className="mt-3 text-xs md:text-sm font-semibold tracking-[0.25em] text-[#C89D3C]/80">
            당신의 운명을 확인해보세요
          </p>
          <div className="mt-4 h-[1px] w-16 bg-gradient-to-r from-transparent via-[#C89D3C] to-transparent" />
          
          <div className="mt-10">
            <Link
              href={`/${lang}/tarot`}
              className="bg-red-varnish px-9 py-4 rounded-sm font-display text-xs font-bold tracking-[0.25em] text-white transition-all duration-300 shadow-[0_0_20px_rgba(128,16,16,0.5)] hover:scale-105 active:scale-98"
            >
              START YOUR JOURNEY ✦
            </Link>
          </div>

          {/* 4 Compliance icons / trust badges */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-[#C89D3C]/15 pt-12">
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center text-[#e2c974] mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[0.62rem] tracking-[0.18em] text-[#C89D3C] font-semibold uppercase">AI Powered</span>
              <span className="text-[0.55rem] tracking-wider text-slate-400 font-light mt-0.5">AI 기반 분석</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center text-[#e2c974] mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-[0.62rem] tracking-[0.18em] text-[#C89D3C] font-semibold uppercase">Ancient Wisdom</span>
              <span className="text-[0.55rem] tracking-wider text-slate-400 font-light mt-0.5">천년의 지혜</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center text-[#e2c974] mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[0.62rem] tracking-[0.18em] text-[#C89D3C] font-semibold uppercase">Accurate Readings</span>
              <span className="text-[0.55rem] tracking-wider text-slate-400 font-light mt-0.5">정확한 예측</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center text-[#e2c974] mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-[0.62rem] tracking-[0.18em] text-[#C89D3C] font-semibold uppercase">Private & Secure</span>
              <span className="text-[0.55rem] tracking-wider text-slate-400 font-light mt-0.5">안전한 보안</span>
            </div>

          </div>

        </div>
      </section>

    </main>
  )
}
