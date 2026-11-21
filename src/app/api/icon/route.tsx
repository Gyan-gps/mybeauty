import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { SALON_NAME } from '@/lib/config';
export function GET(request: NextRequest) {
  const size = request.nextUrl.searchParams.get('size') === '192' ? 192 : 512;
  return new ImageResponse(<div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#101210',
      color: '#d6b77d',
      fontFamily: 'serif',
      fontSize: size * .4,
      borderRadius: size * .15
    }}
  >{SALON_NAME[0].toLowerCase()}.</div>, { width: size, height: size });
}
