import { ImageResponse } from 'next/og';
import { SALON_NAME } from '@/lib/config';
export function GET() {
  return new ImageResponse(<div
    style={{
      width: '100%',
      height: '100%',
      background: '#101210',
      color: '#f4f0e7',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 90
    }}
  >
    <div style={{ fontSize: 28, color: '#d6b77d', marginBottom: 45 }}>{SALON_NAME}.</div>
    <div style={{ fontSize: 90, fontFamily: 'serif' }}>A fresh look.</div>
    <div style={{ fontSize: 90, fontFamily: 'serif', color: '#d6b77d' }}>A little more you.</div>
    <div style={{ fontSize: 24, marginTop: 40 }}>Hair · Beard · Skin · A moment for yourself.</div>
  </div>, { width: 1200, height: 630 });
}
