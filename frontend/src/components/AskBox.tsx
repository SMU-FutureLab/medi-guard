import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { AskResponse, DrugDetail } from '../types';
import { ErrorBox, SkeletonLines } from './Status';

const EXAMPLES = ['술 마셔도 돼요?', '하루에 몇 번 먹어요?', '커피랑 같이 먹어도 돼요?', '어떻게 보관해요?'];

interface QA {
  question: string;
  response?: AskResponse;
  error?: Error;
}

export function AskBox({ drug }: { drug: DrugDetail }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<QA[]>([]);
  const pending = history.some((h) => !h.response && !h.error);

  const sectionTitle = (key: string) => drug.sections.find((s) => s.key === key)?.title ?? key;

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || pending) return;
    setQuestion('');
    setHistory((h) => [{ question: text }, ...h]);
    const update = (patch: Partial<QA>) =>
      setHistory((h) => h.map((item, i) => (i === 0 && item.question === text ? { ...item, ...patch } : item)));
    try {
      update({ response: await api.ask(drug.id, text) });
    } catch (e) {
      update({ error: e as Error });
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <section className="ask-box">
      <h2>이 약에 대해 물어보기</h2>
      <p className="muted">공식 의약품 정보에 있는 내용만 답변해요. 없는 내용은 지어내지 않아요.</p>
      <form className="ask-form" onSubmit={submit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="궁금한 점을 입력하세요"
          aria-label="질문 입력"
          maxLength={200}
        />
        <button className="btn btn-primary" type="submit" disabled={pending || !question.trim()}>
          질문
        </button>
      </form>
      <div className="chips">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="chip" onClick={() => ask(ex)} disabled={pending}>
            {ex}
          </button>
        ))}
      </div>

      <ul className="qa-list">
        {history.map((item, i) => (
          <li key={history.length - i} className="qa">
            <p className="qa-q">Q. {item.question}</p>
            {item.error ? (
              <ErrorBox error={item.error} />
            ) : !item.response ? (
              <SkeletonLines lines={2} />
            ) : (
              <div className={`qa-a${item.response.answerable ? '' : ' unanswerable'}`}>
                <p>{item.response.answer}</p>
                {item.response.citations.length > 0 && (
                  <div className="qa-cite">
                    <span className="label">근거 · {sectionTitle(item.response.citations[0].sectionKey)}</span>
                    {item.response.citations.map((c) => (
                      <blockquote key={c.quote}>{c.quote}</blockquote>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
