import React, { FC } from 'react'
import Speaker from '../../components/Speaker'
import { QuciResult, QuciResultLex } from './index'
import { ViewPorps } from '../../interface/IDictResult'
import './style.scss'

export const DictQuci: FC<ViewPorps<QuciResult>> = ({ result }) => {
    switch (result.type) {
        case 'lex':
            return renderLex(result)
        default:
            return null
    }
}

function renderLex(result: QuciResultLex) {
    return (
        <>
            <h1 className="dictQuci-Title">{result.title}</h1>

            {result.phsym && (
                <ul className="dictQuci-Phsym">
                    {result.phsym.map(p => (
                        <li className="dictQuci-PhsymItem" key={p.lang + p.pron}>
                            {p.lang} <Speaker src={p.pron} />
                        </li>
                    ))}
                </ul>
            )}

            {result.cdef && (
                <ul className="dictQuci-Cdef">
                    {result.cdef.map(d => (
                        <li className="dictQuci-CdefItem" key={d.pos}>
                            <span className="dictQuci-CdefItem_Pos">{d.pos}</span>
                            <span className="dictQuci-CdefItem_Def">{d.def}</span>
                        </li>
                    ))}
                </ul>
            )}

            {result.mnemonic && (
                <div className="dictQuci-Container">
                    <h3 className="dictQuci-subTitle">助记提示</h3>
                    <div className="dictQuci-mneList">
                        {result.mnemonic.map((item, idx) => (
                            <div className="dictQuci-mneItem" key={item}>
                                <span>{idx + 1}.</span> <div>{item}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {result.zhOrigin && (
                <div className="dictQuci-Container">
                    <h3 className="dictQuci-subTitle">中文词源</h3>
                    <p><span className="zhOriginTitle">{result.title}</span>
                        <strong>{result.zhOrigin.title}</strong></p>
                    <p>{result.zhOrigin.content}</p>
                </div>
            )}
            {result.enOrigin && (
                <div className="dictQuci-Container">
                    <h3 className="dictQuci-subTitle">英文词源</h3>
                    <div dangerouslySetInnerHTML={{ __html: result.enOrigin }} />
                </div>
            )}
            {result.infs && (
                <ul className="dictQuci-Inf">
                    词形：
                    {result.infs.map(inf => (
                        <li className="dictQuci-InfItem" key={inf}>
                            {inf}
                        </li>
                    ))}
                </ul>
            )}

            {result.sentences && (
                <ol className="dictQuci-SentenceList">
                    {result.sentences.map(sen => (
                        <li className="dictQuci-SentenceItem" key={sen.en}>
                            {sen.en && (
                                <p>
                                    <span dangerouslySetInnerHTML={{ __html: sen.en }} />{' '}
                                    <Speaker src={sen.mp3}></Speaker>
                                </p>
                            )}
                            {sen.chs && <p dangerouslySetInnerHTML={{ __html: sen.chs }} />}
                            {sen.source && (
                                <footer className="dictQuci-SentenceSource">
                                    {sen.source}
                                </footer>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </>
    )
}
