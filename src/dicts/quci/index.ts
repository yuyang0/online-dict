import { HtmlDictPlugin } from '../../interface/IPlugin'
import { DictQuci } from './View'
import { getText, getInnerHTML, handleNoResult, DictSearchResult } from '../helpers'
import { QuciPageFetch } from './pagefetch'

const HOST = 'https://www.quword.com'

/** Lexical result */
export interface QuciResultLex {
    type: 'lex'
    title: string
    /** phonetic symbols */
    phsym?: Array<{
        /** Phonetic Alphabet, UK|US|PY */
        lang: string
        /** pronunciation */
        pron: string
    }>
    /** common definitions */
    cdef?: Array<{
        /** part of speech */
        pos: string
        /** definition */
        def: string
    }>
    /** infinitive */
    infs?: string[]
    sentences?: Array<{
        en?: string
        chs?: string
        source?: string
        mp3?: string
    }>
    mnemonic?: string[]
    zhOrigin?: {
        title: string
        content: string
    }
    enOrigin?: string
}

export type QuciResult = QuciResultLex

type QuciSearchResultLex = DictSearchResult<QuciResultLex>

export class QuciPlugin extends HtmlDictPlugin {

    async getPageResult(word: string): Promise<string> {
        const fetch = new QuciPageFetch()
        return await fetch.getPageResult(word)
    }

    parsePageResult(pageResult: string, searchWord: string | undefined): DictSearchResult<QuciResult> | Promise<DictSearchResult<QuciResult>> {
        const doc = new DOMParser().parseFromString(pageResult, 'text/html')
        if (doc.querySelector("#yd-word-pron").textContent !== "") {
            return handleLexResult(doc)
        }

        return handleNoResult<DictSearchResult<QuciResult>>()
    }

    htmlTemplate() {
        return DictQuci
    }
}

function handleLexResult(
    doc: Document
): QuciSearchResultLex | Promise<QuciSearchResultLex> {
    const wordText = getText(doc, '#yd-word');

    const searchResult: DictSearchResult<QuciResultLex> = {
        result: {
            type: 'lex',
            title: wordText
        }
    }

    // pronunciation
    const $prons = getText(doc, '#yd-word-pron').split("\n")
    if ($prons.length > 0) {
        searchResult.result.phsym = $prons.map(langText => {
            let voiceType = 1

            if (/us|美/i.test(langText)) {
                voiceType = 2
            } else if (/uk|英/i.test(langText)) {
                voiceType = 1;
            }
            let pron = `https://dict.youdao.com/dictvoice?audio=${wordText}&type=${voiceType}`
            return {
                lang: langText,
                pron
            }
        })
        let audio = {
            uk: `https://dict.youdao.com/dictvoice?audio=${wordText}&type=1`,
            us: `https://dict.youdao.com/dictvoice?audio=${wordText}&type=2`,
        }

        searchResult.audio = audio
    }

    // definitions
    const $container = doc.querySelector('#yd-word-meaning')

    if ($container) {
        const $defs = Array.from($container.querySelectorAll('li'))
        if ($defs.length > 0) {
            searchResult.result.cdef = $defs.map(el => {
                const elText = getText(el);
                let pos = ""
                let def = elText

                let matched = elText.match(/^[a-z]+\./);
                if (matched.length === 1) {
                    pos = matched[0]
                    def = elText.substring(pos.length).trim()
                }
                return {
                    pos: pos,
                    def: def,
                }
            })
        }
    }

    //mnemonic
    let pageHeaders = doc.querySelectorAll("#yd-content > .page-header")
    let mnemonicElement
    for (let i = 0; i < pageHeaders.length; i++) {
        if (pageHeaders[i].querySelector("h3").textContent === "助记提示") {
            mnemonicElement = pageHeaders[i].nextElementSibling;
        }
    }
    if (mnemonicElement) {
        let parts = mnemonicElement.textContent.split("\n").filter(ss => ss.trim() !== "");
        searchResult.result.mnemonic = parts.map((item) => {
            return item.trim().replace(/^[0-9]+[\.、]/, "").trim()
        })
    }

    // console.log("++++++ cdef", searchResult.result.cdef)
    // console.log("++++++ mnemonic", searchResult.result.mnemonic)

    // ZH origin
    let zhOriginElement
    let enOriginElement
    for (let i = 0; i < pageHeaders.length; i++) {
        let h3Text = pageHeaders[i].querySelector("h3").textContent;
        if (h3Text === "中文词源") {
            zhOriginElement = pageHeaders[i].nextElementSibling;
        } else if (h3Text === "英文词源") {
            enOriginElement = pageHeaders[i].nextElementSibling
        }
    }
    if (zhOriginElement) {
        let title = getText(zhOriginElement.querySelector("span")).trim().replace(wordText, "")
        let content = getText(zhOriginElement.querySelector("p"))
        searchResult.result.zhOrigin = {
            title,
            content
        }
    }
    if (enOriginElement) {
        // append highligh class to <dd> and <dt>
        let dtList = enOriginElement.querySelectorAll("dt")
        let ddList = enOriginElement.querySelectorAll("dd")
        for (let i = 0; i < dtList.length; i++) {
            // remove link in dt
            dtList[i].textContent = getText(dtList[i])
            if (i % 2 !== 0) continue

            // append highlight to even nodes
            dtList[i].classList.add("highlight")
            if (i < ddList.length) {
                ddList[i].classList.add("highlight")
            }
        }
        searchResult.result.enOrigin = enOriginElement.innerHTML
    }

    // TODO extract sentence
    // tense
    const $infs = Array.from(doc.querySelectorAll('.client_word_change_word'))
    if ($infs.length > 0) {
        searchResult.result.infs = $infs.map(el => (el.textContent || '').trim())
    }

    const $sens = doc.querySelectorAll('.client_sentence_list')
    const sentences: typeof searchResult.result.sentences = []
    for (
        let i = 0;
        i < $sens.length;
        i++
    ) {
        const el = $sens[i]
        let mp3 = ''
        const $audio = el.querySelector('.client_aud_o')
        if ($audio) {
            mp3 = (($audio.getAttribute('onclick') || '').match(/https.*\.mp3/) || [
                ''
            ])[0]
        }
        el.querySelectorAll('.client_sen_en_word').forEach($word => {
            $word.outerHTML = getText($word)
        })
        el.querySelectorAll('.client_sen_cn_word').forEach($word => {
            $word.outerHTML = getText($word)
        })
        el.querySelectorAll('.client_sentence_search').forEach($word => {
            $word.outerHTML = `<span class="dictBing-SentenceItem_HL">${getText(
                $word
            )}</span>`
        })
        sentences.push({
            en: getInnerHTML(HOST, el, '.client_sen_en'),
            chs: getInnerHTML(HOST, el, {
                selector: '.client_sen_cn'
            }),
            source: getText(el, '.client_sentence_list_link'),
            mp3
        })
    }
    searchResult.result.sentences = sentences

    if (Object.keys(searchResult.result).length > 2) {
        return searchResult
    }
    return handleNoResult()
}
