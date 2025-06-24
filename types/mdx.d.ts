// declare module "*.mdx" {
//   let MDXComponent: (props) => JSX.Element;
//   export default MDXComponent;
// }

// types/mdx.d.ts

// 이 부분은 .mdx 파일 내의 frontmatter 타입을 정의합니다.
// title, author, date 등을 여기에 명시하면 자동 완성과 타입 체크가 가능해집니다.
interface Frontmatter {
  title: string;
  author: string;
  date: string;
  tags: string[];
}

declare module "*.mdx" {
  import type { MDXProps } from "mdx/types";
  // 1. MDX 공식 라이브러리가 제공하는 타입을 사용
  export default function MDXContent(props: MDXProps): JSX.Element;

  // 2. 'frontmatter' 라는 이름으로 frontmatter 데이터를 내보낼 수 있음을 알림
  //    (많은 MDX 로더/플러그인이 이 이름으로 frontmatter를 export 합니다)
  export const frontmatter: Frontmatter;

  // 3. 'metadata' 라는 이름의 객체도 내보낼 수 있음을 알림
  //    (사용자가 직접 export한 변수를 위한 설정)
  //    any 타입 대신 더 구체적인 타입을 정의해도 좋습니다.
  export const metadata: {
    author: string;
    date: string;
  };

  // 만약 다른 변수도 export 한다면 여기에 추가할 수 있습니다.
  // export const otherVariable: SomeType;
}
