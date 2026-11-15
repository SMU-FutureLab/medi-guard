import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Icon } from '../components/Icon';
import { PageTop } from '../components/Layout';
import { SourceInfo } from '../components/SourceInfo';
import { ErrorBox, SkeletonLines, Spinner } from '../components/Status';
import { useAsync } from '../hooks/useAsync';
import type { AskResponse, DrugDetail } from '../types';

const EXAMPLES = ['복용 시 주의해야 할 점이 있나요?', '하루에 몇 번 먹어요?', '다른 약이랑 같이 먹어도 돼요?', '어떻게 보관해요?'];

interface QA {
  question: string;
  response?: AskResponse;
  error?: Error;
}

/** 문장 단위로 나눠 목록으로 보여준다 */
const toBullets = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);

export function DrugChatPage() {
  const { id = '' } = useParams();
  const drug = useAsync(() => api.getDrug(id), [id]);

  if (drug.loading) return <Spinner label="의약품 정보를 불러오고 있어요…" />;
  if (drug.error || !drug.data) return <ErrorBox error={drug.error ?? new Error('정보가 없어요.')} onRetry={drug.retry} />;
  return <Chat drug={drug.data} />;
}

function Chat({ drug }: { drug: DrugDetail }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<QA[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const pending = messages.some((m) => !m.response && !m.error);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || pending) return;
    setQuestion('');
    const index = messages.length;
    setMessages((m) => [...m, { question: text }]);
    const update = (patch: Partial<QA>) => setMessages((m) => m.map((item, i) => (i === index ? { ...item, ...patch } : item)));
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
    <div className="page chat">
      <PageTop title={`${drug.name} · AI 쉽게 설명`} />

      <div className="chat-intro">
        <span className="ai-avatar">
          <Icon name="sparkle" size={22} />
        </span>
        <p>
          공식 의약품 정보에 있는 내용만 쉬운 말로 알려드려요. 정보에 없는 내용은 지어내지 않아요.
        </p>
      </div>

      {messages.length === 0 && (
        <div className="chips">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => ask(ex)}>
              {ex}
            </button>
          ))}
        </div>
      )}

      <ul className="messages">
        {messages.map((m, i) => (
          <li key={i} className="turn">
            <div className="bubble-user">
              <Icon name="user" size={18} />
              <p>{m.question}</p>
            </div>
            <div className="answer-row">
              <span className="ai-avatar">
                <Icon name="sparkle" size={22} />
              </span>
              {m.error ? (
                <ErrorBox error={m.error} />
              ) : !m.response ? (
                <div className="answer">
                  <SkeletonLines lines={3} />
                </div>
              ) : (
                <Answer drug={drug} response={m.response} />
              )}
            </div>
          </li>
        ))}
      </ul>
      <div ref={endRef} />

      <form className="composer" onSubmit={submit}>
        <input
          id="chat-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="이 약에 대해 궁금한 점을 물어보세요"
          aria-label="질문 입력"
          maxLength={200}
        />
        <button className="send-btn" type="submit" disabled={pending || !question.trim()} aria-label="질문 보내기">
          <Icon name="send" />
        </button>
      </form>
    </div>
  );
}

function Answer({ drug, response }: { drug: DrugDetail; response: AskResponse }) {
  const [showEvidence, setShowEvidence] = useState(false);

  if (!response.answerable) {
    return (
      <div className="answer unanswerable">
        <p>{response.answer}</p>
      </div>
    );
  }

  const sectionTitle = drug.sections.find((s) => s.key === response.citations[0]?.sectionKey)?.title;

  return (
    <div className="answer-wrap">
      <div className="answer">
        <p className="answer-lead">공식 정보에서 찾은 내용이에요.</p>
        <ul className="bullets">
          {toBullets(response.answer).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
      {response.citations.length > 0 && (
        <div className={`evidence${showEvidence ? ' open' : ''}`}>
          <button type="button" className="evidence-head" aria-expanded={showEvidence} onClick={() => setShowEvidence((v) => !v)}>
            <Icon name="file" />
            <span>답변 근거 (공식 원문)</span>
            <Icon name={showEvidence ? 'chevronDown' : 'chevronRight'} className="chevron" />
          </button>
          {showEvidence && (
            <div className="evidence-body">
              {sectionTitle && <p className="label">{sectionTitle}</p>}
              {response.citations.map((c) => (
                <blockquote key={c.quote}>{c.quote}</blockquote>
              ))}
              <SourceInfo source={drug.source} />
              <Link to={`/drugs/${drug.id}`} className="text-link">
                공식 정보 전체 보기 →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
