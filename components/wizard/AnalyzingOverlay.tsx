"use client";

import { useState, useEffect } from "react";
import { FileSearch, Sparkles, CheckCircle } from "lucide-react";

interface AnalyzingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

const loadingMessages = [
  {
    text: "현재 외국인의 비자 발급 필요 서류들을 정확히 살펴보고 있어요...",
    icon: FileSearch,
  },
  {
    text: "현재 전달 받은 사업체의 비자 발급 필요 서류들을 정확히 살펴보고 있어요...",
    icon: FileSearch,
  },
  {
    text: "이제 고용사유서 작성을 위한 정보를 입력할 준비가 되었어요 ✨",
    icon: CheckCircle,
  },
];

export function AnalyzingOverlay({ isVisible, onComplete }: AnalyzingOverlayProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessageIndex(0);
      setProgress(0);
      return;
    }

    // 메시지 순차 변경 (각 메시지 1초씩)
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    // 진행률 애니메이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 2;
        }
        return prev;
      });
    }, 50);

    // 3초 후 완료
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const CurrentIcon = loadingMessages[currentMessageIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="max-w-lg mx-auto text-center px-8">
        {/* 애니메이션 아이콘 */}
        <div className="relative mb-8">
          {/* 외곽 빛나는 링 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-20 animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-300 to-blue-300 opacity-30 animate-pulse" />
          </div>

          {/* 메인 아이콘 컨테이너 */}
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-2xl">
            <CurrentIcon className="w-12 h-12 text-white animate-bounce" />
          </div>

          {/* 반짝이는 점들 */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
          <div className="absolute top-1/2 -right-6 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
        </div>

        {/* 로딩 문구 */}
        <div className="mb-8 min-h-[60px]">
          <p className="text-xl font-medium text-gray-800 leading-relaxed transition-all duration-300">
            {loadingMessages[currentMessageIndex].text}
          </p>
        </div>

        {/* 진행 바 */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            서류 확인 중...
          </p>
        </div>

        {/* 점 애니메이션 */}
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
