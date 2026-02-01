"use client";

import { useState, useEffect, useCallback } from "react";
import SessionStatus from "@/components/SessionStatus";

interface BrandLink {
  id: string;
  url: string;
  productName: string | null;
  productPrice: string | null;
  storeName: string | null;
  imageUrls: string | null;
  status: string;
  publishedAt: string | null;
  postUrl: string | null;
  errorMessage: string | null;
  memo: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<BrandLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newMemo, setNewMemo] = useState("");
  const [adding, setAdding] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/brandlinks");
      const data = await res.json();
      if (data.success) {
        setLinks(data.data);
      }
    } catch (error) {
      console.error("링크 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // 링크 추가
  const handleAddLink = async () => {
    if (!newUrl.trim()) {
      alert("브랜드커넥트 URL을 입력하세요.");
      return;
    }

    try {
      setAdding(true);
      const res = await fetch("/api/brandlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim(), memo: newMemo.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setNewUrl("");
        setNewMemo("");
        fetchLinks();
        alert("링크가 추가되었습니다!");
      } else {
        alert(`오류: ${data.error}`);
      }
    } catch (error) {
      console.error("링크 추가 실패:", error);
      alert("링크 추가 중 오류가 발생했습니다.");
    } finally {
      setAdding(false);
    }
  };

  // 링크 삭제
  const handleDeleteLink = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/brandlinks/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchLinks();
      }
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  // 발행하기
  const handlePublish = async (id: string) => {
    if (!confirm("이 상품으로 블로그 글을 발행하시겠습니까?")) return;

    try {
      setPublishingId(id);
      const res = await fetch(`/api/brandlinks/${id}/publish`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        alert("발행이 시작되었습니다. 브라우저가 열립니다.");
        // 상태 폴링
        const pollStatus = setInterval(async () => {
          const statusRes = await fetch(`/api/brandlinks/${id}`);
          const statusData = await statusRes.json();
          
          if (statusData.data.status !== "PUBLISHING") {
            clearInterval(pollStatus);
            fetchLinks();
            setPublishingId(null);
            
            if (statusData.data.status === "PUBLISHED") {
              alert("✅ 발행 완료!");
            } else if (statusData.data.status === "FAILED") {
              alert(`❌ 발행 실패: ${statusData.data.errorMessage}`);
            }
          }
        }, 3000);
      } else {
        alert(`오류: ${data.error}`);
        setPublishingId(null);
      }
    } catch (error) {
      console.error("발행 실패:", error);
      alert("발행 중 오류가 발생했습니다.");
      setPublishingId(null);
    }
  };

  // 통계 계산
  const stats = {
    total: links.length,
    ready: links.filter((l) => l.status === "READY").length,
    published: links.filter((l) => l.status === "PUBLISHED").length,
    failed: links.filter((l) => l.status === "FAILED").length,
  };

  // 상태 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY": return "bg-blue-100 text-blue-800";
      case "PUBLISHING": return "bg-yellow-100 text-yellow-800";
      case "PUBLISHED": return "bg-green-100 text-green-800";
      case "FAILED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "READY": return "대기";
      case "PUBLISHING": return "발행중";
      case "PUBLISHED": return "발행완료";
      case "FAILED": return "실패";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                📝 네이버 블로그 자동화
              </h1>
              <p className="text-sm text-slate-500">브랜드커넥트 링크 관리 &amp; 발행</p>
            </div>
            <button
              onClick={() => fetchLinks()}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="새로고침"
            >
              🔄
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 세션 상태 */}
        <SessionStatus />

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-sm text-slate-500">전체</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.ready}</div>
            <div className="text-sm text-blue-600">대기중</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-600">{stats.published}</div>
            <div className="text-sm text-emerald-600">발행완료</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-600">실패</div>
          </div>
        </div>

        {/* 링크 추가 폼 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-3">➕ 브랜드커넥트 링크 추가</h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://naver.me/xxx 또는 브랜드커넥트 URL"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
              placeholder="메모 (선택)"
              className="w-48 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddLink}
              disabled={adding}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? "추가 중..." : "추가"}
            </button>
          </div>
        </div>

        {/* 링크 테이블 */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">상품</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">URL</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">상태</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">메모</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    로딩 중...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    등록된 링크가 없습니다. 위에서 브랜드커넥트 링크를 추가하세요.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* 이미지 썸네일 */}
                        {link.imageUrls && JSON.parse(link.imageUrls)[0] && (
                          <img
                            src={JSON.parse(link.imageUrls)[0]}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <div className="font-medium text-slate-800">
                            {link.productName || "(상품 정보 없음)"}
                          </div>
                          {link.productPrice && (
                            <div className="text-sm text-slate-500">{link.productPrice}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {link.url.length > 40 ? link.url.substring(0, 40) + "..." : link.url}
                      </a>
                      {link.postUrl && (
                        <div className="mt-1">
                          <a
                            href={link.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline text-xs"
                          >
                            📄 발행된 글 보기
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(link.status)}`}>
                        {getStatusText(link.status)}
                      </span>
                      {link.errorMessage && (
                        <div className="text-xs text-red-500 mt-1" title={link.errorMessage}>
                          ⚠️
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-500">
                      {link.memo || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* 발행하기 버튼 */}
                        {link.status === "READY" && (
                          <button
                            onClick={() => handlePublish(link.id)}
                            disabled={publishingId === link.id}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {publishingId === link.id ? "⏳" : "🚀 발행"}
                          </button>
                        )}
                        
                        {/* 재발행 */}
                        {link.status === "FAILED" && (
                          <button
                            onClick={() => handlePublish(link.id)}
                            disabled={publishingId === link.id}
                            className="px-3 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 transition-colors"
                          >
                            🔄 재시도
                          </button>
                        )}
                        
                        {/* 삭제 */}
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 사용 안내 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="font-medium text-slate-800 mb-2">💡 사용 방법</h3>
          <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
            <li>먼저 <code className="bg-slate-200 px-1 rounded">npm run login</code>으로 네이버 로그인</li>
            <li>브랜드커넥트 링크를 추가 (https://naver.me/xxx 형태)</li>
            <li>🚀 발행 버튼으로 블로그 글 자동 작성 &amp; 발행</li>
          </ol>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-slate-500">
          네이버 블로그 자동화 시스템 • 브랜드커넥트
        </div>
      </footer>
    </div>
  );
}
