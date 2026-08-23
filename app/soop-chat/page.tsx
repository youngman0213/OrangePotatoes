'use client'

import { FormEvent, useMemo, useState } from 'react'

const DEFAULT_STREAMERS = [
  { id: 'kimma', label: '키마' },
  { id: 'ddinggul', label: '띵귤' },
  { id: 'chaenna', label: '챈나' },
  { id: 'somjumeok', label: '솜주먹' },
  { id: 'yeonchorok', label: '연초록' },
]

type LiveInfo = {
  streamerId: string
  isLive: boolean
  broadNo?: string
  nickname?: string
  title?: string
  viewerCount?: number
  chatUrl?: string
  watchUrl?: string
  error?: string
}

export default function SoopChatPage() {
  const [streamerId, setStreamerId] = useState('')
  const [live, setLive] = useState<LiveInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const viewerText = useMemo(() => {
    if (!live?.isLive) return ''
    return new Intl.NumberFormat('ko-KR').format(live.viewerCount || 0)
  }, [live])

  async function loadStreamer(id: string) {
    const nextId = id.trim()
    if (!nextId) return

    setStreamerId(nextId)
    setLoading(true)
    setError('')
    setLive(null)

    try {
      const response = await fetch(`/api/soop-live?streamerId=${encodeURIComponent(nextId)}`, {
        cache: 'no-store',
      })
      const data = (await response.json()) as LiveInfo

      if (!response.ok) {
        throw new Error(data.error || '방송 정보를 불러오지 못했습니다.')
      }

      setLive(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    void loadStreamer(streamerId)
  }

  return (
    <main className="min-h-screen bg-[#0b0d11] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-3 py-4 sm:px-5 sm:py-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2cff9b]">Personal viewer</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">SOOP CHAT</h1>
          </div>
          {live?.isLive && (
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">● LIVE</span>
          )}
        </header>

        <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={streamerId}
              onChange={(e) => setStreamerId(e.target.value)}
              placeholder="SOOP 스트리머 ID"
              autoCapitalize="none"
              autoCorrect="off"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base outline-none placeholder:text-white/35 focus:border-[#2cff9b]/60"
            />
            <button
              type="submit"
              disabled={loading || !streamerId.trim()}
              className="rounded-xl bg-[#2cff9b] px-4 py-3 font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? '확인 중' : '열기'}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {DEFAULT_STREAMERS.map((streamer) => (
              <button
                key={streamer.id}
                type="button"
                onClick={() => void loadStreamer(streamer.id)}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                {streamer.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {live && !live.isLive && (
          <div className="flex min-h-64 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div>
              <div className="mb-3 text-3xl">⚫</div>
              <p className="font-semibold">현재 방송 중이 아닙니다.</p>
              <p className="mt-2 text-sm text-white/45">{live.streamerId}</p>
            </div>
          </div>
        )}

        {live?.isLive && live.chatUrl && (
          <section className="flex min-h-[620px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11141a]">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{live.nickname || live.streamerId}</p>
                  <p className="mt-0.5 truncate text-sm text-white/55">{live.title}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-white/45">
                  <div>시청자 {viewerText}명</div>
                  <div className="mt-1">#{live.broadNo}</div>
                </div>
              </div>
            </div>

            <iframe
              key={live.chatUrl}
              src={live.chatUrl}
              title={`${live.nickname || live.streamerId} SOOP 채팅`}
              className="min-h-[540px] w-full flex-1 border-0 bg-white"
              allow="clipboard-read; clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-xs text-white/45">
              <span>로그인/채팅 전송은 SOOP 세션을 그대로 사용합니다.</span>
              <div className="flex gap-2">
                <a
                  href={live.chatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/75"
                >
                  채팅 새 창
                </a>
                {live.watchUrl && (
                  <a
                    href={live.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/10 px-3 py-2 text-white/75"
                  >
                    방송 보기
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {!live && !loading && !error && (
          <div className="flex min-h-64 flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            스트리머 ID를 입력하거나 위 버튼에서 선택하세요.
          </div>
        )}

        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/30">
          개인용 채팅 뷰어 · SOOP 비밀번호를 이 사이트에 저장하지 않습니다.
        </p>
      </div>
    </main>
  )
}
