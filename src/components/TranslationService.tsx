"use client"

interface TranslationResult {
  translatedText: string;
  success: boolean;
  error?: string;
}

interface LanguageCode {
  code: string;
  name: string;
}

export class TranslationService {
  private static readonly SUPPORTED_LANGUAGES: Record<string, LanguageCode> = {
    'Spanish': { code: 'es', name: 'Spanish' },
    'French': { code: 'fr', name: 'French' },
    'German': { code: 'de', name: 'German' },
    'Portuguese': { code: 'pt', name: 'Portuguese' },
    'Italian': { code: 'it', name: 'Italian' },
    'Russian': { code: 'ru', name: 'Russian' },
    'Chinese': { code: 'zh', name: 'Chinese' },
    'Japanese': { code: 'ja', name: 'Japanese' },
    'Korean': { code: 'ko', name: 'Korean' }
  };

  private static readonly ECOMMERCE_TERMS: Record<string, Record<string, string>> = {
    'Spanish': {
      'product': 'producto', 'quality': 'calidad', 'premium': 'premium', 'professional': 'profesional',
      'makeup': 'maquillaje', 'cosmetic': 'cosmético', 'beauty': 'belleza', 'shipping': 'envío',
      'fast': 'rápido', 'free': 'gratis', 'delivery': 'entrega', 'guaranteed': 'garantizado',
      'authentic': 'auténtico', 'original': 'original', 'brand': 'marca', 'new': 'nuevo',
      'bestseller': 'más vendido', 'sale': 'oferta', 'discount': 'descuento', 'price': 'precio'
    },
    'French': {
      'product': 'produit', 'quality': 'qualité', 'premium': 'premium', 'professional': 'professionnel',
      'makeup': 'maquillage', 'cosmetic': 'cosmétique', 'beauty': 'beauté', 'shipping': 'expédition',
      'fast': 'rapide', 'free': 'gratuit', 'delivery': 'livraison', 'guaranteed': 'garanti',
      'authentic': 'authentique', 'original': 'original', 'brand': 'marque', 'new': 'nouveau',
      'bestseller': 'best-seller', 'sale': 'promotion', 'discount': 'remise', 'price': 'prix'
    },
    'German': {
      'product': 'Produkt', 'quality': 'Qualität', 'premium': 'Premium', 'professional': 'professionell',
      'makeup': 'Make-up', 'cosmetic': 'Kosmetik', 'beauty': 'Schönheit', 'shipping': 'Versand',
      'fast': 'schnell', 'free': 'kostenlos', 'delivery': 'Lieferung', 'guaranteed': 'garantiert',
      'authentic': 'authentisch', 'original': 'original', 'brand': 'Marke', 'new': 'neu',
      'bestseller': 'Bestseller', 'sale': 'Angebot', 'discount': 'Rabatt', 'price': 'Preis'
    },
    'Portuguese': {
      'product': 'produto', 'quality': 'qualidade', 'premium': 'premium', 'professional': 'profissional',
      'makeup': 'maquiagem', 'cosmetic': 'cosmético', 'beauty': 'beleza', 'shipping': 'envio',
      'fast': 'rápido', 'free': 'grátis', 'delivery': 'entrega', 'guaranteed': 'garantido',
      'authentic': 'autêntico', 'original': 'original', 'brand': 'marca', 'new': 'novo',
      'bestseller': 'mais vendido', 'sale': 'promoção', 'discount': 'desconto', 'price': 'preço'
    },
    'Italian': {
      'product': 'prodotto', 'quality': 'qualità', 'premium': 'premium', 'professional': 'professionale',
      'makeup': 'trucco', 'cosmetic': 'cosmetico', 'beauty': 'bellezza', 'shipping': 'spedizione',
      'fast': 'veloce', 'free': 'gratuito', 'delivery': 'consegna', 'guaranteed': 'garantito',
      'authentic': 'autentico', 'original': 'originale', 'brand': 'marchio', 'new': 'nuovo',
      'bestseller': 'bestseller', 'sale': 'offerta', 'discount': 'sconto', 'price': 'prezzo'
    }
  };

  static async translateText(text: string, targetLanguage: string): Promise<TranslationResult> {
    if (targetLanguage === 'English' || !text.trim()) {
      return { translatedText: text, success: true };
    }

    try {
      // Try Google Translate API first (free tier available)
      const googleResult = await this.tryGoogleTranslate(text, targetLanguage);
      if (googleResult.success) {
        return googleResult;
      }

      // Try LibreTranslate (open source alternative)
      const libreResult = await this.tryLibreTranslate(text, targetLanguage);
      if (libreResult.success) {
        return libreResult;
      }

      // Fallback to enhanced manual translation
      const manualResult = this.translateManually(text, targetLanguage);
      return { translatedText: manualResult, success: true };

    } catch (error) {
      console.error('Translation error:', error);
      const manualResult = this.translateManually(text, targetLanguage);
      return { 
        translatedText: manualResult, 
        success: true, 
        error: 'Used fallback translation'
      };
    }
  }

  private static async tryGoogleTranslate(text: string, targetLanguage: string): Promise<TranslationResult> {
    const langCode = this.SUPPORTED_LANGUAGES[targetLanguage]?.code;
    if (!langCode) {
      throw new Error('Unsupported language');
    }

    try {
      // Using the free Google Translate API endpoint
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Google Translate API error');
      }

      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return {
          translatedText: data[0][0][0],
          success: true
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Google Translate failed:', error);
      return { translatedText: '', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private static async tryLibreTranslate(text: string, targetLanguage: string): Promise<TranslationResult> {
    const langCode = this.SUPPORTED_LANGUAGES[targetLanguage]?.code;
    if (!langCode) {
      throw new Error('Unsupported language');
    }

    try {
      // Using LibreTranslate free API
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: langCode,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error('LibreTranslate API error');
      }

      const data = await response.json();
      if (data && data.translatedText) {
        return {
          translatedText: data.translatedText,
          success: true
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('LibreTranslate failed:', error);
      return { translatedText: '', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private static translateManually(text: string, targetLanguage: string): string {
    const terms = this.ECOMMERCE_TERMS[targetLanguage];
    if (!terms) {
      return `[${targetLanguage}] ${text}`;
    }

    let translatedText = text;
    
    // Replace e-commerce specific terms
    Object.entries(terms).forEach(([english, foreign]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, foreign);
    });

    // Replace common words
    const commonWords: string | undefined = {
      'Spanish': 'y|el|la|de|para|con|en|un|una|es|son|muy|más|mejor|bueno|grande|pequeño',
      'French': 'et|le|la|de|pour|avec|en|un|une|est|sont|très|plus|meilleur|bon|grand|petit',
      'German': 'und|der|die|das|von|für|mit|in|ein|eine|ist|sind|sehr|mehr|beste|gut|groß|klein',
      'Portuguese': 'e|o|a|de|para|com|em|um|uma|é|são|muito|mais|melhor|bom|grande|pequeno',
      'Italian': 'e|il|la|di|per|con|in|un|una|è|sono|molto|più|migliore|buono|grande|piccolo'
    }[targetLanguage];

    if (commonWords) {
      // This is a simplified approach - in reality you'd need more sophisticated grammar rules
      translatedText = translatedText.replace(/\band\b/gi, targetLanguage === 'Spanish' ? 'y' : targetLanguage === 'French' ? 'et' : targetLanguage === 'German' ? 'und' : targetLanguage === 'Portuguese' ? 'e' : 'e');
      translatedText = translatedText.replace(/\bthe\b/gi, targetLanguage === 'Spanish' ? 'el/la' : targetLanguage === 'French' ? 'le/la' : targetLanguage === 'German' ? 'der/die/das' : targetLanguage === 'Portuguese' ? 'o/a' : 'il/la');
      translatedText = translatedText.replace(/\bfor\b/gi, targetLanguage === 'Spanish' ? 'para' : targetLanguage === 'French' ? 'pour' : targetLanguage === 'German' ? 'für' : targetLanguage === 'Portuguese' ? 'para' : 'per');
      translatedText = translatedText.replace(/\bwith\b/gi, targetLanguage === 'Spanish' ? 'con' : targetLanguage === 'French' ? 'avec' : targetLanguage === 'German' ? 'mit' : targetLanguage === 'Portuguese' ? 'com' : 'con');
    }

    return translatedText;
  }

  static getSupportedLanguages(): string[] {
    return Object.keys(this.SUPPORTED_LANGUAGES);
  }

  static getLanguageCode(language: string): string | undefined {
    return this.SUPPORTED_LANGUAGES[language]?.code;
  }
}