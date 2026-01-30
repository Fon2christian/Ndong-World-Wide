import { describe, it, expect } from 'vitest'
import { translations } from './translations'
import type { Language } from './translations'

describe('translations', () => {
  const languages: Language[] = ['en', 'fr', 'ja']

  describe('structure', () => {
    it('should have all required languages', () => {
      expect(translations).toHaveProperty('en')
      expect(translations).toHaveProperty('fr')
      expect(translations).toHaveProperty('ja')
    })

    it('should have same structure for all languages', () => {
      const englishKeys = Object.keys(translations.en)

      languages.forEach(lang => {
        const langKeys = Object.keys(translations[lang])
        expect(langKeys).toEqual(englishKeys)
      })
    })
  })

  describe('nav translations', () => {
    it('should have all nav keys in all languages', () => {
      languages.forEach(lang => {
        expect(translations[lang].nav).toHaveProperty('home')
        expect(translations[lang].nav).toHaveProperty('market')
        expect(translations[lang].nav).toHaveProperty('business')
        expect(translations[lang].nav).toHaveProperty('flow')
        expect(translations[lang].nav).toHaveProperty('company')
      })
    })

    it('should have non-empty nav values', () => {
      languages.forEach(lang => {
        expect(translations[lang].nav.home.length).toBeGreaterThan(0)
        expect(translations[lang].nav.market.length).toBeGreaterThan(0)
      })
    })
  })

  describe('hero translations', () => {
    it('should have all hero keys in all languages', () => {
      languages.forEach(lang => {
        expect(translations[lang].hero).toHaveProperty('welcome')
        expect(translations[lang].hero).toHaveProperty('subtitle')
        expect(translations[lang].hero).toHaveProperty('tagline')
      })
    })

    it('should include company name in welcome message', () => {
      languages.forEach(lang => {
        expect(translations[lang].hero.welcome).toContain('Ndong World Wide')
      })
    })
  })

  describe('mission translations', () => {
    it('should have all mission keys in all languages', () => {
      languages.forEach(lang => {
        expect(translations[lang].mission).toHaveProperty('title')
        expect(translations[lang].mission).toHaveProperty('text')
      })
    })
  })

  describe('CEO translations', () => {
    it('should have all CEO keys in all languages', () => {
      languages.forEach(lang => {
        expect(translations[lang].ceo).toHaveProperty('title')
        expect(translations[lang].ceo).toHaveProperty('leaders')
      })
    })

    it('should have exactly two leaders in all languages', () => {
      languages.forEach(lang => {
        expect(Array.isArray(translations[lang].ceo.leaders)).toBe(true)
        expect(translations[lang].ceo.leaders.length).toBe(2)
      })
    })

    it('should have correct leader structure in all languages', () => {
      languages.forEach(lang => {
        translations[lang].ceo.leaders.forEach(leader => {
          expect(leader).toHaveProperty('message')
          expect(leader).toHaveProperty('name')
          expect(leader).toHaveProperty('position')
          expect(leader).toHaveProperty('image')
          expect(leader.message.length).toBeGreaterThan(0)
          expect(leader.name.length).toBeGreaterThan(0)
          expect(leader.position.length).toBeGreaterThan(0)
          expect(leader.image.length).toBeGreaterThan(0)
        })
      })
    })

    it('should have Yoko Hitomi as first leader (CEO) in English', () => {
      expect(translations.en.ceo.leaders[0].name).toBe('Yoko Hitomi')
      expect(translations.en.ceo.leaders[0].position).toBe('CEO')
    })

    it('should have Tebit Fidglas Fon as second leader (Co-CEO) in English', () => {
      expect(translations.en.ceo.leaders[1].name).toBe('Tebit Fidglas Fon')
      expect(translations.en.ceo.leaders[1].position).toBe('Co-CEO')
    })

    it('should have correct CEO positions in French', () => {
      expect(translations.fr.ceo.leaders[0].position).toBe('PDG')
      expect(translations.fr.ceo.leaders[1].position).toBe('Co-PDG')
    })

    it('should have correct CEO positions in Japanese', () => {
      expect(translations.ja.ceo.leaders[0].position).toBe('CEO')
      expect(translations.ja.ceo.leaders[1].position).toBe('共同CEO')
    })
  })

  describe('provision translations', () => {
    const provisionTypes = ['carProvision', 'tyresProvision', 'wheelsProvision'] as const

    provisionTypes.forEach(provision => {
      describe(provision, () => {
        it('should have all keys in all languages', () => {
          languages.forEach(lang => {
            expect(translations[lang][provision]).toHaveProperty('title')
            expect(translations[lang][provision]).toHaveProperty('description')
            expect(translations[lang][provision]).toHaveProperty('features')
          })
        })

        it('should have non-empty features array', () => {
          languages.forEach(lang => {
            expect(Array.isArray(translations[lang][provision].features)).toBe(true)
            expect(translations[lang][provision].features.length).toBeGreaterThan(0)
          })
        })
      })
    })
  })

  describe('footer translations', () => {
    it('should have all footer keys in all languages', () => {
      languages.forEach(lang => {
        expect(translations[lang].footer).toHaveProperty('address')
        expect(translations[lang].footer).toHaveProperty('quickLinks')
        expect(translations[lang].footer).toHaveProperty('ourServices')
        expect(translations[lang].footer).toHaveProperty('copyright')
      })
    })
  })

  describe('specific translations', () => {
    it('should have correct English translations', () => {
      expect(translations.en.nav.home).toBe('Home')
      expect(translations.en.nav.market).toBe('Market')
      expect(translations.en.footer.quickLinks).toBe('Quick Links')
    })

    it('should have correct French translations', () => {
      expect(translations.fr.nav.home).toBe('Accueil')
      expect(translations.fr.nav.market).toBe('Marché')
      expect(translations.fr.footer.quickLinks).toBe('Liens Rapides')
    })

    it('should have correct Japanese translations', () => {
      expect(translations.ja.nav.home).toBe('ホーム')
      expect(translations.ja.nav.market).toBe('マーケット')
      expect(translations.ja.footer.quickLinks).toBe('クイックリンク')
    })
  })
})
