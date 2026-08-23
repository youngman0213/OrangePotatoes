import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SOOP_LIVE_API = 'https://live.sooplive.co.kr/afreeca/player_live_api.php'

export async function GET(request: NextRequest) {
  const streamerId = request.nextUrl.searchParams.get('streamerId')?.trim()

  if (!streamerId || !/^[A-Za-z0-9_]+$/.test(streamerId)) {
    return NextResponse.json(
      { error: '올바른 SOOP 스트리머 ID를 입력해 주세요.' },
      { status: 400 }
    )
  }

  try {
    const body = new URLSearchParams({
      bid: streamerId,
      type: 'live',
      pwd: '',
      player_type: 'html5',
      stream_type: 'common',
      quality: 'HD',
      mode: 'landing',
      from_api: '0',
      is_revive: 'false',
    })

    const response = await fetch(`${SOOP_LIVE_API}?bjid=${encodeURIComponent(streamerId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
      },
      body: body.toString(),
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'SOOP 방송 정보를 불러오지 못했습니다.' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const channel = data?.CHANNEL
    const broadNo = channel?.BNO ? String(channel.BNO) : ''
    const isLive = Boolean(channel && Number(channel.RESULT) === 1 && broadNo)

    if (!isLive) {
      return NextResponse.json({
        streamerId,
        isLive: false,
      })
    }

    return NextResponse.json({
      streamerId,
      isLive: true,
      broadNo,
      nickname: channel.BJNICK || streamerId,
      title: channel.TITLE || '',
      viewerCount: Number(channel.CTUSER || 0),
      chatUrl: `https://play.sooplive.com/${encodeURIComponent(streamerId)}/${encodeURIComponent(broadNo)}?vtype=chat`,
      watchUrl: `https://play.sooplive.com/${encodeURIComponent(streamerId)}/${encodeURIComponent(broadNo)}`,
    })
  } catch (error) {
    console.error('SOOP live lookup failed:', error)
    return NextResponse.json(
      { error: 'SOOP 방송 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
