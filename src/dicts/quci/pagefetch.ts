import flyio from "flyio"
import { IPageFetch } from "../../interface/IPlugin"

const DICT_LINK = 'https://www.quword.com/w/'
export class QuciPageFetch implements IPageFetch {
    async getPageResult(word: string): Promise<string> {
        const url = DICT_LINK + encodeURIComponent(word.replace(/\s+/g, ' '))
        const response = await flyio.get(url)
        return response.data
    }
}