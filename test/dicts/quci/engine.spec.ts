import { QuciPlugin, QuciResult, QuciResultLex } from '../../../src/dicts/quci/index'
import { DictSearchResult } from '../../../src/dicts/helpers'

describe('Quci', () => {
    it('should parse lex result correctly', () => {
        const word = 'indulge'
        const plugin = new QuciPlugin()
        return plugin.getPageResult(word).then(async pageResult => {
            const searchResult = await plugin.parsePageResult(pageResult, word) as DictSearchResult<QuciResult>
            expect(searchResult.audio).toHaveProperty(
                'us',
                // expect.stringContaining('mp3')
            )
            expect(searchResult.audio).toHaveProperty(
                'uk',
                // expect.stringContaining('mp3')
            )

            const result = searchResult.result as QuciResultLex
            expect(result.type).toBe('lex')
            expect((result.phsym as any).length).toBeGreaterThan(0)
            expect((result.cdef as any).length).toBeGreaterThan(0)
            expect((result.mnemonic as any).length).toBeGreaterThan(0)
            // expect((result.infs as any).length).toBeGreaterThan(0)
            // expect(result.sentences.length).toBeGreaterThanOrEqual(1)
            expect(result.zhOrigin).toHaveProperty('title')
            expect(result.zhOrigin).toHaveProperty('content')
            expect((result.enOrigin as string).length).toBeGreaterThan(0)
        })
    })
})
