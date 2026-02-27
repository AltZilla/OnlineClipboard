import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SUPPORTED_LANGUAGES = {
    ta: 'Tamil',
    hi: 'Hindi',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    mr: 'Marathi',
    bn: 'Bengali',
    gu: 'Gujarati',
    pa: 'Punjabi',
    ur: 'Urdu',
    or: 'Odia',
    ne: 'Nepali',
    si: 'Sinhala',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    pt: 'Portuguese',
    it: 'Italian',
    nl: 'Dutch',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    th: 'Thai',
    vi: 'Vietnamese',
    tr: 'Turkish',
    pl: 'Polish',
    sv: 'Swedish',
};

export async function GET() {
    return NextResponse.json({
        success: true,
        languages: SUPPORTED_LANGUAGES,
    });
}

async function translateText(text, sourceLang, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
        },
    });

    if (!response.ok) {
        throw new Error(`Translation API returned ${response.status}`);
    }

    const data = await response.json();

    if (data && data[0]) {
        const translated = data[0]
            .filter((item) => item && item[0])
            .map((item) => item[0])
            .join('');
        return translated;
    }

    throw new Error('Invalid translation response');
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { text, sourceLang = 'en', targetLang } = body;

        if (!text || !targetLang) {
            return NextResponse.json(
                { success: false, error: 'Text and target language are required' },
                { status: 400 }
            );
        }

        if (sourceLang === targetLang) {
            return NextResponse.json({
                success: true,
                translatedText: text,
                sourceLang,
                targetLang,
            });
        }

        const MAX_CHUNK_SIZE = 4500;
        let chunks = [];

        if (text.length <= MAX_CHUNK_SIZE) {
            chunks = [text];
        } else {
            const lines = text.split('\n');
            let currentChunk = '';

            for (const line of lines) {
                if ((currentChunk + '\n' + line).length > MAX_CHUNK_SIZE && currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = line;
                } else {
                    currentChunk = currentChunk ? currentChunk + '\n' + line : line;
                }
            }
            if (currentChunk) {
                chunks.push(currentChunk);
            }
        }

        const translatedChunks = [];
        for (const chunk of chunks) {
            if (chunk.trim() === '') {
                translatedChunks.push('');
                continue;
            }
            const translated = await translateText(chunk, sourceLang, targetLang);
            translatedChunks.push(translated);
        }

        const translatedText = translatedChunks.join('\n');

        return NextResponse.json({
            success: true,
            translatedText,
            sourceLang,
            targetLang,
            targetLangName: SUPPORTED_LANGUAGES[targetLang] || targetLang,
        });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { success: false, error: 'Translation failed. Please try again.' },
            { status: 500 }
        );
    }
}
