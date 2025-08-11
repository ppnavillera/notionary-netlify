// app/components/Image.tsx

// props 타입을 정의합니다.
interface ImageProps {
  src: string;
  alt: string;
}

export default function Image({ src, alt }: ImageProps) {
  return (
    // 이미지 주변에 일관된 여백이나 스타일을 적용할 수 있습니다.
    <div className="flex justify-center my-8">
      <img
        src={src}
        alt={alt}
        loading="lazy" // 레이지 로딩: 이미지가 화면에 보일 때 로드
        className="h-auto max-w-full rounded-lg shadow-xl" // 모든 이미지에 적용될 기본 스타일
      />
    </div>
  );
}
