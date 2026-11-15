import { Disclaimer } from '../components/Disclaimer';
import { Icon } from '../components/Icon';
import { PageTop } from '../components/Layout';

export function AboutPage() {
  return (
    <div className="page prose">
      <PageTop title="서비스 안내" />
      <p className="lead">
        MEDI GUARD는 식품의약품안전처의 공식 의약품 정보를 AI가 쉬운 말로 설명해 주는 서비스예요. 설명마다 근거가 된
        공식 원문을 함께 보여드려요.
      </p>

      <section className="panel">
        <h2>
          <Icon name="sparkle" /> AI 쉬운 설명은 이렇게 만들어져요
        </h2>
        <ol className="steps-list">
          <li>선택한 의약품의 공식 정보(효능, 용법, 주의사항 등)를 먼저 찾아요.</li>
          <li>찾은 원문만 AI에게 전달해서 쉬운 말로 바꿔 달라고 해요.</li>
          <li>AI 설명 아래에 근거가 된 원문 구절을 함께 보여드려요.</li>
        </ol>
      </section>

      <section className="panel">
        <h2>
          <Icon name="shield" /> AI가 하지 않는 일
        </h2>
        <ul className="bullets">
          <li>약을 먹어도 되는지 안전 여부를 판단하지 않아요.</li>
          <li>공식 정보에 없는 내용이나 새로운 상호작용을 만들어 내지 않아요.</li>
          <li>답을 찾지 못하면 의사나 약사에게 문의하도록 안내해요.</li>
        </ul>
      </section>

      <section className="panel">
        <h2>
          <Icon name="file" /> 정보 출처
        </h2>
        <ul className="bullets">
          <li>식품의약품안전처 의약품개요정보(e약은요)</li>
          <li>식품의약품안전처 의약품안전사용서비스(DUR) 품목정보</li>
        </ul>
      </section>

      <Disclaimer />
      <p className="muted small">만든 사람: 상명대학교 팀 머니머니</p>
    </div>
  );
}

const FAQ = [
  {
    q: 'AI 설명을 그대로 믿어도 되나요?',
    a: 'AI 설명은 공식 원문을 쉬운 말로 바꾼 것이에요. 설명 아래의 근거 원문을 함께 확인하고, 복용을 결정할 때는 의사나 약사와 상담하세요.',
  },
  {
    q: '함께 먹는 약 확인에서 아무것도 안 나오면 안전한 건가요?',
    a: '아니요. 공식 DUR 정보에 등록된 병용금기·성분중복이 없다는 뜻일 뿐이에요. 여러 약을 함께 먹는다면 약사에게 확인하세요.',
  },
  {
    q: '질문했는데 답을 찾지 못했다고 나와요.',
    a: '공식 의약품 정보에 없는 내용은 AI가 지어내지 않도록 했어요. 그런 질문은 의사나 약사에게 문의해 주세요.',
  },
  {
    q: '조회 기록과 관심 의약품은 어디에 저장되나요?',
    a: '지금 사용하는 기기의 브라우저에만 저장돼요. 다른 기기에서는 보이지 않아요.',
  },
];

export function FaqPage() {
  return (
    <div className="page">
      <PageTop title="자주 묻는 질문" />
      <ul className="faq">
        {FAQ.map((f) => (
          <li key={f.q}>
            <details>
              <summary>
                <Icon name="help" />
                <span>{f.q}</span>
                <Icon name="chevronDown" className="acc-chevron" />
              </summary>
              <p>{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
