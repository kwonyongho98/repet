import { useState } from "react";
import { Button, Input, Card, Avatar, Badge } from "../components/common";

export default function TestPage() {
  const [name, setName] = useState("");

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-4xl font-bold text-gray-900">
        Repet 컴포넌트 테스트
      </h1>

      {/* Avatar & Badge 테스트 */}
      <Card title="Avatar & Badge" subtitle="프로필 이미지와 상태 뱃지">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar size="sm" fallback="S" />
            <Avatar size="md" fallback="M" />
            <Avatar size="lg" fallback="L" />
            <Avatar size="xl" fallback="XL" />
          </div>

          <div className="flex items-center gap-4">
            <Avatar size="sm" name="김철수" />
            <Avatar size="md" name="이영희" />
            <Avatar size="lg" name="박민수" />
            <Avatar size="xl" name="최지은" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">진행중</Badge>
            <Badge variant="success">완료</Badge>
            <Badge variant="warning">대기</Badge>
            <Badge variant="danger">취소</Badge>
            <Badge variant="info">정보</Badge>
          </div>
        </div>
      </Card>

      <Card title="Button 컴포넌트" subtitle="다양한 버튼 스타일">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="sm" variant="primary">
              Small
            </Button>
            <Button size="md" variant="primary">
              Medium
            </Button>
            <Button size="lg" variant="primary">
              Large
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" isLoading>
              Loading...
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Input 컴포넌트" subtitle="입력 필드 예시">
        <div className="space-y-4">
          <Input
            label="반려견 이름"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText="반려견의 이름을 입력해주세요"
          />

          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            helperText="이메일 주소를 입력하세요"
          />

          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호"
            helperText="8자 이상 입력하세요"
          />

          <Button variant="primary" disabled={!name}>
            저장하기
          </Button>
        </div>
      </Card>
    </div>
  );
}
